/**
 * Test Script for Escrow Payment Flow
 * 
 * Usage:
 * 1. Start Firebase emulators: npm run emulators
 * 2. Start dev server: npm run dev
 * 3. Run this script: tsx scripts/test-escrow-flow.ts
 * 
 * This script tests the escrow payment flow programmatically
 */

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, updateDoc } from "firebase/firestore";
import axios from "axios";

// Firebase config (use emulator)
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-tuna.firebaseapp.com",
  projectId: "demo-tuna",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators
if (process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === "true") {
  auth.useEmulator("http://localhost:9099");
  // Firestore emulator is auto-connected
}

const BASE_URL = "http://localhost:3000";

interface TestUser {
  email: string;
  password: string;
  role: "tutor" | "parent";
  token?: string;
  uid?: string;
}

async function createTestUser(email: string, password: string, role: "tutor" | "parent"): Promise<TestUser> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();

    // Create user profile
    await setDoc(doc(db, "users", user.uid), {
      email,
      name: role === "tutor" ? "Test Tutor" : "Test Parent",
      role,
      walletCredits: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(role === "tutor" && {
        stripeAccountId: "acct_test_tutor", // Mock Stripe account ID
        tutorTokenId: 1,
      }),
    });

    return { email, password, role, token, uid: user.uid };
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      // User exists, sign in instead
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      return { email, password, role, token, uid: user.uid };
    }
    throw error;
  }
}

async function testEscrowFlow() {
  console.log("🧪 Starting Escrow Payment Flow Test\n");

  try {
    // Step 1: Create test users
    console.log("1️⃣ Creating test users...");
    const parent = await createTestUser("parent@test.com", "password123", "parent");
    const tutor = await createTestUser("tutor@test.com", "password123", "tutor");
    console.log("✅ Test users created\n");

    // Step 2: Create booking
    console.log("2️⃣ Creating booking...");
    const scheduledAt = new Date();
    scheduledAt.setHours(scheduledAt.getHours() + 24); // Tomorrow

    const bookingResponse = await axios.post(
      `${BASE_URL}/api/bookings`,
      {
        tutorId: tutor.uid,
        tutorTokenId: 1,
        subject: "Math",
        duration: 60,
        fee: 500,
        scheduledAt: scheduledAt.toISOString(),
        studentName: "Test Student",
        studentGrade: "Grade 10",
        creditsUsed: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${parent.token}`,
        },
      }
    );

    const bookingId = bookingResponse.data.bookingId;
    console.log(`✅ Booking created: ${bookingId}\n`);

    // Step 3: Verify booking status
    console.log("3️⃣ Verifying booking status...");
    const bookingDoc = await getDoc(doc(db, "bookings", bookingId));
    const bookingData = bookingDoc.data();
    
    console.log("Booking Status:", bookingData?.status);
    console.log("Payment Captured:", bookingData?.paymentCaptured);
    console.log("Tutor Confirmed:", bookingData?.tutorConfirmed);
    console.log("Parent Confirmed:", bookingData?.parentConfirmed);
    
    if (bookingData?.status !== "payment_held") {
      throw new Error(`Expected status 'payment_held', got '${bookingData?.status}'`);
    }
    console.log("✅ Booking status verified\n");

    // Step 4: Tutor confirms
    console.log("4️⃣ Tutor confirming...");
    const tutorConfirmResponse = await axios.post(
      `${BASE_URL}/api/bookings/${bookingId}/confirm`,
      {},
      {
        headers: {
          Authorization: `Bearer ${tutor.token}`,
        },
      }
    );
    console.log("Response:", tutorConfirmResponse.data.message);
    console.log("✅ Tutor confirmed\n");

    // Step 5: Verify status after tutor confirmation
    const bookingDoc2 = await getDoc(doc(db, "bookings", bookingId));
    const bookingData2 = bookingDoc2.data();
    console.log("Status after tutor confirm:", bookingData2?.status);
    console.log("Tutor Confirmed:", bookingData2?.tutorConfirmed);
    
    if (bookingData2?.status !== "awaiting_confirmation") {
      throw new Error(`Expected status 'awaiting_confirmation', got '${bookingData2?.status}'`);
    }

    // Step 6: Parent confirms
    console.log("5️⃣ Parent confirming...");
    const parentConfirmResponse = await axios.post(
      `${BASE_URL}/api/bookings/${bookingId}/confirm`,
      {},
      {
        headers: {
          Authorization: `Bearer ${parent.token}`,
        },
      }
    );
    console.log("Response:", parentConfirmResponse.data.message);
    console.log("Both Confirmed:", parentConfirmResponse.data.bothConfirmed);
    console.log("✅ Parent confirmed\n");

    // Step 7: Verify final status
    console.log("6️⃣ Verifying final status...");
    const bookingDoc3 = await getDoc(doc(db, "bookings", bookingId));
    const bookingData3 = bookingDoc3.data();
    
    console.log("Final Status:", bookingData3?.status);
    console.log("Payment Captured:", bookingData3?.paymentCaptured);
    
    if (bookingData3?.status !== "completed") {
      throw new Error(`Expected status 'completed', got '${bookingData3?.status}'`);
    }
    if (!bookingData3?.paymentCaptured) {
      throw new Error("Payment should be captured");
    }

    // Step 8: Verify credits awarded
    const parentDoc = await getDoc(doc(db, "users", parent.uid!));
    const parentData = parentDoc.data();
    console.log("Parent Credits:", parentData?.walletCredits);
    
    if (parentData?.walletCredits !== 5) {
      throw new Error(`Expected 5 credits, got ${parentData?.walletCredits}`);
    }
    console.log("✅ Credits verified\n");

    console.log("🎉 All tests passed!\n");
    console.log("Summary:");
    console.log("- Booking created with payment_held status");
    console.log("- Tutor confirmed successfully");
    console.log("- Parent confirmed successfully");
    console.log("- Payment captured when both confirmed");
    console.log("- Credits awarded to parent");

  } catch (error: any) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("Response:", error.response.data);
    }
    process.exit(1);
  }
}

// Run test
testEscrowFlow();

