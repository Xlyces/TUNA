"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentIntent = createPaymentIntent;
exports.capturePayment = capturePayment;
exports.cancelPaymentIntent = cancelPaymentIntent;
exports.createTutorAccount = createTutorAccount;
const stripe_1 = __importDefault(require("stripe"));
const mock_payments_1 = require("./mock-payments");
// Use mock mode if STRIPE_SECRET_KEY is not set or in development
const USE_MOCK = !process.env.STRIPE_SECRET_KEY || process.env.NODE_ENV === "development";
let stripe = null;
if (!USE_MOCK && process.env.STRIPE_SECRET_KEY) {
    try {
        stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2025-02-24.acacia",
            typescript: true,
        });
    }
    catch (error) {
        console.warn("Failed to initialize Stripe, falling back to mock mode:", error);
    }
}
else {
    console.log("🔧 [DEV] Using mock Stripe payments (no API key required)");
}
/**
 * Create a payment intent for a lesson booking
 * @param amount Amount in HKD cents (e.g., 50000 = HKD 500.00)
 * @param tutorStripeAccountId The Stripe Connect account ID of the tutor
 * @param metadata Additional metadata (bookingId, tutorTokenId, etc.)
 * @returns The payment intent
 */
async function createPaymentIntent(amount, tutorStripeAccountId, metadata) {
    if (USE_MOCK) {
        const mockIntent = await (0, mock_payments_1.createMockPaymentIntent)(amount, tutorStripeAccountId, metadata);
        // Convert to Stripe-like format
        return {
            id: mockIntent.id,
            amount: mockIntent.amount,
            currency: mockIntent.currency,
            status: mockIntent.status,
            client_secret: mockIntent.client_secret,
            metadata: mockIntent.metadata,
            capture_method: mockIntent.capture_method,
        };
    }
    if (!stripe) {
        throw new Error("Stripe not initialized");
    }
    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "hkd",
        capture_method: "manual", // Hold funds in escrow, don't capture immediately
        application_fee_amount: Math.floor(amount * 0.2), // 20% platform commission
        on_behalf_of: tutorStripeAccountId,
        transfer_data: {
            destination: tutorStripeAccountId,
        },
        metadata,
    }, {
        stripeAccount: tutorStripeAccountId,
    });
    return paymentIntent;
}
/**
 * Capture a payment intent that was created with manual capture
 * @param paymentIntentId The payment intent ID to capture
 * @returns The captured payment intent
 */
async function capturePayment(paymentIntentId) {
    if (USE_MOCK) {
        const mockIntent = await (0, mock_payments_1.captureMockPayment)(paymentIntentId);
        return {
            id: mockIntent.id,
            amount: mockIntent.amount,
            currency: mockIntent.currency,
            status: mockIntent.status,
            client_secret: mockIntent.client_secret,
            metadata: mockIntent.metadata,
            capture_method: mockIntent.capture_method,
        };
    }
    if (!stripe) {
        throw new Error("Stripe not initialized");
    }
    return await stripe.paymentIntents.capture(paymentIntentId);
}
/**
 * Cancel a payment intent (for refunds before capture)
 * @param paymentIntentId The payment intent ID to cancel
 * @returns The canceled payment intent
 */
async function cancelPaymentIntent(paymentIntentId) {
    if (USE_MOCK) {
        const mockIntent = await (0, mock_payments_1.cancelMockPayment)(paymentIntentId);
        return {
            id: mockIntent.id,
            amount: mockIntent.amount,
            currency: mockIntent.currency,
            status: mockIntent.status,
            client_secret: mockIntent.client_secret,
            metadata: mockIntent.metadata,
            capture_method: mockIntent.capture_method,
        };
    }
    if (!stripe) {
        throw new Error("Stripe not initialized");
    }
    return await stripe.paymentIntents.cancel(paymentIntentId);
}
/**
 * Create a Stripe Connect account for a tutor
 * @param email Tutor's email
 * @param country Country code (e.g., "HK")
 * @returns The account object
 */
async function createTutorAccount(email, country = "HK") {
    if (USE_MOCK) {
        const mockAccount = {
            id: `acct_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email,
            country,
        };
        console.log("🔧 [MOCK] Created tutor account:", mockAccount);
        return mockAccount;
    }
    if (!stripe) {
        throw new Error("Stripe not initialized");
    }
    const account = await stripe.accounts.create({
        type: "express",
        country,
        email,
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
    });
    return account;
}
