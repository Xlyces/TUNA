# Quick Start: Testing Escrow Payment System

## 🚀 Quick Setup (3 Terminals)

### Terminal 1: Firebase Emulators
```bash
npm run emulators
```
✅ Emulator UI: http://localhost:4000

### Terminal 2: Next.js Dev Server
```bash
npm run dev
```
✅ App: http://localhost:3000

### Terminal 3: Run Tests
```bash
# Option 1: Automated test script
tsx scripts/test-escrow-flow.ts

# Option 2: Manual API testing (see below)
```

---

## 📝 Manual Testing Steps

### Step 1: Create Test Users

**Option A: Use Firebase Emulator UI**
1. Go to http://localhost:4000/auth
2. Create users manually

**Option B: Use Seed Script**
```bash
npm run seed:users
```

**Option C: Register via App**
1. Go to http://localhost:3000/register
2. Create:
   - Parent: `parent@test.com` / `password123`
   - Tutor: `tutor@test.com` / `password123`

---

### Step 2: Test Booking Creation with Escrow

1. **Login as Parent**
   - Go to http://localhost:3000/login
   - Login with parent credentials

2. **Create Booking**
   - Navigate to `/book/{tutorId}` (or search for tutor first)
   - Fill booking form
   - Complete payment (use test card: `4242 4242 4242 4242`)

3. **Verify Escrow**
   - Open http://localhost:4000/firestore
   - Navigate to `bookings` collection
   - Find your booking
   - ✅ Check: `status: "payment_held"`
   - ✅ Check: `paymentCaptured: false`
   - ✅ Check: `confirmationDeadline` is set (72h from lesson end)

---

### Step 3: Test Dual Confirmation

**Tutor Confirms:**
1. Login as tutor
2. Navigate to booking details
3. Click "Confirm as Tutor"
4. ✅ Check Firestore: `tutorConfirmed: true`
5. ✅ Check: `status: "awaiting_confirmation"`

**Parent Confirms:**
1. Login as parent
2. Navigate to booking details
3. Click "Confirm as Parent"
4. ✅ Check Firestore: `parentConfirmed: true`
5. ✅ Check: `status: "completed"`
6. ✅ Check: `paymentCaptured: true`
7. ✅ Check: Parent `walletCredits` increased by 5

---

### Step 4: Test Auto-Release

**Setup:**
1. Create a booking
2. Manually set `confirmationDeadline` in Firestore to a past date
   - Or wait 72 hours (for real testing)

**Trigger Auto-Release:**
```bash
# Without API key (if not set)
curl -X POST http://localhost:3000/api/bookings/auto-release

# With API key
curl -X POST http://localhost:3000/api/bookings/auto-release \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Verify:**
- ✅ Booking status: `completed`
- ✅ `paymentCaptured: true`
- ✅ `autoReleased: true`
- ✅ Credits awarded

---

### Step 5: Test Dispute

**Raise Dispute:**
```bash
curl -X POST http://localhost:3000/api/bookings/{bookingId}/dispute \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Lesson quality was poor"}'
```

**Verify:**
- ✅ `disputed: true`
- ✅ `disputeReason` set
- ✅ Payment still releases after timeout
- ✅ Parent can rate negatively

---

## 🔍 What to Check in Firebase Emulator

### Firestore Collections

**`bookings` Collection:**
- `status`: `payment_held` → `awaiting_confirmation` → `completed`
- `tutorConfirmed`: `false` → `true`
- `parentConfirmed`: `false` → `true`
- `paymentCaptured`: `false` → `true`
- `disputed`: `false` → `true` (if dispute raised)
- `confirmationDeadline`: Timestamp (72h from lesson end)
- `paymentIntentId`: Stripe payment intent ID
- `paymentHash`: Generated hash for on-chain logging

**`users` Collection:**
- `walletCredits`: Should increase by 5 after confirmation

---

## 🧪 API Testing with curl

### 1. Create Booking
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer {parent_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "tutorId": "tutor_user_id",
    "tutorTokenId": 1,
    "subject": "Math",
    "duration": 60,
    "fee": 500,
    "scheduledAt": "2024-12-25T10:00:00Z",
    "studentName": "John Doe",
    "studentGrade": "Grade 10",
    "creditsUsed": 0
  }'
```

### 2. Tutor Confirms
```bash
curl -X POST http://localhost:3000/api/bookings/{bookingId}/confirm \
  -H "Authorization: Bearer {tutor_token}"
```

### 3. Parent Confirms
```bash
curl -X POST http://localhost:3000/api/bookings/{bookingId}/confirm \
  -H "Authorization: Bearer {parent_token}"
```

### 4. Raise Dispute
```bash
curl -X POST http://localhost:3000/api/bookings/{bookingId}/dispute \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Test dispute"}'
```

### 5. Auto-Release
```bash
curl -X POST http://localhost:3000/api/bookings/auto-release
```

---

## ✅ Testing Checklist

- [ ] Payment created with `capture_method: "manual"`
- [ ] Booking status: `payment_held` after payment
- [ ] Tutor can confirm independently
- [ ] Parent can confirm independently
- [ ] Payment captured when both confirm
- [ ] Credits awarded (+5) when both confirm
- [ ] Auto-release works after timeout
- [ ] Dispute doesn't block payment
- [ ] Credits not double-awarded
- [ ] Webhook handles `payment_intent.succeeded`
- [ ] Webhook handles `payment_intent.captured`

---

## 🐛 Common Issues

**Issue**: "Payment not held in escrow"
- Check `lib/stripe/payments.ts` - `capture_method: "manual"` should be set

**Issue**: "Auto-release not working"
- Check `confirmationDeadline` is set correctly
- Verify deadline has passed
- Check auto-release endpoint is accessible

**Issue**: "Credits not awarded"
- Check `creditsAwarded` flag prevents double-awarding
- Verify user document exists
- Check console for errors

---

## 📚 Full Documentation

See `docs/ESCROW_TESTING.md` for comprehensive testing guide.

