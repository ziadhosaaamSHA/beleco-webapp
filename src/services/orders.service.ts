import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase/config";
import type { Order, OrderStatus } from "@/types/order.types";

const ORDERS_COL = "orders";
const GUEST_ORDERS_KEY = "beleco_guest_order_ids";

// Helper to parse Firestore timestamps, millisecond numbers, ISO strings, or nested status history
function parseTimestamp(val: any, fallbackVal?: any): number {
  if (val !== undefined && val !== null) {
    if (typeof val === "number" && !isNaN(val)) return val;
    if (typeof val === "string") {
      const num = Number(val);
      if (!isNaN(num) && num > 1000000000) return num;
      const parsed = Date.parse(val);
      if (!isNaN(parsed)) return parsed;
    }
    if (typeof val === "object") {
      if (typeof val.toMillis === "function") return val.toMillis();
      if (typeof val.toDate === "function") return val.toDate().getTime();
      if (typeof val.seconds === "number") return val.seconds * 1000 + (val.nanoseconds ? val.nanoseconds / 1000000 : 0);
    }
  }
  if (fallbackVal !== undefined && fallbackVal !== null) {
    return parseTimestamp(fallbackVal);
  }
  return 0;
}

// Helper to map and sort order documents consistently from newest to oldest
function mapAndSortOrders(docs: any[]): Order[] {
  const list = docs.map((d) => {
    const data = typeof d.data === "function" ? d.data() : d;
    const historyTimestamp = Array.isArray(data.statusHistory) && data.statusHistory[0]?.timestamp;
    const createdAt = parseTimestamp(data.createdAt, historyTimestamp || 0);
    return {
      id: d.id,
      ...data,
      createdAt,
    } as Order;
  });

  return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

// Helper to remove any undefined fields before writing to Firestore
function sanitizeFirestoreData<T extends Record<string, any>>(obj: T): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeFirestoreData(item));
  }

  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = sanitizeFirestoreData(value);
    }
  }
  return cleaned;
}

export const ordersService = {
  // Subscribe to all orders (Admin only) - newest to oldest
  subscribeAllOrders(callback: (orders: Order[]) => void, onError?: (err: Error) => void) {
    const q = query(collection(db, ORDERS_COL), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        const orders = mapAndSortOrders(snap.docs);
        callback(orders);
      },
      (err) => {
        if (onError) {
          onError(err);
        } else {
          console.warn("Orders subscription error:", err.message);
        }
      }
    );
  },

  // Subscribe to customer's own orders (User UID or local guest order IDs) - newest to oldest
  subscribeCustomerOrders(
    customerUid?: string,
    callback: (orders: Order[]) => void = () => {},
    onError?: (err: Error) => void
  ) {
    let localOrderIds: string[] = [];
    try {
      const saved = localStorage.getItem(GUEST_ORDERS_KEY);
      if (saved) localOrderIds = JSON.parse(saved);
      if (!Array.isArray(localOrderIds)) localOrderIds = [];
    } catch {}

    if (customerUid) {
      const q = query(
        collection(db, ORDERS_COL),
        where("customerUid", "==", customerUid)
      );
      return onSnapshot(
        q,
        (snap) => {
          const orders = mapAndSortOrders(snap.docs);
          callback(orders);
        },
        onError
      );
    }

    // For guest users with local order IDs
    if (localOrderIds.length > 0) {
      const q = query(collection(db, ORDERS_COL));
      return onSnapshot(
        q,
        (snap) => {
          const all = mapAndSortOrders(snap.docs);
          const filtered = all.filter((o) => localOrderIds.includes(o.id));
          filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          callback(filtered);
        },
        onError
      );
    }

    callback([]);
    return () => {};
  },

  // Get a single order by ID
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const docSnap = await getDoc(doc(db, ORDERS_COL, orderId));
      if (!docSnap.exists()) return null;
      const data = docSnap.data();
      const historyTimestamp = Array.isArray(data.statusHistory) && data.statusHistory[0]?.timestamp;
      const createdAt = parseTimestamp(data.createdAt, historyTimestamp || 0);
      return { id: docSnap.id, ...data, createdAt } as Order;
    } catch (e) {
      console.error("Error fetching order by ID:", e);
      return null;
    }
  },

  // Search orders by phone or ID - newest to oldest
  async searchOrders(queryStr: string): Promise<Order[]> {
    const trimmed = queryStr.trim().toLowerCase();
    if (!trimmed) return [];

    try {
      const snap = await getDocs(query(collection(db, ORDERS_COL)));
      const allOrders = mapAndSortOrders(snap.docs);
      return allOrders.filter(
        (o) =>
          o.id.toLowerCase().includes(trimmed) ||
          o.customerInfo?.phone?.includes(trimmed) ||
          o.customerInfo?.name?.toLowerCase().includes(trimmed)
      );
    } catch (e) {
      console.error("Error searching orders:", e);
      return [];
    }
  },

  // Place a new order
  async createOrder(
    orderData: Omit<Order, "id" | "createdAt" | "status" | "statusHistory"> & { status?: OrderStatus }
  ): Promise<string> {
    const now = Date.now();
    const initialStatus: OrderStatus = orderData.status || "awaiting_calculation";

    const payload = {
      ...orderData,
      status: initialStatus,
      statusHistory: [
        {
          status: initialStatus,
          timestamp: now,
          note: "تم استلام الطلب",
        },
      ],
      createdAt: now,
    };

    const cleanedPayload = sanitizeFirestoreData(payload);
    const docRef = await addDoc(collection(db, ORDERS_COL), cleanedPayload);

    // Save ID locally for guest user tracking
    try {
      const saved = localStorage.getItem(GUEST_ORDERS_KEY);
      const ids: string[] = saved ? JSON.parse(saved) : [];
      if (!ids.includes(docRef.id)) {
        ids.unshift(docRef.id);
        localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(ids));
      }
    } catch {}

    return docRef.id;
  },

  // Update order status (Admin)
  async updateStatus(orderId: string, newStatus: OrderStatus, note?: string): Promise<void> {
    const orderDoc = await getDoc(doc(db, ORDERS_COL, orderId));
    if (!orderDoc.exists()) throw new Error("Order not found");

    const history = (orderDoc.data()?.statusHistory || []) as Order["statusHistory"];
    history.push({
      status: newStatus,
      timestamp: Date.now(),
      note: note || `تم تغيير الحالة إلى ${newStatus}`,
    });

    await updateDoc(doc(db, ORDERS_COL, orderId), {
      status: newStatus,
      statusHistory: history,
      updatedAt: Date.now(),
    });
  },
};
