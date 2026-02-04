# Step-by-Step Escrow Testing Guide

## 🎯 Quick Test Flow

### Prerequisites
1. ✅ Firebase emulators running (`npm run emulators`)
2. ✅ Next.js dev server running (`npm run dev`)
3. ✅ Test users created (see below)

---

## Step 1: Create Test Users

### Via Firebase Emulator UI (Easiest)
1. Go to http://localhost:4000/auth
2. Click "Add user"
3. Create:
   - **Parent**: `parent@test.com` / `password123`
   - **Tutor**: `tutor@test.com` / `password123`

### Via App Registration
1. Go to http://localhost:3000/register
2. Register parent account
3. Register tutor account (with role: "tutor")

### Update Tutor Profile (Required)
1. Go to Firestore: http://localhost:4000/firestore
2. Navigate to `users/{tutorId}`
3. Add field: `stripeAccountId: "acct_test_123"` (mock for testing)
4. Add field: `tutorTokenId: 1` (mock SBT token ID)

---

## Step 2: Test Booking Creation with Escrow

### 2.1 Create Booking
1. Login as parent at http://localhost:3000/login
2. Navigate to tutor profile or booking page
3. Fill booking form:
   - Subject: "Math"
   - Duration: 60 minutes
   - Fee: 500 HKD
   - Scheduled time: Future date/time
   - Student name: "Test Student"
4. Complete payment (use Stripe test card: `4242 4242 4242 4242`)

### 2.2 Verify Escrow in Firestore
1. Open http://localhost:4000/firestore
2. Go to `bookings` collection
3. Find your booking document
4. **Verify these fields:**
   - ✅ `status: "payment_held"` (NOT "confirmed")
   - ✅ `paymentCaptured: false`
   - ✅ `paymentStatus: "requires_capture"`
   - ✅ `tutorConfirmed: false`
   - ✅ `parentConfirmed: false`
   - ✅ `confirmationDeadline` exists (timestamp)
   - ✅ `paymentIntentId` exists

**If any of these are wrong, check:**
- Payment intent creation in `lib/stripe/payments.ts`
- Webhook handler in `app/api/webhooks/stripe/route.ts`

---

## Step 3: Test Dual Confirmation

### 3.1 Tutor Confirms
1. **Get Tutor Auth Token:**
   - Login as tutor in app
   - Open browser console
   - Run: `await firebase.auth().currentUser.getIdToken()`
   - Copy the token

2. **Call Confirmation API:**
   ```bash
   curl -X POST http://localhost:3000/api/bookings/{bookingId}/confirm \
     -H "Authorization: Bearer {tutor_token}" \
     -H "Content-Type: application/json"
   ```

3. **Verify in Firestore:**
   - ✅ `tutorConfirmed: true`
   - ✅ `tutorConfirmedAt` timestamp exists
   - ✅ `status: "awaiting_confirmation"` (NOT "completed" yet)
   - ✅ `paymentCaptured: false` (still not captured)

### 3.2 Parent Confirms
1. **Get Parent Auth Token** (same method as above)

2. **Call Confirmation API:**
   ```bash
   curl -X POST http://localhost:3000/api/bookings/{bookingId}/confirm \
     -H "Authorization: Bearer {parent_token}" \
     -H "Content-Type: application/json"
   ```

3. **Verify in Firestore:**
   - ✅ `parentConfirmed: true`
   - ✅ `parentConfirmedAt` timestamp exists
   - ✅ `status: "completed"`
   - ✅ `paymentCaptured: true`
   - ✅ `paymentCapturedAt` timestamp exists
   - ✅ Parent `walletCredits` increased by 5

4. **Check Stripe Dashboard:**
   - Payment should be "Captured" (not just "Authorized")

---

## Step 4: Test Auto-Release

### 4.1 Setup Test Booking
1. Create a new booking
2. In Firestore, manually set `confirmationDeadline` to a past date:
   - Click on `confirmationDeadline` field
   - Change to: `2024-01-01T00:00:00Z` (or any past date)

### 4.2 Trigger Auto-Release
```bash
# Without API key (if AUTO_RELEASE_API_KEY not set)
curl -X POST http://localhost:3000/api/bookings/auto-release

# With API key
curl -X POST http://localhost:3000/api/bookings/auto-release \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 4.3 Verify Auto-Release
- ✅ Booking status: `completed`
- ✅ `paymentCaptured: true`
- ✅ `autoReleased: true`
- ✅ `autoReleasedAt` timestamp exists
- ✅ Credits awarded to parent

---

## Step 5: Test Dispute Handling

### 5.1 Raise Dispute
```bash
curl -X POST http://localhost:3000/api/bookings/{bookingId}/dispute \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Lesson quality was poor"}'
```

### 5.2 Verify Dispute Tracked
- ✅ `disputed: true`
- ✅ `disputeReason: "Lesson quality was poor"`
- ✅ `disputedBy: "parent"` or `"tutor"`
- ✅ `disputedAt` timestamp exists

### 5.3 Verify Payment Still Releases
- Trigger auto-release (or wait for timeout)
- ✅ Payment still captured despite dispute
- ✅ Status becomes `completed`

### 5.4 Test Negative Rating
1. After payment releases, parent can rate
2. Navigate to `/lessons/{id}/complete`
3. Submit low rating (1-2 stars)
4. ✅ Rating saved and affects tutor reputation

---

## Step 6: Test Credit System

### 6.1 Verify Credits Awarded
After both parties confirm (or auto-release):
- ✅ Parent `walletCredits` increased by 5
- ✅ Booking `creditsAwarded: true`

### 6.2 Test Credit Redemption
1. Create new booking
2. Use 50 credits for HKD 50 discount
3. ✅ `creditsUsed: 50`
- ✅ Final fee reduced by HKD 50
- ✅ Parent credits decreased by 50

---

## Step 7: Test Edge Cases

### 7.1 Single Confirmation (No Auto-Release)
- Only tutor confirms
- Do NOT trigger auto-release
- ✅ Payment should NOT be captured
- ✅ Status: `awaiting_confirmation`

### 7.2 Double Confirmation Prevention
- Try to confirm twice as same user
- ✅ Should return error: "Already confirmed"

### 7.3 Credits Not Double-Awarded
- Complete booking (credits awarded)
- Try to rate again
- ✅ Credits should NOT be awarded again
- ✅ `creditsAwarded: true` prevents double-awarding

---

## 🔍 Debugging Tips

### Check Server Logs
Watch terminal where `npm run dev` is running for:
- API endpoint calls
- Errors
- Stripe webhook events

### Check Firebase Emulator Logs
Watch terminal where `npm run emulators` is running for:
- Firestore operations
- Auth operations

### Check Browser Console
- Open DevTools (F12)
- Check Network tab for API calls
- Check Console for errors

### Common Issues

**"Payment not held"**
- Check `lib/stripe/payments.ts` line 24: `capture_method: "manual"`

**"Confirmation not working"**
- Verify user role matches (tutor vs parent)
- Check booking status allows confirmation
- Verify auth token is valid

**"Auto-release not working"**
- Check `confirmationDeadline` is in the past
- Verify query is finding bookings
- Check console for errors

---

## ✅ Success Criteria

All tests pass if:
- ✅ Payments held in escrow (not captured immediately)
- ✅ Dual confirmation required for immediate release
- ✅ Auto-release works after 72h timeout
- ✅ Disputes tracked but don't block payment
- ✅ Credits awarded correctly (+5, not double)
- ✅ Homework references removed from docs
- ✅ All flowcharts updated

---

## 📞 Need Help?

1. Check `docs/ESCROW_TESTING.md` for detailed scenarios
2. Review server logs for errors
3. Check Firestore data structure matches expected schema
4. Verify Stripe test mode is configured correctly

