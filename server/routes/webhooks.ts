import { Router, Request, Response } from 'express';
import { stripe } from '@/lib/stripe/payments';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { logLesson } from '@/lib/blockchain/logLesson';
import { ethers } from 'ethers';

const router = Router();
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// POST /api/webhooks/stripe - Stripe webhook handler
router.post('/stripe', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const signature = req.headers['stripe-signature'] as string;

    if (!signature || !webhookSecret) {
      return res.status(400).json({ error: 'Missing signature or webhook secret' });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error);
      return res.status(400).json({ error: `Webhook Error: ${error.message}` });
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        await handlePaymentAuthorized(paymentIntent);
        break;
      }
      case 'payment_intent.captured': {
        const paymentIntent = event.data.object as any;
        await handlePaymentCaptured(paymentIntent);
        break;
      }
      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as any;
        await handlePaymentCanceled(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        await handlePaymentFailure(paymentIntent);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

async function handlePaymentAuthorized(paymentIntent: any) {
  try {
    const bookingId = paymentIntent.metadata?.bookingId;
    if (!bookingId) {
      console.error('No bookingId in payment intent metadata');
      return;
    }

    const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
    if (!bookingDoc.exists()) {
      console.error(`Booking ${bookingId} not found`);
      return;
    }

    const bookingData = bookingDoc.data();

    if (bookingData.paymentProcessed) {
      console.log(`Payment for booking ${bookingId} already processed`);
      return;
    }

    const paymentHash = ethers.keccak256(
      ethers.toUtf8Bytes(
        JSON.stringify({
          bookingId,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          timestamp: Date.now(),
        })
      )
    );

    await updateDoc(bookingDoc.ref, {
      status: 'payment_held',
      paymentProcessed: true,
      paymentIntentId: paymentIntent.id,
      paymentHash,
      paymentStatus: 'requires_capture',
      paidAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error handling payment authorization:', error);
    throw error;
  }
}

async function handlePaymentCaptured(paymentIntent: any) {
  try {
    const bookingId = paymentIntent.metadata?.bookingId;
    if (!bookingId) {
      console.error('No bookingId in payment intent metadata');
      return;
    }

    const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
    if (!bookingDoc.exists()) {
      console.error(`Booking ${bookingId} not found`);
      return;
    }

    const bookingData = bookingDoc.data();

    await updateDoc(bookingDoc.ref, {
      paymentCaptured: true,
      paymentCapturedAt: new Date(),
      paymentStatus: 'succeeded',
      updatedAt: new Date(),
    });

    if (bookingData.tutorTokenId && bookingData.paymentHash && !bookingData.lessonLoggedOnChain) {
      try {
        const lessonLog = {
          timestamp: Math.floor(bookingData.scheduledAt?.toDate?.()?.getTime() / 1000) || Math.floor(Date.now() / 1000),
          durationMins: bookingData.duration || 60,
          feeHkd: bookingData.fee || 0,
          subjectId: 0,
          rating: bookingData.rating || 0,
        };

        await logLesson(bookingData.tutorTokenId, lessonLog, bookingData.paymentHash);

        await updateDoc(bookingDoc.ref, {
          lessonLoggedOnChain: true,
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error('Error logging lesson on-chain:', error);
      }
    }
  } catch (error) {
    console.error('Error handling payment capture:', error);
    throw error;
  }
}

async function handlePaymentCanceled(paymentIntent: any) {
  try {
    const bookingId = paymentIntent.metadata?.bookingId;
    if (!bookingId) {
      return;
    }

    const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
    if (!bookingDoc.exists()) {
      return;
    }

    await updateDoc(bookingDoc.ref, {
      status: 'cancelled',
      paymentStatus: 'canceled',
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error handling payment cancellation:', error);
  }
}

async function handlePaymentFailure(paymentIntent: any) {
  try {
    const bookingId = paymentIntent.metadata?.bookingId;
    if (!bookingId) {
      return;
    }

    const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
    if (!bookingDoc.exists()) {
      return;
    }

    await updateDoc(bookingDoc.ref, {
      status: 'cancelled',
      paymentFailed: true,
      paymentFailureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

export default router;

