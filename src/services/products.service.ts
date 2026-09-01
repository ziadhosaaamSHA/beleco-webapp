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
  getDocs,
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase/config";
import type { Product, ProductFilterDTO } from "@/types/product.types";

const PRODUCTS_COL = "products";
const EXTRACT_URL = "https://us-central1-beleco-orders.cloudfunctions.net/extractProductInfo";

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

export const productsService = {
  // Extract product details from external merchant URL (Shein, Trendyol, Zara, etc.)
  async extractProductInfo(url: string): Promise<{
    title?: string;
    price?: string | number;
    color?: string;
    size?: string;
    image?: string;
  }> {
    const res = await fetch(EXTRACT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to extract product data");
    return data;
  },

  // Get a single product by ID
  async getProductById(productId: string): Promise<Product | null> {
    const docRef = doc(db, PRODUCTS_COL, productId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Product;
  },

  // Subscribe to all storefront products
  subscribeProducts(
    filters?: ProductFilterDTO,
    callback?: (products: Product[]) => void,
    onError?: (err: Error) => void
  ) {
    const q = query(collection(db, PRODUCTS_COL), orderBy("createdAt", "desc"));

    return onSnapshot(
      q,
      (snap) => {
        let items = snap.docs.map((d) => {
          const data = d.data();
          let createdAt = typeof data.createdAt === "number" ? data.createdAt : Date.now();
          if (data.createdAt && typeof data.createdAt.toMillis === "function") {
            createdAt = data.createdAt.toMillis();
          }
          return {
            id: d.id,
            ...data,
            createdAt,
          } as Product;
        });

        // Client-side in-memory filter for flexible matching
        if (filters?.category && filters.category !== "all") {
          items = items.filter((p) => p.category === filters.category);
        }
        if (filters?.placement && filters.placement !== "all") {
          items = items.filter(
            (p) =>
              p.placement === filters.placement ||
              (Array.isArray(p.placements) && p.placements.includes(filters.placement as string))
          );
        }
        if (filters?.searchQuery) {
          const s = filters.searchQuery.toLowerCase().trim();
          items = items.filter((p) => p.name.toLowerCase().includes(s));
        }

        callback?.(items);
      },
      (err) => {
        if (onError) {
          onError(err);
        } else {
          console.warn("Products subscription error:", err.message);
        }
      }
    );
  },

  // Add a new storefront product
  async addProduct(product: Omit<Product, "id" | "createdAt">): Promise<string> {
    const payload = sanitizeFirestoreData({
      ...product,
      createdAt: serverTimestamp(),
    });
    const docRef = await addDoc(collection(db, PRODUCTS_COL), payload);
    return docRef.id;
  },

  // Upload product image to Firebase Storage
  async uploadImage(file: File): Promise<{ imageUrl: string; imagePath: string }> {
    const imagePath = `products/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, imagePath);
    await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(storageRef);
    return { imageUrl, imagePath };
  },

  // Update existing product
  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    const docRef = doc(db, PRODUCTS_COL, productId);
    const sanitized = sanitizeFirestoreData({
      ...updates,
      updatedAt: serverTimestamp(),
    });
    await updateDoc(docRef, sanitized);
  },

  // Delete product
  async deleteProduct(productId: string, imagePath?: string | null): Promise<void> {
    await deleteDoc(doc(db, PRODUCTS_COL, productId));
    if (imagePath) {
      try {
        await deleteObject(ref(storage, imagePath));
      } catch {
        // Ignore storage delete errors if file missing
      }
    }
  },
};
