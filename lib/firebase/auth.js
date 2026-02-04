"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyIdToken = verifyIdToken;
exports.registerUser = registerUser;
exports.signInUser = signInUser;
exports.signOutUser = signOutUser;
exports.getUserProfile = getUserProfile;
exports.updateUserProfile = updateUserProfile;
exports.onAuthStateChange = onAuthStateChange;
const auth_1 = require("firebase/auth");
const config_1 = require("./config");
const firestore_1 = require("firebase/firestore");
const config_2 = require("./config");
/**
 * Verify Firebase ID token (server-side)
 * Note: In production, use Firebase Admin SDK for proper verification
 * This is a simplified version for development
 */
async function verifyIdToken(token) {
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
        }
        catch (error) {
            console.error("❌ Token verification failed:", error.message);
            throw new Error(`Token verification failed: ${error.message}`);
        }
    }
    // In production, this should use Firebase Admin SDK
    // For now, we'll throw an error to indicate proper setup is needed
    throw new Error("Token verification requires Firebase Admin SDK in production");
}
/**
 * Register a new user
 */
async function registerUser(email, password, name, phone852, role) {
    const userCredential = await (0, auth_1.createUserWithEmailAndPassword)(config_1.auth, email, password);
    const user = userCredential.user;
    // Update display name
    await (0, auth_1.updateProfile)(user, { displayName: name });
    // Create user profile in Firestore
    const userProfile = {
        uid: user.uid,
        email: user.email || "",
        name,
        phone852,
        role,
        walletCredits: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    await (0, firestore_1.setDoc)((0, firestore_1.doc)(config_2.db, "users", user.uid), userProfile);
    return user;
}
/**
 * Sign in with email and password
 */
async function signInUser(email, password) {
    const userCredential = await (0, auth_1.signInWithEmailAndPassword)(config_1.auth, email, password);
    return userCredential.user;
}
/**
 * Sign out current user
 */
async function signOutUser() {
    await (0, auth_1.signOut)(config_1.auth);
}
/**
 * Get user profile from Firestore
 */
async function getUserProfile(uid) {
    const userDoc = await (0, firestore_1.getDoc)((0, firestore_1.doc)(config_2.db, "users", uid));
    if (!userDoc.exists()) {
        return null;
    }
    return userDoc.data();
}
/**
 * Update user profile
 */
async function updateUserProfile(uid, updates) {
    await (0, firestore_1.setDoc)((0, firestore_1.doc)(config_2.db, "users", uid), {
        ...updates,
        updatedAt: new Date(),
    }, { merge: true });
}
/**
 * Subscribe to auth state changes
 */
function onAuthStateChange(callback) {
    return (0, auth_1.onAuthStateChanged)(config_1.auth, callback);
}
