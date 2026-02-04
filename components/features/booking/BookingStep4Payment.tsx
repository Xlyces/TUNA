"use client";

import { useState, memo, useCallback, lazy, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { CreditCard, Wallet } from "lucide-react";

interface BookingStep4PaymentProps {
  clientSecret?: string;
  paymentIntentId?: string;
  onPaymentComplete: () => void;
}

// Helper to get env vars (supports both Vite and Next.js)
const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

// Only load Stripe if we have a publishable key (mock mode doesn't need it)
const publishableKey = getEnv('VITE_STRIPE_PUBLISHABLE_KEY') || getEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
const nodeEnv = getEnv('MODE') || getEnv('NODE_ENV');
const USE_MOCK = !publishableKey || nodeEnv === "development";

// Lazy load Stripe only when needed (not in mock mode)
const loadStripeLazy = publishableKey 
  ? lazy(() => import("@stripe/stripe-js").then(module => ({ default: module.loadStripe })))
  : null;

export const BookingStep4Payment = memo(function BookingStep4Payment({
  clientSecret,
  paymentIntentId,
  onPaymentComplete,
}: BookingStep4PaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStripeCheckout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // In mock mode, skip Stripe initialization and work without clientSecret
      if (USE_MOCK) {
        console.log("🔧 [MOCK] Simulating payment completion");
        // Simulate a small delay for realism
        await new Promise(resolve => setTimeout(resolve, 500));
        onPaymentComplete();
        return;
      }

      // In production, require clientSecret
      if (!clientSecret) {
        throw new Error("Payment information not available");
      }

      if (!loadStripeLazy) {
        throw new Error("Stripe not available");
      }

      const loadStripe = (await import("@stripe/stripe-js")).loadStripe;
      const stripe = await loadStripe(publishableKey!);
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      // In production, this would use Stripe Elements to get the card element
      // const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
      //   payment_method: {
      //     card: cardElement, // Stripe Elements card element
      //   },
      // });
      
      // For now, simulate successful payment
      onPaymentComplete();
    } catch (err: any) {
      setError(err.message || "An error occurred during payment");
      setLoading(false);
    }
  }, [clientSecret, onPaymentComplete]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment</CardTitle>
        <CardDescription>Complete your booking with secure payment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button
            className="w-full"
            size="lg"
            onClick={handleStripeCheckout}
            disabled={loading || (!USE_MOCK && !clientSecret)}
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay with Card
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            size="lg"
            disabled
          >
            <Wallet className="h-4 w-4 mr-2" />
            Pay with FPS (Coming Soon)
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Your payment is secured by Stripe. We never store your card details.
        </p>
      </CardContent>
    </Card>
  );
});

