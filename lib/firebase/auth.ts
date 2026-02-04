import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged,
  updateProfile,
  verifyIdToken as verifyClientToken,
} from "firebase/auth";
import { auth } from "./config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./config";

/**
 * Verify Firebase ID token (server-side)
 * Note: In production, use Firebase Admin SDK for proper verification
 * This is a simplified version for development
 */
export async function verifyIdToken(token: string): Promise<{ uid: string; email?: string }> {
  // For development/emulator mode, we'll decode the JWT to get the user ID
  // In production, you should use Firebase Admin SDK
  if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === "true") {
    try {
      // Decode JWT token (without signature verification in emulator mode)
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid token format");
      }
      
      // Decode the payload (second part of JWT)
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
      const uid = payload.user_id || payload.sub || payload.uid;
      const email = payload.email;
      
      if (!uid) {
        throw new Error("Token does not contain user ID");
      }
      
      console.log("✅ Token verified (emulator mode):", { uid, email });
      return { uid, email };
    } catch (error: any) {
      console.error("❌ Token verification failed:", error.message);
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }
  
  // In production, this should use Firebase Admin SDK
  // For now, we'll throw an error to indicate proper setup is needed
  throw new Error("Token verification requires Firebase Admin SDK in production");
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone852: string;
  role: "tutor" | "parent" | "admin";
  stripeCustomerId?: string;
  stripeAccountId?: string;
  tutorTokenId?: number;
  walletAddress?: string;
  subjects?: string[];
  hourlyRate?: number;
  walletCredits: number;
  profilePicture?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Register a new user
 */
export async function registerUser(
  email: string,
  password: string,
  name: string,
  phone852: string,
  role: "tutor" | "parent" | "admin"
): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  // Update display name
  await updateProfile(user, { displayName: name });

  // Create user profile in Firestore
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email || "",
    name,
    phone852,
    role,
    walletCredits: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(doc(db, "users", user.uid), userProfile);

  return user;
}

/**
 * Sign in with email and password
 */
export async function signInUser(
  email: string,
  password: string
): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (!userDoc.exists()) {
    return null;
  }
  return userDoc.data() as UserProfile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    {
      ...updates,
      updatedAt: new Date(),
    },
    { merge: true }
  );
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

