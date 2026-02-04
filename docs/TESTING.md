# TUNA Platform - Testing Guide

## Overview

The TUNA platform uses multiple testing frameworks:
- **Hardhat**: Smart contract tests
- **Jest**: Unit and integration tests
- **Playwright**: End-to-end (E2E) tests
- **Firebase Emulators**: Local backend testing

## Quick Start

### 1. Smart Contract Tests

```bash
# Compile contracts first
npm run compile

# Run contract tests
npm run test:contracts

# Run with coverage
npx hardhat coverage
```

### 2. Unit Tests (Jest)

```bash
# Run all unit tests
npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### 3. E2E Tests (Playwright)

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run in UI mode
npx playwright test --ui

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts
```

### 4. Firebase Emulators

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Start emulators
firebase emulators:start

# Emulators will be available at:
# - Auth: http://localhost:9099
# - Firestore: http://localhost:8080
# - Storage: http://localhost:9199
# - Realtime DB: http://localhost:9000
# - UI: http://localhost:4000
```

## Complete Testing Environment Setup

### Step 1: Install Dependencies

```bash
npm install --legacy-peer-deps
```

### Step 2: Set Up Environment Variables

Create a `.env.local` file for testing:

```bash
# Firebase Emulator (use emulator config)
NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true

# Test wallet (for Hardhat)
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Test network
POLYGON_MUMBAI_RPC_URL=http://localhost:8545
```

### Step 3: Start Firebase Emulators

In one terminal:

```bash
firebase emulators:start
```

### Step 4: Start Development Server

In another terminal:

```bash
npm run dev
```

### Step 5: Run Tests

In a third terminal:

```bash
# Smart contract tests
npm run test:contracts

# Unit tests
npm test

# E2E tests (will start dev server automatically)
npm run test:e2e
```

## Test Structure

```
tests/
├── e2e/                    # Playwright E2E tests
│   ├── auth.spec.ts       # Authentication flows
│   ├── verification.spec.ts # Tutor verification
│   ├── booking.spec.ts    # Booking flows
│   └── payment.spec.ts     # Payment flows
├── unit/                   # Jest unit tests
│   ├── contracts/         # Contract utilities
│   ├── utils/             # Utility functions
│   └── api/                # API route handlers
└── integration/            # Integration tests
    ├── firebase/           # Firebase operations
    ├── stripe/             # Stripe integration
    └── blockchain/         # Blockchain interactions
```

## Writing Tests

### Smart Contract Tests

```javascript
// test/example.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyContract", function () {
  it("Should do something", async function () {
    const Contract = await ethers.getContractFactory("MyContract");
    const contract = await Contract.deploy();
    // ... test logic
  });
});
```

### Jest Unit Tests

```typescript
// tests/unit/utils/example.test.ts
import { someFunction } from '@/lib/utils';

describe('someFunction', () => {
  it('should work correctly', () => {
    expect(someFunction()).toBe(expected);
  });
});
```

### Playwright E2E Tests

```typescript
// tests/e2e/example.spec.ts
import { test, expect } from '@playwright/test';

test('user can register', async ({ page }) => {
  await page.goto('/register');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## Testing with Firebase Emulators

### Update Firebase Config for Emulators

```typescript
// lib/firebase/config.ts
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

if (process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

### Seed Test Data

```bash
# Create a seed script
node scripts/seed-emulators.js
```

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install --legacy-peer-deps
      - run: npm run compile
      - run: npm run test:contracts
      - run: npm test
      - run: npx playwright install
      - run: npm run test:e2e
```

## Coverage Goals

- **Smart Contracts**: 100% coverage
- **Unit Tests**: 80%+ coverage
- **E2E Tests**: Critical user flows

## Debugging Tests

### Debug Jest Tests

```bash
# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Debug Playwright Tests

```bash
# Run in headed mode
npx playwright test --headed

# Run in debug mode
npx playwright test --debug
```

### Debug Smart Contract Tests

```bash
# Use Hardhat console
npx hardhat console
```

## Common Issues

### Firebase Emulator Connection

If emulators don't connect, check:
1. Emulators are running (`firebase emulators:start`)
2. `NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true` is set
3. Ports are not in use

### Playwright Browser Installation

If Playwright tests fail:
```bash
npx playwright install
```

### Hardhat Network Issues

If contract tests fail:
```bash
# Clear cache
npx hardhat clean
npm run compile
```

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Clean Up**: Reset state between tests
3. **Mock External Services**: Don't call real APIs in tests
4. **Use Test Data**: Create fixtures for consistent test data
5. **Test Edge Cases**: Don't just test happy paths
6. **Keep Tests Fast**: Optimize slow tests

