# Firebase Setup Guide

## Quick Setup for Emulators

### Option 1: Use Default Project (Easiest)

The `.firebaserc` file is set to use `tuna-platform-dev` as the default project. For emulators, you can use any project name or create a test project.

### Option 2: Initialize Firebase Project

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login
firebase login

# Initialize Firebase (if not done)
firebase init

# Select:
# - Firestore
# - Realtime Database
# - Storage
# - Emulators
```

### Option 3: Run Emulators Without Project

You can run emulators without a project by using the `--project` flag:

```bash
firebase emulators:start --project demo-tuna
```

Or update the script in `package.json`:

```json
"emulators": "firebase emulators:start --project demo-tuna"
```

## Emulator URLs

Once running, access:
- **Emulator UI**: http://localhost:4000
- **Auth**: http://localhost:9099
- **Firestore**: http://localhost:8080
- **Storage**: http://localhost:9199
- **Realtime DB**: http://localhost:9000

## Security Rules

- `firestore.rules` - Firestore security rules
- `database.rules.json` - Realtime Database rules

These are automatically loaded by the emulators.

## Using Emulators in Code

Update your Firebase config to use emulators in development:

```typescript
// lib/firebase/config.ts
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectDatabaseEmulator, getDatabase } from 'firebase/database';

if (process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectDatabaseEmulator(realtimeDb, 'localhost', 9000);
}
```

Set in `.env.local`:
```
NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true
```

