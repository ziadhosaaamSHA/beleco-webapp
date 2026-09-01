import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  UserCredential,
} from "firebase/auth";
import { auth } from "@/services/firebase/config";

const googleProvider = new GoogleAuthProvider();

export const authService = {
  /**
   * Sign in with Google Popup
   */
  async loginWithGoogle(): Promise<UserCredential> {
    return signInWithPopup(auth, googleProvider);
  },

  /**
   * Sign in with Email and Password
   */
  async loginWithEmail(email: string, pass: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email.trim(), pass);
  },

  /**
   * Register with Email, Password, and Display Name
   */
  async registerWithEmail(email: string, pass: string, displayName?: string): Promise<UserCredential> {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (displayName && cred.user) {
      await updateProfile(cred.user, { displayName: displayName.trim() });
    }
    return cred;
  },

  /**
   * Sign out current user
   */
  async logout(): Promise<void> {
    return signOut(auth);
  },
};
