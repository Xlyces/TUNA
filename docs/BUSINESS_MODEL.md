# TUNA Platform - Business Model

## Value Proposition

### For Parents
- Access to verified HKU/UST tutors
- Transparent, on-chain reputation (can't be faked)
- Learn-to-earn credits incentivize engagement
- Easy payment via FPS (no crypto knowledge required)

### For Tutors
- Portable reputation (SBT) that follows them
- Direct connection with parents (no 50%+ middleman)
- Transparent earnings and lesson history
- Credential verification reduces fraud

### For Platform
- 20% commission on all lessons
- Network effects (more tutors → more parents → more tutors)
- Moat: SBT reputation system is hard to replicate
- Data: Reputation data becomes valuable asset

## Revenue Model

### Commission Structure

```
Lesson Fee: HKD 500
├── Platform Commission (20%): HKD 100
├── Tutor Earnings (80%): HKD 400
└── Payment Processing: ~HKD 15 (3% Stripe)
```

### Monthly Targets (Month 3)

- 100 verified tutors (50 active)
- 300 parent signups (100 paying)
- HKD 50,000 GMV
- HKD 10,000 platform revenue
- HKD 7,500 net revenue (after costs)

## Key Metrics

### Growth Metrics
- Tutor acquisition rate: 10/week
- Parent signup rate: 30/week
- Conversion rate (signup → booking): 30%
- Retention rate (Month 2 → Month 3): 60%

### Financial Metrics
- GMV per active tutor: HKD 1,000/month
- Average lesson fee: HKD 500
- Platform take rate: 20%
- Payment processing cost: 3-4%

### Reputation Metrics
- Average lessons per tutor: 20+ (Month 3)
- Average rating: 4.5+ stars
- SBT adoption rate: 100% (all verified tutors)

## Cost Structure

### Development Costs (One-Time)
- Solo developer: 400-480 hours
- Opportunity cost: HKD 80,000-120,000

### Monthly Operating Costs

**Infrastructure**:
- Vercel Pro: HKD 150/month
- Firebase (1k users): HKD 500/month
- Polygon gas: HKD 50/month
- IPFS (Pinata): HKD 100/month
- Google Vision API: HKD 200/month
- **Total**: ~HKD 1,000/month

**Payment Processing**:
- Stripe fees: 3-4% of GMV
- At HKD 50k GMV: HKD 1,500-2,000/month

**Total Monthly**: HKD 2,500-3,000/month

## Break-Even Analysis

**Month 3 Target**:
- GMV: HKD 50,000
- Platform Revenue (20%): HKD 10,000
- Payment Processing (3%): -HKD 1,500
- Infrastructure: -HKD 1,000
- **Net Revenue**: HKD 7,500

**Break-even**: Month 2-3 (if targets met)

## Competitive Advantages

### 1. SBT Reputation Moat
- Immutable, verifiable reputation
- Portable across platforms
- Hard to replicate

### 2. Verification System
- OCR + manual verification
- IPFS credential storage
- On-chain credential hash

### 3. Payment Oracle
- Web2 UX (FPS payments)
- Web3 backend (on-chain logging)
- Best of both worlds

### 4. Learn-to-Earn
- Credits incentivize engagement
- Increases retention
- Differentiates from competitors

## Growth Strategy

### Phase 1: MVP (Months 1-3)
- 100 verified tutors
- 300 parent signups
- HKD 50k GMV
- Prove product-market fit

### Phase 2: Scale (Months 4-6)
- 500 verified tutors
- 1,500 parent signups
- HKD 250k GMV
- Expand to more subjects

### Phase 3: Expansion (Months 7-12)
- 2,000 verified tutors
- 5,000 parent signups
- HKD 1M GMV
- Expand to other regions

## Risk Mitigation

### Technical Risks
- Smart contract bugs → Audit before mainnet
- Payment failures → Retry logic, monitoring
- Data loss → Firebase backups
- Gas price spikes → Layer 2 (Polygon)

### Business Risks
- Low adoption → Marketing push
- Tutor churn → Better incentives
- Payment disputes → Clear policies
- Regulatory changes → Legal review

## Success Criteria

### Month 3 KPIs
- 100 verified tutors (50 active)
- 300 parent signups (100 paying)
- HKD 50,000 GMV
- 4.5+ average rating
- 30% conversion rate

### Investment Readiness
- Live app (vercel.app)
- Test SBT #1 (logs visible)
- Stripe prod test mode (real HKD 100 tx)
- Notion roadmap v2 (B2B licensing)

