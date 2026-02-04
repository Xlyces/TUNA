import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./config";

export interface LessonLog {
  timestamp: number;
  durationMins: number;
  feeHkd: number; // In smallest unit (e.g., 50000 = HKD 500.00)
  subjectId: number;
  rating: number; // 1-5
}

/**
 * Log a completed lesson on-chain (client-side)
 * @param tutorId The SBT token ID of the tutor
 * @param lessonLog Lesson data
 * @param paymentHash Unique hash to prevent duplicate logging
 * @returns The transaction hash
 */
export async function logLessonOnChain(
  tutorId: number,
  lessonLog: LessonLog,
  paymentHash: string
): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("This function must be called from the client side");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  const tx = await contract.logLesson(
    tutorId,
    [
      lessonLog.timestamp,
      lessonLog.durationMins,
      lessonLog.feeHkd,
      lessonLog.subjectId,
      lessonLog.rating,
    ],
    paymentHash
  );

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
export async function logLesson(
  tutorId: number,
  lessonLog: LessonLog,
  paymentHash: string
): Promise<string> {
  if (!CONTRACT_ADDRESS) {
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

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

  const tx = await contract.logLesson(
    tutorId,
    [
      lessonLog.timestamp,
      lessonLog.durationMins,
      lessonLog.feeHkd,
      lessonLog.subjectId,
      lessonLog.rating,
    ],
    paymentHash
  );

  await tx.wait();
  return tx.hash;
}

/**
 * Generate a payment hash from payment intent ID and booking ID
 * @param paymentIntentId Stripe payment intent ID
 * @param bookingId Booking ID
 * @returns The keccak256 hash
 */
export function generatePaymentHash(
  paymentIntentId: string,
  bookingId: string
): string {
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ["string", "string"],
    [paymentIntentId, bookingId]
  );
  return ethers.keccak256(encoded);
}

