"use strict";
/**
 * Server-side Firebase authentication utilities
 * For use in API routes and server components
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyIdToken = verifyIdToken;
/**
 * Verify Firebase ID token (server-side)
 * Simplified version for development - in production, use Firebase Admin SDK
 */
async function verifyIdToken(token) {
    // For development/emulator mode, we'll decode the JWT to get the user ID
    // In production, you MUST use Firebase Admin SDK for proper verification
    if (!token || token.length < 10) {
        throw new Error("Invalid token format");
    }
    // In emulator/development mode, decode JWT without signature verification
    // WARNING: This is NOT secure for production!
    const isDevelopment = process.env.NODE_ENV === "development" ||
        process.env.FIREBASE_USE_EMULATOR === "true" ||
        !process.env.FIREBASE_PROJECT_ID; // Assume dev if no project ID
    if (isDevelopment) {
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
    throw new Error("Token verification requires Firebase Admin SDK in production. Please set up firebase-admin.");
}
