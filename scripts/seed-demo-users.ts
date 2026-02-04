/**
 * Seed script to create demo users for testing
 * Run with: npm run seed:users
 * 
 * Make sure Firebase emulators are running first: npm run emulators
 */

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile, connectAuthEmulator } from "firebase/auth";
import { getFirestore, doc, setDoc, connectFirestoreEmulator } from "firebase/firestore";

// Use emulator config
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-tuna.firebaseapp.com",
  projectId: "demo-tuna",
  storageBucket: "demo-tuna.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};

const app = initializeApp(firebaseConfig, "seed-script");
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators
try {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
} catch (error: any) {
  // Already connected or emulator not running
  if (!error.message?.includes("already been connected")) {
    console.warn("⚠️  Could not connect to emulators. Make sure they are running with: npm run emulators");
  }
}

interface UserProfile {
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

const demoUsers = [
  {
    email: "demo1@tuna.com",
    password: "demo123",
    name: "Dr. Sarah Chen",
    phone852: "+85291234567",
    role: "tutor" as const,
    bio: "Experienced Mathematics and Physics tutor with 5+ years of teaching experience. Specialized in DSE Mathematics and Physics. Former HKU graduate with First Class Honours.",
    subjects: ["Mathematics", "Physics"],
    hourlyRate: 500,
    tutorTokenId: 1, // Assuming they have been verified
  },
  {
    email: "demo2@tuna.com",
    password: "demo123",
    name: "Prof. Michael Wong",
    phone852: "+85291234568",
    role: "tutor" as const,
    bio: "IB English and Economics expert. UST graduate with extensive experience teaching international students. Fluent in English, Cantonese, and Mandarin.",
    subjects: ["English", "Economics"],
    hourlyRate: 600,
    tutorTokenId: 2, // Assuming they have been verified
  },
  {
    email: "demo3@tuna.com",
    password: "demo123",
    name: "Emily Li",
    phone852: "+85291234569",
    role: "parent" as const,
    walletCredits: 50, // Give them some starting credits
  },
];

async function seedDemoUsers() {
  console.log("🌱 Starting to seed demo users...\n");

  for (const userData of demoUsers) {
    try {
      // Check if user already exists
      let user;
      try {
        // Try to create user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        );
        user = userCredential.user;
        console.log(`✅ Created user: ${userData.email}`);
      } catch (error: any) {
        if (error.code === "auth/email-already-in-use") {
          console.log(`⚠️  User already exists: ${userData.email}, fetching existing user...`);
          // Try to get existing user - we'll need to sign in to get the user object
          // For now, we'll just update the Firestore profile
          const { signInWithEmailAndPassword } = await import("firebase/auth");
          try {
            const userCredential = await signInWithEmailAndPassword(auth, userData.email, userData.password);
            user = userCredential.user;
            console.log(`✅ Found existing user: ${userData.email}`);
          } catch (signInError: any) {
            console.log(`⚠️  Could not sign in to update ${userData.email}, skipping...`);
            continue;
          }
        } else {
          throw error;
        }
      }

      // Update display name
      try {
        await updateProfile(user, { displayName: userData.name });
      } catch (error: any) {
        console.log(`⚠️  Could not update display name for ${userData.email}:`, error.message);
      }

      // Create or update user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: userData.email,
        name: userData.name,
        phone852: userData.phone852,
        role: userData.role,
        walletCredits: userData.walletCredits || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...(userData.role === "tutor" && {
          bio: userData.bio,
          subjects: userData.subjects,
          hourlyRate: userData.hourlyRate,
          tutorTokenId: userData.tutorTokenId,
        }),
      };

      await setDoc(doc(db, "users", user.uid), userProfile, { merge: false }); // Use merge: false to overwrite
      console.log(`✅ Created profile for: ${userData.email}`);
      console.log(`   Role: ${userData.role}`);
      if (userData.role === "tutor") {
        console.log(`   Subjects: ${userData.subjects?.join(", ")}`);
        console.log(`   Hourly Rate: HKD ${userData.hourlyRate}`);
      }
      console.log("");
    } catch (error: any) {
      console.error(`❌ Error creating user ${userData.email}:`, error.message);
    }
  }

  console.log("✨ Demo users seeding complete!");
  console.log("\n📝 Demo Login Credentials:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Tutor 1:");
  console.log("  Email: demo1@tuna.com");
  console.log("  Password: demo123");
  console.log("\nTutor 2:");
  console.log("  Email: demo2@tuna.com");
  console.log("  Password: demo123");
  console.log("\nParent:");
  console.log("  Email: demo3@tuna.com");
  console.log("  Password: demo123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

// Run the seed function
seedDemoUsers()
  .then(() => {
    console.log("✅ Seed script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed script failed:", error);
    process.exit(1);
  });

