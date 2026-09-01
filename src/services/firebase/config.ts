import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const ADMIN_EMAILS = [
  "belleco.eg@gmail.com",
  "admin@beleco-admin.local",
  "ziadhh2003@gmail.com",
  "admin@test.com",
];

const firebaseConfig = {
  apiKey: "AIzaSyAhu8GZoXw-_MdqGPt63ZDB4Srpfzq-Cm4",
  authDomain: "beleco-orders.firebaseapp.com",
  projectId: "beleco-orders",
  storageBucket: "beleco-orders.firebasestorage.app",
  messagingSenderId: "865521869863",
  appId: "1:865521869863:web:7dcfb86a4e9af542131a02"
};

// Initialize Firebase singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const storage = getStorage(app);

// Enable offline persistence for POS & weak connectivity
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  });
} catch {
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;
