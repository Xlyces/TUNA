# Test Facilities Access Guide

## 🎯 Quick Access URLs

### Firebase Emulator UI (Main Dashboard)
**URL**: http://127.0.0.1:4000 or http://localhost:4000

This is your main testing dashboard where you can:
- View all emulators
- Access individual emulator UIs
- Monitor data in real-time
- Test authentication flows
- View Firestore collections
- Check Realtime Database
- Manage Storage files

### Individual Emulator Endpoints

#### Authentication Emulator
- **UI**: http://127.0.0.1:4000/auth
- **API**: http://127.0.0.1:9099
- **Use for**: Testing user registration, login, token generation

#### Firestore Emulator
- **UI**: http://127.0.0.1:4000/firestore
- **API**: http://127.0.0.1:8080
- **WebSocket**: http://127.0.0.1:9150
- **Use for**: Testing database operations, viewing collections

#### Realtime Database Emulator
- **UI**: http://127.0.0.1:4000/database
- **API**: http://127.0.0.1:9000
- **Use for**: Testing real-time chat, live updates

#### Storage Emulator
- **UI**: http://127.0.0.1:4000/storage
- **API**: http://127.0.0.1:9199
- **Use for**: Testing file uploads, PDF storage

### Emulator Hub
- **Host**: 127.0.0.1:4400
- **Use for**: Programmatic access to emulator status

## 📊 Test Reports & Coverage

### Smart Contract Coverage
After running `npm run test:contracts:coverage`:
- **Report**: `coverage/index.html`
- **Open**: Open `coverage/index.html` in your browser
- **Shows**: Line coverage, branch coverage, function coverage

### Jest Unit Test Coverage
After running `npm run test:coverage`:
- **Report**: `coverage/lcov-report/index.html`
- **Open**: Open `coverage/lcov-report/index.html` in your browser
- **Shows**: Code coverage for app/, components/, lib/

### Playwright E2E Test Reports
After running `npm run test:e2e`:
- **HTML Report**: `playwright-report/index.html`
- **Open**: `npx playwright show-report`
- **Shows**: Test results, screenshots, videos, traces

## 🔧 Development Server

### Next.js Dev Server
- **URL**: http://localhost:3000
- **Start**: `npm run dev`
- **Use for**: Testing the full application with emulators

## ⛓️ Blockchain Testing

### Hardhat Local Network
- **RPC URL**: http://localhost:8545
- **Chain ID**: 1337
- **Start**: Automatically when running `npm run test:contracts`
- **Use for**: Local contract testing

### Hardhat Console
```bash
npx hardhat console
```
- **Use for**: Interactive contract testing
- **Access**: Deployed contracts, test accounts

### Hardhat Node (Standalone)
```bash
npx hardhat node
```
- **RPC URL**: http://localhost:8545
- **Use for**: Running a persistent local blockchain
- **Access**: View at http://localhost:8545

## 📝 Test Logs

### Firebase Emulator Logs
- **Firestore**: `firestore-debug.log`
- **Database**: `database-debug.log`
- **Location**: Project root directory
- **Use for**: Debugging emulator issues

### Hardhat Logs
- **Location**: Console output
- **Use for**: Contract deployment, test execution

## 🧪 Interactive Testing Tools

### Firebase Emulator UI Features
1. **Data Viewer**: Browse collections and documents
2. **Query Builder**: Test Firestore queries
3. **Auth Users**: Create/manage test users
4. **Storage Files**: Upload/download test files
5. **Database Data**: View Realtime Database structure

### Hardhat Console Commands
```javascript
// Get accounts
const [owner, tutor, parent] = await ethers.getSigners();

// Deploy contract
const Contract = await ethers.getContractFactory("TutorReputation");
const contract = await Contract.deploy();

// Interact with contract
await contract.mintTutor(tutor.address, "0x...", 0);
```

## 🔍 Debugging Access Points

### Browser DevTools
- **Open**: F12 or Cmd+Option+I
- **Network Tab**: Monitor API calls to emulators
- **Console**: View client-side logs
- **Application Tab**: Check Firebase connections

### VS Code Debugging
- **Launch Config**: `.vscode/launch.json` (create if needed)
- **Breakpoints**: Set in test files
- **Debug Console**: View variable values

### Playwright Inspector
```bash
npx playwright test --debug
```
- **Opens**: Playwright Inspector UI
- **Use for**: Step through E2E tests

## 📱 Mobile Testing

### Local Network Access
If testing on mobile device:
1. Find your computer's IP: `ifconfig` or `ipconfig`
2. Update emulator URLs to use your IP instead of localhost
3. Ensure mobile device is on same network

Example:
- Computer IP: `192.168.1.100`
- Emulator UI: `http://192.168.1.100:4000`
- Dev Server: `http://192.168.1.100:3000`

## 🚀 Production-Like Testing

### Vercel Preview Deployments
- **Access**: Vercel dashboard
- **Use for**: Testing production builds
- **URL**: `your-app-xyz.vercel.app`

### Testnet Deployments
- **Polygon Mumbai**: https://mumbai.polygonscan.com
- **Contract Address**: After deployment
- **Use for**: Testing on real testnet

## 📋 Quick Reference Commands

```bash
# Start all test facilities
npm run emulators    # Terminal 1: Firebase emulators
npm run dev          # Terminal 2: Next.js dev server

# Run tests
npm run test:contracts        # Smart contracts
npm test                       # Unit tests
npm run test:e2e              # E2E tests

# View reports
open coverage/index.html                    # Contract coverage
open coverage/lcov-report/index.html       # Unit test coverage
npx playwright show-report                 # E2E test report

# Access UIs
open http://localhost:4000    # Emulator UI
open http://localhost:3000    # Dev server
```

## 🎯 Testing Workflow

1. **Start Emulators**: `npm run emulators`
2. **Start Dev Server**: `npm run dev` (in another terminal)
3. **Access Emulator UI**: http://localhost:4000
4. **Test in Browser**: http://localhost:3000
5. **Run Tests**: `npm test` or `npm run test:e2e`
6. **View Reports**: Open coverage/test report files

## 🔐 Test Credentials

### Firebase Emulator Test Users
Create via Emulator UI or code:
- Email: `test@example.com`
- Password: `test123456`
- No email verification needed in emulator

### Hardhat Test Accounts
Pre-funded accounts available:
- Account 0: Owner (deployer)
- Account 1-19: Test users
- Each has 10000 ETH for testing

