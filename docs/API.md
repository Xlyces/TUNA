# TUNA Platform - API Documentation

## Authentication

All API routes (except public ones) require Firebase authentication token in the `Authorization` header.

```
Authorization: Bearer <firebase_id_token>
```

## API Routes

### `/api/auth`

#### POST `/api/auth/register`

Register a new user.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "tutor" | "parent" | "admin",
  "name": "John Doe",
  "phone852": "+85212345678"
}
```

**Response**:
```json
{
  "uid": "firebase_user_id",
  "email": "user@example.com",
  "role": "tutor"
}
```

### `/api/verify`

#### POST `/api/verify`

Submit tutor verification documents.

**Request Body** (FormData):
- `pdf`: PDF file (DSE/IB certificate)
- `selfie`: Image file (selfie)
- `examType`: "DSE" | "IB"

**Response**:
```json
{
  "verificationId": "verification_id",
  "status": "pending",
  "ocrData": {
    "math": "5**",
    "english": "5*"
  }
}
```

#### GET `/api/verify/[id]`

Get verification status.

**Response**:
```json
{
  "id": "verification_id",
  "status": "pending" | "approved" | "rejected",
  "ocrData": {...},
  "credHash": "ipfs_hash",
  "tutorTokenId": 123
}
```

### `/api/bookings`

#### POST `/api/bookings`

Create a new booking.

**Request Body**:
```json
{
  "tutorId": "tutor_firebase_uid",
  "tutorTokenId": 123,
  "subject": "Mathematics",
  "duration": 60,
  "fee": 50000,
  "scheduledAt": "2024-01-15T10:00:00Z"
}
```

**Response**:
```json
{
  "bookingId": "booking_id",
  "paymentIntentId": "pi_xxx",
  "clientSecret": "pi_xxx_secret_xxx"
}
```

#### GET `/api/bookings/[id]`

Get booking details.

**Response**:
```json
{
  "id": "booking_id",
  "parentId": "parent_uid",
  "tutorId": "tutor_uid",
  "status": "confirmed",
  "scheduledAt": "2024-01-15T10:00:00Z",
  "onChainTxHash": "0x..."
}
```

### `/api/lessons/[id]/rate`

#### POST `/api/lessons/[id]/rate`

Rate a completed lesson.

**Request Body**:
```json
{
  "rating": 5,
  "feedback": "Great lesson!"
}
```

**Response**:
```json
{
  "success": true,
  "txHash": "0x...",
  "creditsEarned": 5
}
```

### `/api/webhooks/stripe`

#### POST `/api/webhooks/stripe`

Stripe webhook handler for payment events.

**Headers**:
- `stripe-signature`: Stripe webhook signature

**Events Handled**:
- `payment_intent.succeeded`: Log lesson on-chain
- `payment_intent.payment_failed`: Update booking status

**Response**: `200 OK`

## The Graph Queries

### Get Tutor Stats

```graphql
query GetTutorStats($id: ID!) {
  tutor(id: $id) {
    id
    totalHours
    totalEarnings
    averageRating
    lessonCount
    lessons(first: 100, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      durationMins
      feeHkd
      subjectId
      rating
    }
  }
}
```

### Get Multiple Tutors

```graphql
query GetMultipleTutors($ids: [ID!]!) {
  tutors(where: { id_in: $ids }) {
    id
    totalHours
    totalEarnings
    averageRating
    lessonCount
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `UNAUTHORIZED`: Missing or invalid auth token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input
- `PAYMENT_ERROR`: Payment processing failed
- `BLOCKCHAIN_ERROR`: Blockchain transaction failed

