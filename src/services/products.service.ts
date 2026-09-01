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
  getDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase/config";
import type { Product, ProductFilterDTO } from "@/types/product.types";

const PRODUCTS_COL = "products";

export const productsService = {
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
    let q = query(collection(db, PRODUCTS_COL), orderBy("createdAt", "desc"));

    return onSnapshot(
      q,
      (snap) => {
        let items = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Product[];

        // Client-side in-memory filter for flexible matching
        if (filters?.category && filters.category !== "all") {
          items = items.filter((p) => p.category === filters.category);
        }
        if (filters?.placement && filters.placement !== "all") {
          items = items.filter((p) => p.placement === filters.placement);
        }
        if (filters?.searchQuery) {
          const s = filters.searchQuery.toLowerCase().trim();
          items = items.filter((p) => p.name.toLowerCase().includes(s));
        }

        callback?.(items);
      },
      onError
    );
  },

  // Add a new storefront product
  async addProduct(product: Omit<Product, "id" | "createdAt">): Promise<string> {
    const docRef = await addDoc(collection(db, PRODUCTS_COL), {
      ...product,
      createdAt: Date.now(),
    });
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

  // Delete product
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
};
