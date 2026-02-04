# TUNA Platform - Technical Architecture

## System Overview

TUNA is a Web3 tutoring marketplace platform that connects verified HKU/UST tutors with parents. The platform uses blockchain technology (Polygon) to create immutable, portable reputation records through Soulbound Tokens (SBTs).

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  Next.js 15 (App Router) + React 19 + TypeScript 5.6   │
│  - Shadcn/ui components                                  │
│  - Tailwind CSS 3.4                                      │
│  - TanStack Query (data fetching)                        │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│   Firebase   │  │    Stripe    │  │   Polygon    │
│   Services   │  │   Connect    │  │   Mumbai     │
│              │  │              │  │              │
│ - Auth       │  │ - Payments   │  │ - SBT        │
│ - Firestore  │  │ - Webhooks   │  │ - Reputation │
│ - Functions  │  │ - Splits     │  │ - Events     │
│ - Storage    │  │              │  │              │
│ - Realtime   │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
                          │
                  ┌───────▼──────┐
                  │ Payment      │
                  │ Oracle       │
                  │ (Webhook →   │
                  │  Contract)   │
                  └──────────────┘
                          │
                  ┌───────▼──────┐
                  │  The Graph   │
                  │  (Indexing)   │
                  └──────────────┘
```

## Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TypeScript 5.6**: Type safety
- **Tailwind CSS 3.4**: Styling
- **Shadcn/ui**: Component library
- **TanStack Query v5**: Data fetching and caching
- **wagmi v2 + viem**: Web3 React hooks
- **RainbowKit**: Wallet connection UI

### Backend
- **Firebase v10**:
  - Authentication (email/password, social login)
  - Firestore (NoSQL database)
  - Cloud Functions (serverless)
  - Storage (PDFs, images)
  - Realtime Database (chat)

### Blockchain
- **Hardhat 2.22**: Development environment
- **Solidity 0.8.26**: Smart contract language
- **ethers.js v6**: Blockchain interaction
- **Polygon Mumbai**: Testnet
- **Polygon Mainnet**: Production network
- **The Graph**: Event indexing and GraphQL queries

### Payments
- **Stripe Connect Standard**: Payment processing
- **FPS Integration**: Hong Kong Fast Payment System
- **Webhook Handlers**: Next.js API routes

### Other Services
- **Cal.com**: Scheduling
- **Tesseract.js**: Client-side OCR
- **Google Vision API**: Server-side OCR validation
- **Pinata**: IPFS storage
- **Sentry**: Error tracking
- **Vercel**: Hosting

## Data Flow

### Tutor Verification Flow

1. Tutor uploads DSE/IB PDF + selfie
2. Client-side OCR (Tesseract.js) extracts scores
3. Server-side validation (Google Vision API)
4. Admin reviews and approves
5. PDF hash stored on IPFS
6. SBT minted on Polygon with credential hash
7. Tutor profile updated with `tutorTokenId`

### Payment Oracle Flow

1. Parent books lesson and pays via FPS/Stripe
2. Stripe webhook fires to `/api/webhooks/stripe`
3. Payment validated (status, amount)
4. Payment hash generated (paymentIntentId + bookingId)
5. On-chain check for duplicates
6. `contract.logLesson()` called (platform sponsors gas)
7. Transaction hash stored in Firestore
8. The Graph indexes `LessonCompleted` event
9. Frontend queries updated reputation via GraphQL

### Lesson Completion Flow

1. Tutor marks lesson as complete
2. Parent rates tutor (1-5 stars) and provides feedback
3. Rating updated on-chain via `logLesson()` (if not already logged)
4. Credits earned (+5 for attendance)
5. Reputation stats recalculated
6. SBT metadata updated on IPFS

## Smart Contract Architecture

### TutorReputation.sol

**Purpose**: Non-transferable NFT (SBT) representing tutor reputation

**Key Functions**:
- `mintTutor()`: Create SBT for verified tutor
- `logLesson()`: Record lesson completion on-chain
- `getStats()`: Aggregate reputation statistics
- `_update()`: Prevent transfers (SBT behavior)

**Data Structures**:
- `LessonLog`: timestamp, duration, fee, subject, rating
- `credHashes`: IPFS hash of verification documents
- `paymentHashes`: Prevent duplicate logging

**Events**:
- `TutorMinted`: New SBT created
- `CredentialsStored`: Credential hash stored
- `LessonCompleted`: Lesson logged on-chain

## Security Considerations

### Smart Contracts
- ReentrancyGuard for `logLesson()`
- Payment hash verification prevents duplicates
- Input validation (ratings, durations, fees)
- Only owner can mint/log (admin functions)

### Backend
- Firebase security rules (no direct writes)
- Stripe webhook signature verification
- Payment validation before on-chain writes
- Idempotency keys for webhooks

### Frontend
- Wallet connection via RainbowKit (secure)
- TanStack Query caching reduces API calls
- Input validation on all forms
- Error boundaries for graceful failures

## Scalability

### Technical Scaling
- Firebase auto-scales (Firestore, Functions)
- Vercel auto-scales (Next.js)
- Polygon handles high TPS (Layer 2)
- The Graph indexes efficiently

### Business Scaling
- Tutor acquisition (marketing)
- Parent acquisition (referrals)
- Support system (help desk)
- Dispute resolution process

## Deployment

### Development
- Local Hardhat network
- Firebase Emulator Suite
- Stripe Test Mode
- Polygon Mumbai testnet

### Production
- Vercel (Next.js)
- Firebase Production
- Stripe Production
- Polygon Mainnet
- The Graph Hosted Service

## Monitoring

- **Sentry**: Error tracking and performance
- **Google Analytics 4**: User behavior
- **Firebase Analytics**: Retention metrics
- **The Graph**: On-chain event monitoring
- **Stripe Dashboard**: Payment metrics

