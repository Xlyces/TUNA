import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

/**
 * Server-safe Firebase config (no Vite `import.meta.env`).
 *
 * NOTE: This uses the Firebase *client* SDK in Node for convenience in this demo.
 * For production-grade server auth, prefer firebase-admin.
 */

// Check if Firebase is configured
const hasFirebaseConfig = !!(
  process.env.FIREBASE_API_KEY &&
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_AUTH_DOMAIN
);

const firebaseConfig = hasFirebaseConfig
  ? {
      apiKey: process.env.FIREBASE_API_KEY!,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN!,
      projectId: process.env.FIREBASE_PROJECT_ID!,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.FIREBASE_APP_ID || "",
    }
  : {
      // Demo/fallback config for when Firebase isn't configured
      apiKey: "demo-api-key",
      authDomain: "demo-tuna.firebaseapp.com",
      projectId: "demo-tuna",
      storageBucket: "demo-tuna.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:demo",
    };

let app;
try {
  app =
    getApps().length === 0
      ? initializeApp(firebaseConfig, hasFirebaseConfig ? undefined : "demo")
      : getApps()[0];
} catch (error: any) {
  console.error("Firebase initialization error:", error.message);
  // Fallback to demo app if initialization fails
  try {
    app = initializeApp(
      {
        apiKey: "demo",
        authDomain: "demo.firebaseapp.com",
        projectId: "demo",
        storageBucket: "demo.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:demo",
      },
      "demo-fallback"
    );
    console.warn("⚠️ Using demo Firebase config. Set FIREBASE_* environment variables for production.");
  } catch (fallbackError: any) {
    console.error("Firebase fallback initialization failed:", fallbackError.message);
    // Re-throw only if both attempts fail
    throw error;
  }
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);


