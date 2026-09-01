import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  writeBatch
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase/config";
import type { BazaarProduct, BazaarSale } from "@/types/bazaar.types";

const PRODUCTS_COL = "bazaarProducts";
const SALES_COL = "bazaarSales";

export const bazaarService = {
  // Listen to all bazaar products in real-time
  subscribeProducts(callback: (products: BazaarProduct[]) => void, onError?: (err: Error) => void) {
    const q = query(collection(db, PRODUCTS_COL), orderBy("name"));
    return onSnapshot(
      q,
      (snap) => {
        const products = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as BazaarProduct[];
        callback(products);
      },
      onError
    );
  },

  // Listen to all live sales in real-time
  subscribeSales(callback: (sales: BazaarSale[]) => void, onError?: (err: Error) => void) {
    const q = query(collection(db, SALES_COL), orderBy("soldAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        const sales = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as BazaarSale[];
        callback(sales);
      },
      onError
    );
  },

  // Record a new sale
  async recordSale(saleData: Omit<BazaarSale, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, SALES_COL), {
      ...saleData,
      soldAt: saleData.soldAt || Date.now(),
    });
    return docRef.id;
  },

  // Delete / Refund a recorded sale
  async refundSale(saleId: string): Promise<void> {
    await deleteDoc(doc(db, SALES_COL, saleId));
  },

  // Add a single bazaar product
  async addProduct(product: Omit<BazaarProduct, "id" | "createdAt">): Promise<string> {
    const docRef = await addDoc(collection(db, PRODUCTS_COL), {
      ...product,
      createdAt: Date.now(),
    });
    return docRef.id;
  },

  // Bulk import products from Excel
  async bulkImportProducts(products: Array<Omit<BazaarProduct, "id" | "createdAt">>): Promise<number> {
    const batch = writeBatch(db);
    let count = 0;

    for (const p of products) {
      const newDocRef = doc(collection(db, PRODUCTS_COL));
      batch.set(newDocRef, {
        ...p,
        createdAt: Date.now(),
      });
      count++;
    }

    await batch.commit();
    return count;
  },

  // Delete a bazaar product
  async deleteProduct(productId: string, imagePath?: string): Promise<void> {
    await deleteDoc(doc(db, PRODUCTS_COL, productId));
    if (imagePath) {
      try {
        await deleteObject(ref(storage, imagePath));
      } catch {
        // Ignore storage delete errors if file missing
      }
    }
  },

  // Upload bazaar product photo
  async uploadProductPhoto(productId: string, file: File): Promise<string> {
    const filePath = `bazaarProducts/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(storageRef);

    await updateDoc(doc(db, PRODUCTS_COL, productId), {
      imageUrl,
      imagePath: filePath,
    });

    return imageUrl;
  },
};
