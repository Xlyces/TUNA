# Testing Environment - Quick Start Guide

## 🚀 Quick Commands

### 1. Smart Contract Tests (Hardhat)
```bash
# Compile contracts
npm run compile

# Run tests
npm run test:contracts

# Run with coverage
npm run test:contracts:coverage
```

### 2. Unit Tests (Jest)
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

### 3. E2E Tests (Playwright)
```bash
# Install browsers (first time only)
npx playwright install

# Run tests
npm run test:e2e

# UI mode (interactive)
npm run test:e2e:ui
```

### 4. Firebase Emulators
```bash
# Install Firebase CLI (if needed)
npm install -g firebase-tools

# Login (first time only)
firebase login

# Start emulators
npm run emulators

# Access emulator UI at: http://localhost:4000
```

## 📋 Complete Testing Setup

### Step 1: Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Step 2: Install Playwright Browsers
```bash
npx playwright install
```

### Step 3: Start Firebase Emulators (Terminal 1)
```bash
npm run emulators
```

### Step 4: Start Dev Server (Terminal 2)
```bash
npm run dev
```

### Step 5: Run Tests (Terminal 3)
```bash
# Smart contracts
npm run test:contracts

# Unit tests
npm test

# E2E tests (auto-starts dev server)
npm run test:e2e
```

## 🔧 Environment Setup

Create `.env.local` for testing:

```bash
# Firebase Emulator
NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true

# Test wallet (Hardhat default)
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Local Hardhat network
POLYGON_MUMBAI_RPC_URL=http://localhost:8545
```

## 📊 Test Coverage

- **Smart Contracts**: Run `npm run test:contracts:coverage`
- **Unit Tests**: Run `npm run test:coverage`
- **E2E Tests**: View HTML report after running tests

## 🐛 Debugging

### Debug Jest Tests
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Debug Playwright Tests
```bash
npx playwright test --debug
```

### Debug Smart Contracts
```bash
npx hardhat console
```

## 📚 More Information

See `docs/TESTING.md` for detailed testing documentation.

