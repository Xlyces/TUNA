# Polygon Network Deployment Guide

## Mumbai Testnet RPC URLs

The default RPC URL in `hardhat.config.ts` uses Alchemy's demo endpoint. For production use, you should:

### Option 1: Use Alchemy (Recommended)

1. Sign up at [Alchemy](https://www.alchemy.com/)
2. Create a Polygon Mumbai app
3. Get your API key
4. Update `.env`:

```bash
POLYGON_MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
```

### Option 2: Use Infura

1. Sign up at [Infura](https://www.infura.io/)
2. Create a Polygon Mumbai project
3. Get your project ID
4. Update `.env`:

```bash
POLYGON_MUMBAI_RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_PROJECT_ID
```

### Option 3: Use Public RPCs

```bash
# Polygon Mumbai public RPCs
POLYGON_MUMBAI_RPC_URL=https://matic-mumbai.chainstacklabs.com
# or
POLYGON_MUMBAI_RPC_URL=https://rpc.ankr.com/polygon_mumbai
```

## Getting Testnet MATIC

1. Go to [Polygon Faucet](https://faucet.polygon.technology/)
2. Enter your wallet address
3. Request testnet MATIC

## Deployment Steps

1. **Set up environment variables**:
```bash
PRIVATE_KEY=your_private_key_here
POLYGON_MUMBAI_RPC_URL=your_rpc_url
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

2. **Deploy to Mumbai**:
```bash
npm run deploy:mumbai
```

3. **Verify on Polygonscan**:
```bash
npx hardhat verify --network mumbai <CONTRACT_ADDRESS>
```

## Mainnet Deployment

For mainnet, use:
```bash
POLYGON_MAINNET_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
npm run deploy:polygon
```

