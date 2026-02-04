"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.realtimeDb = exports.storage = exports.db = exports.auth = exports.app = void 0;
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const firestore_1 = require("firebase/firestore");
const storage_1 = require("firebase/storage");
const database_1 = require("firebase/database");
let app;
let auth;
let db;
let storage;
let realtimeDb;
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
const firebaseConfig = {
    apiKey: (isClient ? env.VITE_FIREBASE_API_KEY : process.env.FIREBASE_API_KEY) || (useEmulator ? "demo-api-key" : ""),
    authDomain: (isClient ? env.VITE_FIREBASE_AUTH_DOMAIN : process.env.FIREBASE_AUTH_DOMAIN) || (useEmulator ? "demo-tuna.firebaseapp.com" : ""),
    projectId: (isClient ? env.VITE_FIREBASE_PROJECT_ID : process.env.FIREBASE_PROJECT_ID) || (useEmulator ? "demo-tuna" : ""),
    storageBucket: (isClient ? env.VITE_FIREBASE_STORAGE_BUCKET : process.env.FIREBASE_STORAGE_BUCKET) || (useEmulator ? "demo-tuna.appspot.com" : ""),
    messagingSenderId: (isClient ? env.VITE_FIREBASE_MESSAGING_SENDER_ID : process.env.FIREBASE_MESSAGING_SENDER_ID) || (useEmulator ? "123456789" : ""),
    appId: (isClient ? env.VITE_FIREBASE_APP_ID : process.env.FIREBASE_APP_ID) || (useEmulator ? "1:123456789:web:abc123" : ""),
};
// Initialize Firebase only if it hasn't been initialized
if ((0, app_1.getApps)().length === 0) {
    try {
        // Only initialize if we have required config or are using emulator
        if (useEmulator || firebaseConfig.apiKey) {
            exports.app = app = (0, app_1.initializeApp)(firebaseConfig);
        }
        else {
            // Create a minimal app for SSR safety
            exports.app = app = (0, app_1.initializeApp)({
                apiKey: "demo",
                authDomain: "demo.firebaseapp.com",
                projectId: "demo",
                storageBucket: "demo.appspot.com",
                messagingSenderId: "123456789",
                appId: "1:123456789:web:demo"
            }, "demo");
        }
    }
    catch (error) {
        console.error("Firebase initialization error:", error);
        // Fallback to demo app if initialization fails
        try {
            exports.app = app = (0, app_1.initializeApp)({
                apiKey: "demo",
                authDomain: "demo.firebaseapp.com",
                projectId: "demo",
                storageBucket: "demo.appspot.com",
                messagingSenderId: "123456789",
                appId: "1:123456789:web:demo"
            }, "demo-fallback");
        }
        catch (fallbackError) {
            console.error("Firebase fallback initialization also failed:", fallbackError);
            // Re-throw only if both attempts fail
            throw error;
        }
    }
}
else {
    exports.app = app = (0, app_1.getApps)()[0];
}
exports.auth = auth = (0, auth_1.getAuth)(app);
// Initialize Firestore - use initializeFirestore in emulator mode to avoid persistence issues
if (typeof window !== 'undefined' && (useEmulator || (import.meta.env.MODE === 'development' && !import.meta.env.VITE_FIREBASE_API_KEY))) {
    try {
        // Initialize Firestore with unlimited cache for emulator (avoids offline persistence issues)
        exports.db = db = (0, firestore_1.initializeFirestore)(app, {
            cacheSizeBytes: firestore_1.CACHE_SIZE_UNLIMITED,
        });
    }
    catch (e) {
        // If already initialized, get the existing instance
        if (e.message?.includes('already been initialized')) {
            exports.db = db = (0, firestore_1.getFirestore)(app);
        }
        else {
            // Fallback to regular initialization
            exports.db = db = (0, firestore_1.getFirestore)(app);
        }
    }
}
else {
    exports.db = db = (0, firestore_1.getFirestore)(app);
}
exports.storage = storage = (0, storage_1.getStorage)(app);
exports.realtimeDb = realtimeDb = (0, database_1.getDatabase)(app);
// #region agent log
if (typeof window === 'undefined') {
    const dbSettings = db._delegate?._settings;
    fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'config.ts:107', message: 'Server-side Firestore initialized', data: { dbHost: dbSettings?.host, useEmulator, nodeEnv: process.env.NODE_ENV, explicitFlag: process.env.FIREBASE_USE_EMULATOR, hasApiKey: !!process.env.FIREBASE_API_KEY, inDevMode: process.env.NODE_ENV === 'development' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
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
        const authConnected = auth._delegate?._config?.emulator;
        const dbSettings = db._delegate?._settings;
        const dbConnected = dbSettings?.host?.includes('localhost') ||
            dbSettings?.host?.includes('127.0.0.1') ||
            dbSettings?.host === '127.0.0.1:8080';
        if (!authConnected) {
            try {
                (0, auth_1.connectAuthEmulator)(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
                console.log('✅ Connected to Firebase Auth Emulator');
            }
            catch (e) {
                if (!e.message?.includes('already been connected') && !e.message?.includes('already been initialized')) {
                    console.warn('⚠️ Could not connect to Auth Emulator:', e.message);
                }
            }
        }
        if (!dbConnected) {
            try {
                (0, firestore_1.connectFirestoreEmulator)(db, '127.0.0.1', 8080);
                const envLabel = typeof window !== 'undefined' ? 'Client' : 'Server';
                console.log(`✅ [${envLabel}] Connected to Firestore Emulator`);
                // #region agent log
                if (typeof window === 'undefined') {
                    fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'config.ts:125', message: 'Server Firestore emulator connection successful', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
                }
                // #endregion
            }
            catch (e) {
                if (!e.message?.includes('already been connected') && !e.message?.includes('already been initialized')) {
                    const envLabel = typeof window !== 'undefined' ? 'Client' : 'Server';
                    console.warn(`⚠️ [${envLabel}] Could not connect to Firestore Emulator:`, e.message);
                    console.log('💡 Make sure Firestore emulator is running on port 8080');
                    // #region agent log
                    if (typeof window === 'undefined') {
                        fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'config.ts:132', message: 'Server Firestore emulator connection failed', data: { error: e.message }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
                    }
                    // #endregion
                }
            }
        }
        else {
            // #region agent log
            if (typeof window === 'undefined') {
                const dbSettings = db._delegate?._settings;
                fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'config.ts:140', message: 'Server Firestore already connected to emulator', data: { dbHost: dbSettings?.host }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
            }
            // #endregion
        }
        try {
            const storageHost = storage._delegate?._host;
            if (!storageHost?.includes('localhost') && !storageHost?.includes('127.0.0.1')) {
                (0, storage_1.connectStorageEmulator)(storage, '127.0.0.1', 9199);
                console.log('✅ Connected to Storage Emulator');
            }
        }
        catch (e) {
            if (!e.message?.includes('already been connected') && !e.message?.includes('already been initialized')) {
                // Storage emulator connection is optional
            }
        }
        try {
            const dbHost = realtimeDb._delegate?._repo?.repoInfo?.host;
            if (!dbHost?.includes('localhost') && !dbHost?.includes('127.0.0.1')) {
                (0, database_1.connectDatabaseEmulator)(realtimeDb, '127.0.0.1', 9000);
                console.log('✅ Connected to Realtime Database Emulator');
            }
        }
        catch (e) {
            if (!e.message?.includes('already been connected') && !e.message?.includes('already been initialized')) {
                // Realtime DB emulator connection is optional
            }
        }
    }
    catch (error) {
        // If connection fails, it might be because emulators aren't running
        if (error.message?.includes('already been initialized') || error.message?.includes('already been connected')) {
            // Already connected, ignore
        }
        else {
            console.warn('⚠️ Firebase emulator connection warning:', error.message);
            console.log('💡 Make sure Firebase emulators are running: npm run emulators');
        }
    }
}
else if (typeof window !== 'undefined') {
    console.log('ℹ️ Firebase emulator mode:', useEmulator ? 'enabled' : 'disabled');
    if (!useEmulator && import.meta.env.MODE === 'development') {
        console.log('💡 To enable emulators, set VITE_FIREBASE_USE_EMULATOR=true or run in development mode without API keys');
    }
}
