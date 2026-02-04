# TUNA Platform

A Web3 tutoring marketplace platform connecting verified HKU/UST tutors with parents, featuring SBT reputation oracles, payment oracle pattern (FPS/Stripe → blockchain), and learn-to-earn credits.

## Tech Stack

- **Frontend**: Vite, React 19, React Router, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Express.js (API routes)
- **Web3**: wagmi, viem, RainbowKit, ethers.js
- **Database**: Firebase (Auth, Firestore, Storage, Realtime DB)
- **Blockchain**: Hardhat, Solidity 0.8.26, Polygon Mumbai/Mainnet
- **Payments**: Stripe Connect (FPS integration)
- **Other**: The Graph, IPFS (Pinata), Tesseract.js, Google Vision API

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project
- Stripe account
- Polygon Mumbai testnet access
- Pinata account (for IPFS)
- Google Cloud account (for Vision API)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Tuna
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Set up environment variables:
```bash
cp .env.example .env
# Fill in your environment variables
```

4. Compile smart contracts:
```bash
npm run compile
```

5. Run tests:
```bash
npm run test:contracts
```

6. Start development server:
```bash
npm run dev
```
This will start both the Vite frontend (port 3000) and Express backend (port 3001) concurrently.

## Project Structure

```
tuna-platform/
├── src/                    # Frontend source code
│   ├── pages/             # React Router pages
│   │   ├── auth/          # Authentication pages
│   │   ├── dashboard/     # Dashboard pages
│   │   ├── tutor/         # Tutor pages
│   │   ├── admin/         # Admin pages
│   │   └── ...
│   ├── components/        # React components
│   └── App.tsx            # Main app component
├── server/                 # Express backend
│   ├── routes/            # API route handlers
│   ├── middleware/        # Express middleware
│   └── index.ts           # Server entry point
├── components/            # Shared React components
├── hooks/                 # React hooks
├── lib/                   # Utility libraries
│   ├── blockchain/        # Web3 utilities
│   ├── firebase/          # Firebase config
│   ├── stripe/            # Stripe integration
│   └── ...
├── contracts/             # Smart contracts
├── scripts/               # Deployment scripts
├── subgraph/              # The Graph subgraph
├── test/                   # Test files
└── docs/                   # Documentation
```

## Smart Contracts

### TutorReputation.sol

The main SBT contract that:
- Mints non-transferable NFTs for verified tutors
- Logs lesson completions on-chain
- Tracks reputation statistics
- Prevents duplicate payment logging

### Deployment

Deploy to Polygon Mumbai:
```bash
npm run deploy:mumbai
```

Deploy to Polygon Mainnet:
```bash
npm run deploy:polygon
```

## Development

### Running Tests

```bash
# Smart contract tests
npm run test:contracts

# Unit tests
npm test

# E2E tests
npm run test:e2e
```

### Building

```bash
npm run build
```

## Documentation

See the `docs/` directory for detailed documentation:
- `ARCHITECTURE.md` - Technical architecture
- `USER_FLOWS.md` - User journey flows
- `API.md` - API documentation
- `CONTRACTS.md` - Smart contract documentation
- `DEPLOYMENT.md` - Deployment guide
- `TESTING.md` - Testing guide
- `BUSINESS_MODEL.md` - Business model and metrics

## License

MIT
