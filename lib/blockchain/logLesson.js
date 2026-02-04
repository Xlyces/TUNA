"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logLessonOnChain = logLessonOnChain;
exports.logLesson = logLesson;
exports.generatePaymentHash = generatePaymentHash;
const ethers_1 = require("ethers");
const config_1 = require("./config");
/**
 * Log a completed lesson on-chain (client-side)
 * @param tutorId The SBT token ID of the tutor
 * @param lessonLog Lesson data
 * @param paymentHash Unique hash to prevent duplicate logging
 * @returns The transaction hash
 */
async function logLessonOnChain(tutorId, lessonLog, paymentHash) {
    if (typeof window === "undefined") {
        throw new Error("This function must be called from the client side");
    }
    const provider = new ethers_1.ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers_1.ethers.Contract(config_1.CONTRACT_ADDRESS, config_1.CONTRACT_ABI, signer);
    const tx = await contract.logLesson(tutorId, [
        lessonLog.timestamp,
        lessonLog.durationMins,
        lessonLog.feeHkd,
        lessonLog.subjectId,
        lessonLog.rating,
    ], paymentHash);
    await tx.wait();
    return tx.hash;
}
/**
 * Log a completed lesson on-chain (server-side)
 * Uses a private key from environment variables
 * @param tutorId The SBT token ID of the tutor
 * @param lessonLog Lesson data
 * @param paymentHash Unique hash to prevent duplicate logging
 * @returns The transaction hash
 */
async function logLesson(tutorId, lessonLog, paymentHash) {
    if (!config_1.CONTRACT_ADDRESS) {
        throw new Error("CONTRACT_ADDRESS not set");
    }
    // In production, use a dedicated wallet for gas sponsorship
    const privateKey = process.env.PAYMENT_ORACLE_PRIVATE_KEY;
    if (!privateKey) {
        console.warn("PAYMENT_ORACLE_PRIVATE_KEY not set - skipping on-chain logging");
        throw new Error("Payment oracle private key not configured");
    }
    const rpcUrl = process.env.POLYGON_MUMBAI_RPC_URL || process.env.POLYGON_MAINNET_RPC_URL;
    if (!rpcUrl) {
        throw new Error("Polygon RPC URL not set");
    }
    const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers_1.ethers.Wallet(privateKey, provider);
    const contract = new ethers_1.ethers.Contract(config_1.CONTRACT_ADDRESS, config_1.CONTRACT_ABI, wallet);
    const tx = await contract.logLesson(tutorId, [
        lessonLog.timestamp,
        lessonLog.durationMins,
        lessonLog.feeHkd,
        lessonLog.subjectId,
        lessonLog.rating,
    ], paymentHash);
    await tx.wait();
    return tx.hash;
}
/**
 * Generate a payment hash from payment intent ID and booking ID
 * @param paymentIntentId Stripe payment intent ID
 * @param bookingId Booking ID
 * @returns The keccak256 hash
 */
function generatePaymentHash(paymentIntentId, bookingId) {
    const encoded = ethers_1.ethers.AbiCoder.defaultAbiCoder().encode(["string", "string"], [paymentIntentId, bookingId]);
    return ethers_1.ethers.keccak256(encoded);
}
