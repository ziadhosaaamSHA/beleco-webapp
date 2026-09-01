import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  setDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase/config";
import type { Reel, ReelComment } from "@/types/reel.types";

const REELS_COL = "reels";

export const reelsService = {
  // Subscribe to all Reels feed
  subscribeReels(callback: (reels: Reel[]) => void, onError?: (err: Error) => void) {
    const q = query(collection(db, REELS_COL), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        const reels = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Reel[];
        callback(reels);
      },
      onError
    );
  },

  // Add a new Reel video
  async uploadReel(
    file: File,
    metadata: { creator: string; caption: string; taggedProduct?: Reel["taggedProduct"] }
  ): Promise<string> {
    const videoPath = `reels/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, videoPath);
    await uploadBytes(storageRef, file);
    const videoUrl = await getDownloadURL(storageRef);

    const docRef = await addDoc(collection(db, REELS_COL), {
      videoUrl,
      videoPath,
      creator: metadata.creator,
      caption: metadata.caption,
      taggedProduct: metadata.taggedProduct || null,
      likesCount: 0,
      commentsCount: 0,
      createdAt: Date.now(),
    });

    return docRef.id;
  },

  // Toggle Like on a reel
  async toggleLike(reelId: string, uid: string, isLiked: boolean): Promise<void> {
    const likeDocRef = doc(db, REELS_COL, reelId, "likes", uid);
    if (isLiked) {
      await deleteDoc(likeDocRef);
    } else {
      await setDoc(likeDocRef, { likedAt: Date.now() });
    }
  },

  // Add Comment on a reel
  async addComment(reelId: string, uid: string, userName: string, text: string): Promise<string> {
    const commentsCol = collection(db, REELS_COL, reelId, "comments");
    const docRef = await addDoc(commentsCol, {
      reelId,
      uid,
      userName,
      text,
      createdAt: Date.now(),
    });
    return docRef.id;
  },

  // Subscribe to comments on a reel
  subscribeComments(reelId: string, callback: (comments: ReelComment[]) => void) {
    const q = query(collection(db, REELS_COL, reelId, "comments"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      const comments = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ReelComment[];
      callback(comments);
    });
  },

  // Delete Reel
  async deleteReel(reelId: string, videoPath?: string): Promise<void> {
    await deleteDoc(doc(db, REELS_COL, reelId));
    if (videoPath) {
      try {
        await deleteObject(ref(storage, videoPath));
      } catch {
        // Ignore file delete errors if missing
      }
    }
  },
};
