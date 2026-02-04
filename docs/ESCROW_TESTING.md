# Escrow Payment System - Testing Guide

## Overview

This guide helps you test the new escrow payment system with dual confirmation, automated dispute handling, and auto-release functionality.

## Prerequisites

1. **Firebase Emulators Running**
   ```bash
   npm run emulators
   ```
   Access UI at: http://localhost:4000

2. **Next.js Dev Server Running**
   ```bash
   npm run dev
   ```
   Access app at: http://localhost:3000

3. **Test Users Created**
   - Parent user (role: "parent")
   - Tutor user (role: "tutor") with Stripe account ID

## Test Scenarios

### Scenario 1: Happy Path - Dual Confirmation

**Goal**: Test the complete flow where both parties confirm and payment releases immediately.

**Steps**:
1. **Create Booking as Parent**
   - Login as parent
   - Navigate to `/book/[tutorId]`
   - Fill booking form and submit
   - Complete Stripe payment (use test card: `4242 4242 4242 4242`)
   - Verify booking status is `payment_held`

2. **Verify Payment Held in Escrow**
   - Check Firestore: `bookings/{bookingId}`
   - Verify: `status: "payment_held"`
   - Verify: `paymentStatus: "requires_capture"`
   - Verify: `paymentCaptured: false`
   - Verify: `tutorConfirmed: false`, `parentConfirmed: false`

3. **Tutor Confirms**
   - Login as tutor
   - Navigate to booking details
   - Click "Confirm as Tutor"
   - Verify: `tutorConfirmed: true`
   - Verify: `status: "awaiting_confirmation"`

4. **Parent Confirms**
   - Login as parent
   - Navigate to booking details
   - Click "Confirm as Parent"
   - Verify: `parentConfirmed: true`
   - Verify: `status: "completed"`
   - Verify: `paymentCaptured: true`
   - Verify: Parent wallet credits increased by +5

5. **Check Stripe**
   - Payment should be captured (not just authorized)
   - Funds should be transferred to tutor account

**Expected Result**: Payment captured immediately, credits awarded, booking completed.

---

### Scenario 2: Auto-Release After Timeout

**Goal**: Test that payment auto-releases after 72 hours even if only one party confirms.

**Steps**:
1. **Create Booking**
   - Create booking as parent
   - Complete payment

2. **Only Tutor Confirms**
   - Tutor confirms completion
   - Parent does NOT confirm

3. **Manually Trigger Auto-Release** (for testing)
   ```bash
   # Call auto-release endpoint
   curl -X POST http://localhost:3000/api/bookings/auto-release \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```
   
   Or modify `confirmationDeadline` in Firestore to be in the past, then call endpoint.

4. **Verify Auto-Release**
   - Check booking: `status: "completed"`
   - Check: `paymentCaptured: true`
   - Check: `autoReleased: true`
   - Verify payment was captured in Stripe
   - Verify credits awarded to parent

**Expected Result**: Payment auto-released after timeout, booking completed, credits awarded.

---

### Scenario 3: Dispute Handling

**Goal**: Test that disputes don't block payment but enable negative ratings.

**Steps**:
1. **Create Booking & Payment**
   - Create booking and complete payment

2. **Raise Dispute**
   - Either party raises dispute:
   ```bash
   curl -X POST http://localhost:3000/api/bookings/{bookingId}/dispute \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{"reason": "Lesson quality was poor"}'
   ```

3. **Verify Dispute Tracked**
   - Check booking: `disputed: true`
   - Check: `disputeReason: "Lesson quality was poor"`
   - Check: `disputedBy: "parent"` or `"tutor"`

4. **Auto-Release Still Happens**
   - Wait for timeout or trigger auto-release
   - Verify payment still releases despite dispute
   - Verify: `status: "completed"`

5. **Parent Can Rate Negatively**
   - Parent navigates to `/lessons/{id}/complete`
   - Can submit negative rating (1-2 stars)
   - Rating affects tutor reputation

**Expected Result**: Dispute tracked, payment still releases, negative rating possible.

---

### Scenario 4: Single Confirmation (No Auto-Release Yet)

**Goal**: Test that payment does NOT release with only one confirmation.

**Steps**:
1. **Create Booking & Payment**
   - Create booking and complete payment

2. **Only One Party Confirms**
   - Tutor confirms (or parent confirms)
   - Do NOT trigger auto-release

3. **Verify Payment Still Held**
   - Check booking: `status: "awaiting_confirmation"`
   - Check: `paymentCaptured: false`
   - Verify payment NOT captured in Stripe

**Expected Result**: Payment remains in escrow, not captured.

---

### Scenario 5: Credit System

**Goal**: Test simplified credit system (+5 for attendance only).

**Steps**:
1. **Complete Lesson with Both Confirmations**
   - Both parties confirm
   - Payment captured

2. **Verify Credits Awarded**
   - Check parent user: `walletCredits` increased by 5
   - Check booking: `creditsAwarded: true`

3. **Redeem Credits on Next Booking**
   - Parent creates new booking
   - Apply 50 credits (HKD 50 discount)
   - Verify: `creditsUsed: 50`
   - Verify: Final fee reduced by HKD 50

**Expected Result**: +5 credits for attendance, -50 credits for HKD 50 discount.

---

## API Endpoint Testing

### 1. Create Booking (with Escrow)

```bash
POST /api/bookings
Authorization: Bearer {parent_token}
Content-Type: application/json

{
  "tutorId": "tutor_user_id",
  "tutorTokenId": 1,
  "subject": "Math",
  "duration": 60,
  "fee": 500,
  "scheduledAt": "2024-12-25T10:00:00Z",
  "studentName": "John Doe",
  "studentGrade": "Grade 10",
  "creditsUsed": 0
}
```

**Expected Response**:
```json
{
  "bookingId": "booking_123",
  "paymentIntentId": "pi_xxx",
  "clientSecret": "pi_xxx_secret_xxx"
}
```

**Verify in Firestore**:
- `status: "payment_held"`
- `confirmationDeadline` set to 72h from lesson end
- `tutorConfirmed: false`
- `parentConfirmed: false`

---

### 2. Confirm Booking (Tutor or Parent)

```bash
POST /api/bookings/{bookingId}/confirm
Authorization: Bearer {tutor_or_parent_token}
```

**Expected Response** (first confirmation):
```json
{
  "success": true,
  "message": "Tutor confirmation recorded. Waiting for parent confirmation.",
  "bothConfirmed": false
}
```

**Expected Response** (both confirmed):
```json
{
  "success": true,
  "message": "Both parties confirmed. Payment captured and booking completed.",
  "bothConfirmed": true,
  "creditsAwarded": 5
}
```

---

### 3. Raise Dispute

```bash
POST /api/bookings/{bookingId}/dispute
Authorization: Bearer {tutor_or_parent_token}
Content-Type: application/json

{
  "reason": "Lesson did not meet expectations"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Dispute raised. Payment will still be released after timeout, but parent can provide negative rating."
}
```

**Verify in Firestore**:
- `disputed: true`
- `disputeReason: "Lesson did not meet expectations"`
- `disputedBy: "parent"` or `"tutor"`

---

### 4. Auto-Release Endpoint

```bash
POST /api/bookings/auto-release
Authorization: Bearer {AUTO_RELEASE_API_KEY}
```

**Expected Response**:
```json
{
  "success": true,
  "releasedCount": 2,
  "releasedBookings": ["booking_1", "booking_2"],
  "message": "Auto-released 2 booking(s)"
}
```

---

## Manual Testing Checklist

### Payment Escrow
- [ ] Payment intent created with `capture_method: "manual"`
- [ ] Booking status set to `payment_held` after payment
- [ ] Payment NOT captured immediately
- [ ] Payment hash generated and stored

### Dual Confirmation
- [ ] Tutor can confirm independently
- [ ] Parent can confirm independently
- [ ] Status updates to `awaiting_confirmation` after first confirmation
- [ ] Payment captured when both confirm
- [ ] Status updates to `completed` when both confirm

### Auto-Release
- [ ] Auto-release endpoint processes bookings past deadline
- [ ] Payment captured even if only one party confirmed
- [ ] Payment captured even if dispute raised
- [ ] Credits awarded on auto-release
- [ ] Lesson logged on-chain on auto-release

### Dispute Handling
- [ ] Either party can raise dispute
- [ ] Dispute tracked but doesn't block payment
- [ ] Payment releases after timeout despite dispute
- [ ] Parent can rate negatively if disputed

### Credit System
- [ ] +5 credits awarded after both confirm
- [ ] +5 credits awarded on auto-release
- [ ] Credits not double-awarded
- [ ] Credits can be redeemed (50 credits = HKD 50 off)

### Webhook Handling
- [ ] `payment_intent.succeeded` sets status to `payment_held`
- [ ] `payment_intent.captured` updates `paymentCaptured: true`
- [ ] `payment_intent.canceled` sets status to `cancelled`

---

## Firebase Emulator Testing

### View Bookings in Firestore

1. Open http://localhost:4000/firestore
2. Navigate to `bookings` collection
3. Check booking document fields:
   - `status`: Should be `payment_held`, `awaiting_confirmation`, or `completed`
   - `tutorConfirmed`: Boolean
   - `parentConfirmed`: Boolean
   - `disputed`: Boolean
   - `paymentCaptured`: Boolean
   - `confirmationDeadline`: Timestamp
   - `paymentIntentId`: String

### View Users

1. Navigate to `users` collection
2. Check `walletCredits` field after confirmation
3. Verify credits increase by 5

---

## Stripe Testing

### Test Cards

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### Stripe Dashboard

1. Go to Stripe Dashboard → Payments
2. Find payment intent by `paymentIntentId`
3. Verify:
   - Status: `Requires capture` (before capture)
   - Status: `Succeeded` (after capture)
   - Capture method: `Manual`

---

## Quick Test Script

Create a test script to quickly test the flow:

```typescript
// scripts/test-escrow.ts
// Run with: tsx scripts/test-escrow.ts

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// Test escrow flow programmatically
async function testEscrowFlow() {
  // 1. Create test booking
  // 2. Simulate payment authorization
  // 3. Test tutor confirmation
  // 4. Test parent confirmation
  // 5. Verify payment captured
  // 6. Verify credits awarded
}
```

---

## Common Issues & Solutions

### Issue: Payment not being held
**Solution**: Check that `capture_method: "manual"` is set in `createPaymentIntent()`

### Issue: Auto-release not working
**Solution**: 
- Verify `confirmationDeadline` is set correctly
- Check auto-release endpoint is being called
- Verify API key if using authentication

### Issue: Credits not awarded
**Solution**:
- Check `creditsAwarded` flag to prevent double-awarding
- Verify user document exists
- Check `updateUserProfile` function

### Issue: Webhook not firing
**Solution**:
- Use Stripe CLI to forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Check webhook secret in environment variables

---

## Next Steps

1. Test all scenarios above
2. Verify edge cases (cancellations, refunds)
3. Test with real Stripe test mode
4. Monitor logs for errors
5. Test auto-release cron job setup

