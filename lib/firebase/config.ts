import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, Firestore, connectFirestoreEmulator, initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getStorage, FirebaseStorage, connectStorageEmulator } from "firebase/storage";
import { getDatabase, Database, connectDatabaseEmulator } from "firebase/database";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let realtimeDb: Database;

// Use emulator-friendly defaults if env vars are missing
// Support both Vite (client) and Node.js (server) environments
const isClient = typeof window !== 'undefined';
const env = isClient ? import.meta.env : process.env;
// For server-side, default to emulator in development mode
// Check explicit flag first, then check if in dev mode without API keys, or just default to emulator in dev
const explicitEmulatorFlag = isClient 
  ? (env.VITE_FIREBASE_USE_EMULATOR === 'true')
  : (env.FIREBASE_USE_EMULATOR === 'true');
const inDevMode = isClient 
  ? (env.MODE === 'development')
  : (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV || process.env.NODE_ENV === ''); // Default to dev if NODE_ENV not set
const hasApiKey = isClient 
  ? !!env.VITE_FIREBASE_API_KEY
  : !!process.env.FIREBASE_API_KEY;
// Server always uses emulator if in dev mode OR if NODE_ENV is not set (assume development)
const useEmulator = explicitEmulatorFlag || 
                    (inDevMode && !hasApiKey) ||
                    (!isClient && (inDevMode || !process.env.NODE_ENV)); // Server uses emulator in dev or if NODE_ENV not set

// #region agent log
const envVars = {
  apiKey: isClient ? env.VITE_FIREBASE_API_KEY : process.env.FIREBASE_API_KEY,
  authDomain: isClient ? env.VITE_FIREBASE_AUTH_DOMAIN : process.env.FIREBASE_AUTH_DOMAIN,
  projectId: isClient ? env.VITE_FIREBASE_PROJECT_ID : process.env.FIREBASE_PROJECT_ID,
  mode: isClient ? env.MODE : process.env.NODE_ENV,
  isClient,
  useEmulator,
  hasApiKey,
  inDevMode,
};
if (typeof window !== 'undefined') {
  console.log('🔍 Firebase Config Debug:', {
    hasApiKey: !!envVars.apiKey,
    apiKeyLength: envVars.apiKey?.length || 0,
    apiKeyPrefix: envVars.apiKey?.substring(0, 10) || 'none',
    mode: envVars.mode,
    useEmulator: envVars.useEmulator,
    envVarsPresent: {
      apiKey: !!envVars.apiKey,
      authDomain: !!envVars.authDomain,
      projectId: !!envVars.projectId,
    }
  });
  fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'config.ts:33',message:'Client Firebase config values',data:envVars,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
}
// #endregion

// Get raw env values for validation
const rawApiKey = isClient ? env.VITE_FIREBASE_API_KEY : process.env.FIREBASE_API_KEY;
const rawAuthDomain = isClient ? env.VITE_FIREBASE_AUTH_DOMAIN : process.env.FIREBASE_AUTH_DOMAIN;
const rawProjectId = isClient ? env.VITE_FIREBASE_PROJECT_ID : process.env.FIREBASE_PROJECT_ID;

// Warn if missing in production
if (typeof window !== 'undefined' && !useEmulator && !rawApiKey) {
  console.error('❌ Firebase API key is missing!');
  console.error('Please set VITE_FIREBASE_API_KEY in Cloudflare Pages environment variables.');
  console.error('Go to: Cloudflare Dashboard → Pages → Your Project → Settings → Environment Variables');
}

const firebaseConfig = {
  apiKey: rawApiKey || (useEmulator ? "demo-api-key" : ""),
  authDomain: rawAuthDomain || (useEmulator ? "demo-tuna.firebaseapp.com" : ""),
  projectId: rawProjectId || (useEmulator ? "demo-tuna" : ""),
  storageBucket: (isClient ? env.VITE_FIREBASE_STORAGE_BUCKET : process.env.FIREBASE_STORAGE_BUCKET) || (useEmulator ? "demo-tuna.appspot.com" : ""),
  messagingSenderId: (isClient ? env.VITE_FIREBASE_MESSAGING_SENDER_ID : process.env.FIREBASE_MESSAGING_SENDER_ID) || (useEmulator ? "123456789" : ""),
  appId: (isClient ? env.VITE_FIREBASE_APP_ID : process.env.FIREBASE_APP_ID) || (useEmulator ? "1:123456789:web:abc123" : ""),
};

// #region agent log
if (typeof window !== 'undefined') {
  console.log('🔍 Firebase Config Object:', {
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'EMPTY',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    hasValidConfig: !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'demo-api-key',
  });
  fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'config.ts:50',message:'Client Firebase config object',data:{apiKeyPresent:!!firebaseConfig.apiKey,apiKeyIsDemo:firebaseConfig.apiKey==='demo-api-key',authDomain:firebaseConfig.authDomain,projectId:firebaseConfig.projectId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
}
// #endregion

// Initialize Firebase only if it hasn't been initialized
if (getApps().length === 0) {
  try {
    // Only initialize if we have required config or are using emulator
    if (useEmulator || firebaseConfig.apiKey) {
      // #region agent log
      if (typeof window !== 'undefined') {
        console.log('🚀 Initializing Firebase with config:', {
          hasApiKey: !!firebaseConfig.apiKey,
          useEmulator,
          willUseDemo: !firebaseConfig.apiKey && !useEmulator,
        });
        fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'config.ts:65',message:'About to initialize Firebase',data:{hasApiKey:!!firebaseConfig.apiKey,apiKeyEmpty:!firebaseConfig.apiKey,useEmulator,willFail:!firebaseConfig.apiKey && !useEmulator},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      }
      // #endregion
      app = initializeApp(firebaseConfig);
      // #region agent log
      if (typeof window !== 'undefined') {
        console.log('✅ Firebase initialized successfully');
        fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'config.ts:72',message:'Firebase initialized successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      }
      // #endregion
    } else {
      // #region agent log
      if (typeof window !== 'undefined') {
        console.warn('⚠️ No Firebase API key found, using demo config (will not work for auth)');
        fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'config.ts:78',message:'Using demo Firebase config (no API key)',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      }
      // #endregion
      // Create a minimal app for SSR safety
      app = initializeApp({
        apiKey: "demo",
        authDomain: "demo.firebaseapp.com",
        projectId: "demo",
        storageBucket: "demo.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:demo"
      }, "demo");
    }
  } catch (error: any) {
    // #region agent log
    if (typeof window !== 'undefined') {
      console.error("❌ Firebase initialization error:", error.message);
      fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'config.ts:90',message:'Firebase initialization error',data:{error:error.message,errorCode:error.code,apiKeyPresent:!!firebaseConfig.apiKey,apiKeyValue:firebaseConfig.apiKey?.substring(0,10)||'empty'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    }
    // #endregion
    console.error("Firebase initialization error:", error);
    // Fallback to demo app if initialization fails
    try {
      app = initializeApp({
        apiKey: "demo",
        authDomain: "demo.firebaseapp.com",
        projectId: "demo",
        storageBucket: "demo.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:demo"
      }, "demo-fallback");
    } catch (fallbackError: any) {
      console.error("Firebase fallback initialization also failed:", fallbackError);
      // Re-throw only if both attempts fail
      throw error;
    }
  }
} else {
  app = getApps()[0];
}

auth = getAuth(app);

// Initialize Firestore - use initializeFirestore in emulator mode to avoid persistence issues
if (typeof window !== 'undefined' && (useEmulator || (import.meta.env.MODE === 'development' && !import.meta.env.VITE_FIREBASE_API_KEY))) {
  try {
    // Initialize Firestore with unlimited cache for emulator (avoids offline persistence issues)
    db = initializeFirestore(app, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    });
  } catch (e: any) {
    // If already initialized, get the existing instance
    if (e.message?.includes('already been initialized')) {
      db = getFirestore(app);
    } else {
      // Fallback to regular initialization
      db = getFirestore(app);
    }
  }
} else {
  db = getFirestore(app);
}

storage = getStorage(app);
realtimeDb = getDatabase(app);

// #region agent log
if (typeof window === 'undefined') {
  const dbSettings = (db as any)._delegate?._settings;
  fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'config.ts:107',message:'Server-side Firestore initialized',data:{dbHost:dbSettings?.host,useEmulator,nodeEnv:process.env.NODE_ENV,explicitFlag:process.env.FIREBASE_USE_EMULATOR,hasApiKey:!!process.env.FIREBASE_API_KEY,inDevMode:process.env.NODE_ENV==='development'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
}
// #endregion

// Connect to emulators if in emulator mode
// Always try to connect in development mode if emulators might be running
const shouldUseEmulator = useEmulator || 
  (typeof window !== 'undefined' && import.meta.env.MODE === 'development') ||
  (typeof window === 'undefined' && process.env.NODE_ENV === 'development');

// Connect to emulators (both client and server)
if (shouldUseEmulator) {
  try {
    // Check if emulators are already connected
    const authConnected = (auth as any)._delegate?._config?.emulator;
    const dbSettings = (db as any)._delegate?._settings;
    const dbConnected = dbSettings?.host?.includes('localhost') || 
                        dbSettings?.host?.includes('127.0.0.1') ||
                        dbSettings?.host === '127.0.0.1:8080';
    
    if (!authConnected) {
      try {
        connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
        console.log('✅ Connected to Firebase Auth Emulator');
      } catch (e: any) {
        if (!e.message?.includes('already been connected') && !e.message?.includes('already been initialized')) {
          console.warn('⚠️ Could not connect to Auth Emulator:', e.message);
        }
      }
    }
    
    if (!dbConnected) {
      try {
        connectFirestoreEmulator(db, '127.0.0.1', 8080);
        const envLabel = typeof window !== 'undefined' ? 'Client' : 'Server';
        console.log(`✅ [${envLabel}] Connected to Firestore Emulator`);
        // #region agent log
        if (typeof window === 'undefined') {
          fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'config.ts:125',message:'Server Firestore emulator connection successful',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        }
        // #endregion
      } catch (e: any) {
        if (!e.message?.includes('already been connected') && !e.message?.includes('already been initialized')) {
          const envLabel = typeof window !== 'undefined' ? 'Client' : 'Server';
          console.warn(`⚠️ [${envLabel}] Could not connect to Firestore Emulator:`, e.message);
          console.log('💡 Make sure Firestore emulator is running on port 8080');
          // #region agent log
          if (typeof window === 'undefined') {
            fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'config.ts:132',message:'Server Firestore emulator connection failed',data:{error:e.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          }
          // #endregion
        }
      }
    } else {
      // #region agent log
      if (typeof window === 'undefined') {
        const dbSettings = (db as any)._delegate?._settings;
        fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'config.ts:140',message:'Server Firestore already connected to emulator',data:{dbHost:dbSettings?.host},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      }
      // #endregion
    }
    
    try {
      const storageHost = (storage as any)._delegate?._host;
      if (!storageHost?.includes('localhost') && !storageHost?.includes('127.0.0.1')) {
        connectStorageEmulator(storage, '127.0.0.1', 9199);
        console.log('✅ Connected to Storage Emulator');
      }
    } catch (e: any) {
      if (!e.message?.includes('already been connected') && !e.message?.includes('already been initialized')) {
        // Storage emulator connection is optional
      }
    }
    
    try {
      const dbHost = (realtimeDb as any)._delegate?._repo?.repoInfo?.host;
      if (!dbHost?.includes('localhost') && !dbHost?.includes('127.0.0.1')) {
        connectDatabaseEmulator(realtimeDb, '127.0.0.1', 9000);
        console.log('✅ Connected to Realtime Database Emulator');
      }
    } catch (e: any) {
      if (!e.message?.includes('already been connected') && !e.message?.includes('already been initialized')) {
        // Realtime DB emulator connection is optional
      }
    }
  } catch (error: any) {
    // If connection fails, it might be because emulators aren't running
    if (error.message?.includes('already been initialized') || error.message?.includes('already been connected')) {
      // Already connected, ignore
    } else {
      console.warn('⚠️ Firebase emulator connection warning:', error.message);
      console.log('💡 Make sure Firebase emulators are running: npm run emulators');
    }
  }
} else if (typeof window !== 'undefined') {
  console.log('ℹ️ Firebase emulator mode:', useEmulator ? 'enabled' : 'disabled');
  if (!useEmulator && import.meta.env.MODE === 'development') {
    console.log('💡 To enable emulators, set VITE_FIREBASE_USE_EMULATOR=true or run in development mode without API keys');
  }
}

export { app, auth, db, storage, realtimeDb };

