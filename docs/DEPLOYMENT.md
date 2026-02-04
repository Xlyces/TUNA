# TUNA Platform - Deployment Guide

## Prerequisites

- Node.js 18+
- Firebase project
- Stripe account
- Polygon wallet with MATIC
- Pinata account
- Google Cloud account (for Vision API)
- Vercel account

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in all environment variables:

```bash
# Blockchain
PRIVATE_KEY=your_private_key
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGON_MAINNET_RPC_URL=https://polygon-rpc.com
POLYGONSCAN_API_KEY=your_api_key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... (all Firebase config)

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# IPFS
PINATA_API_KEY=your_key
PINATA_SECRET_KEY=your_secret

# Other services
GOOGLE_VISION_API_KEY=your_key
NEXT_PUBLIC_GRAPH_URL=your_subgraph_url
```

## Smart Contract Deployment

### 1. Compile Contracts

```bash
npm run compile
```

### 2. Deploy to Mumbai (Testnet)

```bash
npm run deploy:mumbai
```

Save the contract address.

### 3. Verify on Polygonscan

```bash
npx hardhat verify --network mumbai <CONTRACT_ADDRESS>
```

### 4. Deploy to Polygon Mainnet

```bash
npm run deploy:polygon
```

### 5. Update Environment Variables

Set `NEXT_PUBLIC_CONTRACT_ADDRESS` to the deployed contract address.

## The Graph Subgraph

### 1. Install Graph CLI

```bash
npm install -g @graphprotocol/graph-cli
```

### 2. Initialize Subgraph

```bash
graph init --studio tuna-platform
```

### 3. Update subgraph.yaml

- Set `CONTRACT_ADDRESS`
- Set `START_BLOCK` (deployment block)

### 4. Generate Types

```bash
cd subgraph
graph codegen
```

### 5. Build

```bash
graph build
```

### 6. Deploy

```bash
graph deploy --studio tuna-platform
```

## Firebase Setup

### 1. Create Firebase Project

1. Go to Firebase Console
2. Create new project
3. Enable Authentication (Email/Password)
4. Create Firestore database
5. Enable Storage
6. Enable Realtime Database

### 2. Set Security Rules

Update `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    // ... more rules
  }
}
```

### 3. Deploy Rules

```bash
firebase deploy --only firestore:rules
```

## Stripe Setup

### 1. Create Stripe Account

1. Sign up at stripe.com
2. Complete account setup
3. Get API keys

### 2. Enable Stripe Connect

1. Go to Connect settings
2. Enable Express accounts
3. Set commission structure

### 3. Set Webhook Endpoint

1. Go to Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy webhook secret

## Vercel Deployment

### 1. Connect Repository

1. Go to Vercel
2. Import Git repository
3. Configure project

### 2. Set Environment Variables

Add all environment variables in Vercel dashboard.

### 3. Deploy

```bash
vercel --prod
```

Or push to main branch (auto-deploy).

## Post-Deployment

### 1. Verify Deployment

- Test authentication
- Test payment flow
- Test contract interactions
- Check webhooks

### 2. Set Up Monitoring

- Configure Sentry
- Set up Google Analytics
- Enable Firebase Analytics

### 3. Set Up Alerts

- Stripe webhook failures
- Contract errors
- Payment oracle failures

## Maintenance

### Daily

- Monitor error logs (Sentry)
- Check payment webhooks
- Review verification queue

### Weekly

- Review analytics
- Check contract events
- Update dependencies

### Monthly

- Security updates
- Performance optimization
- Cost review

