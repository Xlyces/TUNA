import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./config.server";

export interface UserProfileUpdates {
  [key: string]: any;
}

export async function updateUserProfile(uid: string, updates: UserProfileUpdates): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    {
      ...updates,
      updatedAt: new Date(),
    },
    { merge: true }
  );
}

export async function getUserProfile(uid: string): Promise<any | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}


