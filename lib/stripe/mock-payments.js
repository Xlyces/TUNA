"use strict";
/**
 * Mock Stripe Payment Service for Development
 * This emulates Stripe API calls without requiring actual Stripe keys
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockPaymentIntent = createMockPaymentIntent;
exports.captureMockPayment = captureMockPayment;
exports.cancelMockPayment = cancelMockPayment;
exports.getMockPaymentIntent = getMockPaymentIntent;
exports.listMockPaymentIntents = listMockPaymentIntents;
// In-memory store for mock payment intents
const mockPaymentIntents = new Map();
/**
 * Create a mock payment intent
 */
async function createMockPaymentIntent(amount, tutorStripeAccountId, metadata) {
    const id = `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const clientSecret = `${id}_secret_mock_${Math.random().toString(36).substr(2, 16)}`;
    const paymentIntent = {
        id,
        amount,
        currency: "hkd",
        status: "requires_capture", // Funds held in escrow
        client_secret: clientSecret,
        metadata,
        capture_method: "manual",
    };
    mockPaymentIntents.set(id, paymentIntent);
    console.log("🔧 [MOCK] Created payment intent:", {
        id,
        amount: `HKD ${amount / 100}`,
        status: paymentIntent.status,
    });
    return paymentIntent;
}
/**
 * Capture a mock payment intent
 */
async function captureMockPayment(paymentIntentId) {
    const paymentIntent = mockPaymentIntents.get(paymentIntentId);
    if (!paymentIntent) {
        throw new Error(`Payment intent ${paymentIntentId} not found`);
    }
    if (paymentIntent.status !== "requires_capture") {
        throw new Error(`Payment intent ${paymentIntentId} cannot be captured (status: ${paymentIntent.status})`);
    }
    paymentIntent.status = "succeeded";
    mockPaymentIntents.set(paymentIntentId, paymentIntent);
    console.log("🔧 [MOCK] Captured payment intent:", paymentIntentId);
    return paymentIntent;
}
/**
 * Cancel a mock payment intent
 */
async function cancelMockPayment(paymentIntentId) {
    const paymentIntent = mockPaymentIntents.get(paymentIntentId);
    if (!paymentIntent) {
        throw new Error(`Payment intent ${paymentIntentId} not found`);
    }
    paymentIntent.status = "canceled";
    mockPaymentIntents.set(paymentIntentId, paymentIntent);
    console.log("🔧 [MOCK] Canceled payment intent:", paymentIntentId);
    return paymentIntent;
}
/**
 * Get a mock payment intent
 */
function getMockPaymentIntent(paymentIntentId) {
    return mockPaymentIntents.get(paymentIntentId);
}
/**
 * List all mock payment intents (for debugging)
 */
function listMockPaymentIntents() {
    return Array.from(mockPaymentIntents.values());
}
