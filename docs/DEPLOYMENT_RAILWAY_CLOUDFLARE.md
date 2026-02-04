# TUNA Platform - Railway + Cloudflare Deployment Guide

## Overview

This guide covers deploying the TUNA platform using:
- **Frontend**: Cloudflare Pages (free)
- **Backend**: Railway ($5 free credits/month)
- **Blockchain**: Polygon Mumbai testnet (for demo)
- **Services**: Firebase, Stripe, The Graph, Pinata

## Architecture

```
Frontend (Vite + React) → Cloudflare Pages
Backend (Express API) → Railway
Blockchain → Polygon Mumbai (testnet)
Services → Firebase, Stripe, The Graph, Pinata
```

## Prerequisites

- GitHub account (repository must be on GitHub)
- Railway account (sign up at railway.app)
- Cloudflare account (sign up at cloudflare.com)
- Firebase project (for production)
- Stripe account (test mode for demo)
- Polygon Mumbai testnet wallet with test MATIC
- Pinata account (for IPFS)
- The Graph account (for subgraph)

## Phase 1: Deploy Backend to Railway

### Step 1.1: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your Tuna repository
5. Railway will auto-detect it's a Node.js project

### Step 1.2: Configure Railway Service

Railway should auto-detect the configuration from `railway.json`, but verify:

**Build Settings:**
- Build Command: `npm run build:server`
- Start Command: `npm start`
- Root Directory: `/` (root)

### Step 1.3: Add Environment Variables

In Railway dashboard, go to your service → Variables tab, and add:

#### Server Configuration
```bash
NODE_ENV=production
PORT=3001
ALLOWED_ORIGINS=https://your-app.pages.dev,https://www.yourdomain.com
```

#### Firebase Configuration (Backend)
```bash
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

#### Stripe Configuration
```bash
STRIPE_SECRET_KEY=sk_test_xxx  # Use test key for demo
STRIPE_WEBHOOK_SECRET=whsec_xxx  # Get from Stripe dashboard after setting webhook
```

#### Blockchain Configuration (Mumbai Testnet)
```bash
PAYMENT_ORACLE_PRIVATE_KEY=your_private_key_for_gas_sponsorship
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

#### IPFS Configuration (Pinata)
```bash
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

#### Optional Configuration
```bash
AUTO_RELEASE_API_KEY=your_auto_release_key  # If using auto-release feature
ESCROW_TIMEOUT_HOURS=72  # Default escrow timeout
```

### Step 1.4: Deploy and Get URL

1. Railway will automatically deploy when you push to your main branch
2. Or click "Deploy" in the Railway dashboard
3. Once deployed, Railway provides a URL like: `https://tuna-api-production.up.railway.app`
4. **Save this URL** - you'll need it for the frontend configuration

### Step 1.5: Test Backend

Visit `https://your-railway-url.up.railway.app/health` - it should return `{"status":"ok"}`

## Phase 2: Deploy Frontend to Cloudflare Pages

### Step 2.1: Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to "Pages" in the sidebar
3. Click "Create a project"
4. Select "Connect to Git"
5. Authorize Cloudflare to access your GitHub
6. Select your Tuna repository
7. Click "Begin setup"

### Step 2.2: Configure Build Settings

**Build Configuration:**
- Framework preset: `Vite` (or leave as "None" and configure manually)
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/` (leave empty)

**Note**: The build command will run `npm run build` which executes both `build:server` and `vite build`. Since Cloudflare Pages only needs the frontend, you may want to create a separate script, but the current setup should work (the server build will be ignored by Pages).

### Step 2.3: Add Environment Variables

In Cloudflare Pages dashboard, go to your project → Settings → Environment Variables, and add:

#### API Configuration
```bash
VITE_API_URL=https://your-railway-url.up.railway.app
```

#### Firebase Configuration (Frontend)
```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Stripe Configuration (Frontend)
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx  # Use test key for demo
```

#### Blockchain Configuration
```bash
VITE_CONTRACT_ADDRESS=0x...  # Your deployed contract address on Mumbai
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
VITE_POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
VITE_POLYGON_MAINNET_RPC_URL=https://polygon-rpc.com  # Optional, for future mainnet
```

#### The Graph Configuration
```bash
VITE_GRAPH_URL=https://api.thegraph.com/subgraphs/name/your-subgraph
```

### Step 2.4: Deploy

1. Cloudflare Pages will automatically deploy when you push to your main branch
2. Or click "Retry deployment" in the dashboard
3. Once deployed, you'll get a URL like: `https://tuna-platform.pages.dev`
4. **Save this URL** - you'll need it for CORS configuration

### Step 2.5: Update Railway CORS

After getting your Cloudflare Pages URL, update Railway environment variables:

1. Go back to Railway dashboard
2. Add or update `ALLOWED_ORIGINS`:
   ```bash
   ALLOWED_ORIGINS=https://tuna-platform.pages.dev,https://www.yourdomain.com
   ```
3. Redeploy Railway service (or it will auto-redeploy)

## Phase 3: Configure Services

### Step 3.1: Configure Stripe Webhooks

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Developers → Webhooks
2. Click "Add endpoint"
3. Enter endpoint URL: `https://your-railway-url.up.railway.app/api/webhooks/stripe`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Add it to Railway environment variables as `STRIPE_WEBHOOK_SECRET`
8. Redeploy Railway service

### Step 3.2: Deploy Smart Contracts to Mumbai

1. Make sure you have test MATIC in your wallet (get from [Mumbai Faucet](https://faucet.polygon.technology/))
2. Update `hardhat.config.ts` with your private key (or use environment variable)
3. Deploy:
   ```bash
   npm run deploy:mumbai
   ```
4. Save the contract address
5. Update `VITE_CONTRACT_ADDRESS` in Cloudflare Pages environment variables
6. Redeploy frontend

### Step 3.3: Deploy The Graph Subgraph

1. Install Graph CLI:
   ```bash
   npm install -g @graphprotocol/graph-cli
   ```
2. Update `subgraph/subgraph.yaml`:
   - Set `CONTRACT_ADDRESS` to your deployed contract
   - Set `START_BLOCK` to the deployment block
3. Generate types:
   ```bash
   cd subgraph
   graph codegen
   graph build
   ```
4. Deploy to The Graph Studio:
   ```bash
   graph deploy --studio tuna-platform
   ```
5. Get the subgraph URL from The Graph Studio
6. Update `VITE_GRAPH_URL` in Cloudflare Pages
7. Redeploy frontend

### Step 3.4: Deploy Firebase Security Rules

1. Set Firebase project:
   ```bash
   firebase use production  # or your production project name
   ```
2. Deploy rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Phase 4: Testing

### Test Checklist

1. **Frontend loads**: Visit your Cloudflare Pages URL
2. **Backend health**: Visit `https://your-railway-url.up.railway.app/health`
3. **API connectivity**: Try logging in or creating an account
4. **Authentication**: Test Firebase Auth flow
5. **API calls**: Test creating a booking or other API operations
6. **Stripe webhooks**: Make a test payment and verify webhook fires
7. **Blockchain**: Test wallet connection and contract interactions
8. **The Graph**: Verify tutor stats load from subgraph

### Common Issues

#### CORS Errors
- Verify `ALLOWED_ORIGINS` in Railway includes your Cloudflare Pages URL
- Check that Railway service has been redeployed after adding CORS origins
- Ensure the origin matches exactly (including `https://`)

#### Environment Variables Not Working
- Frontend: All variables must start with `VITE_` to be accessible in the browser
- Backend: Variables are accessed via `process.env.VARIABLE_NAME`
- Cloudflare Pages: Variables are set per environment (Production, Preview, etc.)
- Railway: Variables are set per service

#### Build Failures
- Check build logs in Cloudflare Pages or Railway dashboard
- Verify all dependencies are in `package.json`
- Ensure build commands are correct

#### API 404 Errors
- Verify `VITE_API_URL` is set correctly in Cloudflare Pages
- Check that Railway service is running and accessible
- Test the Railway URL directly in browser

## Phase 5: Custom Domain (Optional)

### Add Custom Domain to Cloudflare Pages

1. In Cloudflare Pages dashboard → Your project → Custom domains
2. Click "Set up a custom domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Cloudflare will provide DNS instructions
5. Add the DNS records in Cloudflare DNS (or your DNS provider)
6. Wait for DNS propagation (usually a few minutes)

### Add Custom Domain to Railway

1. In Railway dashboard → Your service → Settings → Domains
2. Click "Generate Domain"
3. Or add your custom domain (requires DNS configuration)
4. Update `ALLOWED_ORIGINS` in Railway to include your custom domain

## Cost Estimate

- **Cloudflare Pages**: Free (unlimited requests, 500 builds/month)
- **Railway**: $5 free credits/month, then ~$5-10/month for small apps
- **Firebase**: Free tier (generous for demos)
- **Stripe**: Free in test mode
- **Polygon Mumbai**: Free (testnet)
- **The Graph**: Free tier available
- **Pinata**: Free tier available

**Total**: ~$0-10/month for demo deployment

## Maintenance

### Updating the Deployment

1. **Backend changes**: Push to GitHub → Railway auto-deploys
2. **Frontend changes**: Push to GitHub → Cloudflare Pages auto-deploys
3. **Environment variables**: Update in respective dashboards → service auto-redeploys

### Monitoring

- **Railway**: Check service logs in Railway dashboard
- **Cloudflare Pages**: Check build logs and analytics in Cloudflare dashboard
- **Firebase**: Monitor in Firebase Console
- **Stripe**: Monitor webhooks in Stripe Dashboard

## Troubleshooting

### Railway Service Won't Start

- Check build logs for errors
- Verify `npm start` command works locally
- Ensure `dist/server/index.js` exists after build
- Check environment variables are set correctly

### Cloudflare Pages Build Fails

- Check build logs for specific errors
- Verify `npm run build` works locally
- Ensure `dist/` directory is created
- Check that all dependencies are in `package.json`

### API Calls Fail from Frontend

- Verify `VITE_API_URL` is correct
- Check CORS configuration in Railway
- Test Railway URL directly (should return JSON)
- Check browser console for specific error messages

### Stripe Webhooks Not Working

- Verify webhook URL is correct in Stripe dashboard
- Check `STRIPE_WEBHOOK_SECRET` is set in Railway
- Test webhook in Stripe dashboard (send test event)
- Check Railway logs for webhook processing errors

## Next Steps

After successful deployment:

1. Set up monitoring and alerts
2. Configure custom domain (if desired)
3. Set up CI/CD for automated testing
4. Deploy to Polygon mainnet (when ready for production)
5. Set up backup and disaster recovery procedures

## Support

- Railway Docs: https://docs.railway.app
- Cloudflare Pages Docs: https://developers.cloudflare.com/pages
- Firebase Docs: https://firebase.google.com/docs
- Stripe Docs: https://stripe.com/docs

