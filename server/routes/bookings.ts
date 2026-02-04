import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { db } from '@/lib/firebase/config.server';
import { collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { createPaymentIntent, capturePayment } from '@/lib/stripe/payments';
import { logLesson } from '@/lib/blockchain/logLesson';
import { updateUserProfile } from '@/lib/firebase/userProfile.server';

const router = Router();

// POST /api/bookings - Create booking
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings.ts:12',message:'Booking creation endpoint called',data:{userId:req.user?.uid,body:req.body},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  try {
    const userId = req.user!.uid;
    const {
      tutorId,
      tutorTokenId,
      subject,
      duration,
      fee,
      scheduledAt,
      studentName,
      studentGrade,
      creditsUsed = 0,
    } = req.body;

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings.ts:26',message:'Request data parsed',data:{userId,tutorId,subject,duration,fee,scheduledAt,studentName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    // Validate required fields
    if (!tutorId || !subject || !duration || !fee || !scheduledAt || !studentName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // #region agent log
    const dbSettings = (db as any)._delegate?._settings;
    fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings.ts:33',message:'Before Firestore query - checking connection',data:{dbHost:dbSettings?.host,dbConnected:dbSettings?.host?.includes('127.0.0.1')||dbSettings?.host?.includes('localhost')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Get parent profile
    const parentDoc = await getDoc(doc(db, 'users', userId));
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings.ts:34',message:'After parent query',data:{exists:parentDoc.exists(),role:parentDoc.data()?.role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    if (!parentDoc.exists() || parentDoc.data().role !== 'parent') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const parentProfile = parentDoc.data();

    // Get tutor profile
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings.ts:42',message:'Before tutor query',data:{tutorId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const tutorDoc = await getDoc(doc(db, 'users', tutorId));
    if (!tutorDoc.exists() || tutorDoc.data().role !== 'tutor') {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    const tutorProfile = tutorDoc.data();

    // Check credits
    const availableCredits = parentProfile.walletCredits || 0;
    if (creditsUsed > availableCredits) {
      return res.status(400).json({ error: 'Insufficient credits' });
    }

    // Calculate final fee (after credit discount)
    const creditDiscount = creditsUsed * 10; // 10 credits = HKD 1
    const finalFee = Math.max(0, fee - creditDiscount);

    // Calculate confirmation deadline (72 hours from lesson end)
    const lessonEndTime = new Date(scheduledAt);
    lessonEndTime.setHours(lessonEndTime.getHours() + Math.ceil(duration / 60));
    const confirmationDeadline = new Date(lessonEndTime);
    confirmationDeadline.setHours(confirmationDeadline.getHours() + 72);

    // Create booking in Firestore
    const bookingData = {
      parentId: userId,
      tutorId,
      tutorName: tutorProfile.name || 'Tutor',
      tutorTokenId,
      subject,
      duration,
      fee: finalFee,
      originalFee: fee,
      creditsUsed,
      scheduledAt: new Date(scheduledAt),
      studentName,
      studentGrade,
      status: 'payment_held',
      tutorConfirmed: false,
      parentConfirmed: false,
      disputed: false,
      paymentCaptured: false,
      confirmationDeadline,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings.ts:88',message:'Before creating booking document',data:{bookingData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const bookingRef = await addDoc(collection(db, 'bookings'), bookingData);
    const bookingId = bookingRef.id;
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings.ts:90',message:'Booking document created successfully',data:{bookingId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    console.log('✅ Booking created:', {
      bookingId,
      parentId: userId,
      tutorId,
      status: bookingData.status,
      tutorName: bookingData.tutorName,
    });

    // Create Stripe payment intent if tutor has Stripe account
    let paymentIntentId = null;
    let clientSecret = null;

    const USE_MOCK = !process.env.STRIPE_SECRET_KEY || process.env.NODE_ENV === 'development';
    const stripeAccountId = tutorProfile.stripeAccountId || (USE_MOCK ? 'acct_mock_tutor' : null);

    if (stripeAccountId && finalFee > 0) {
      try {
        const amountInCents = Math.floor(finalFee * 100);
        const paymentIntent = await createPaymentIntent(
          amountInCents,
          stripeAccountId,
          {
            bookingId,
            tutorId,
            tutorTokenId: tutorTokenId?.toString() || '',
            parentId: userId,
          }
        );

        paymentIntentId = paymentIntent.id;
        clientSecret = paymentIntent.client_secret || null;

        await updateDoc(bookingRef, {
          paymentIntentId,
          paymentStatus: 'requires_capture',
          updatedAt: new Date(),
        });
      } catch (error: any) {
        console.error('Error creating payment intent:', error);
      }
    }

    // Deduct credits if used
    if (creditsUsed > 0) {
      await updateDoc(parentDoc.ref, {
        walletCredits: availableCredits - creditsUsed,
        updatedAt: new Date(),
      });
    }

    return res.json({
      bookingId,
      paymentIntentId,
      clientSecret,
    });
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings.ts:147',message:'Error caught in booking creation',data:{errorMessage:error.message,errorStack:error.stack,errorCode:error.code,errorName:error.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
    // #endregion
    console.error('Error creating booking:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/bookings - Get bookings
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.uid;
    const role = (req.query.role as string) || 'parent';

    // Get user profile
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Query bookings based on role
    const field = role === 'parent' ? 'parentId' : 'tutorId';
    const q = query(collection(db, 'bookings'), where(field, '==', userId));
    const querySnapshot = await getDocs(q);

    const bookings = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bookings.push({
        id: doc.id,
        ...data,
        scheduledAt: data.scheduledAt?.toDate?.()?.toISOString() || data.scheduledAt,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      });
    });

    return res.json({ bookings });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/bookings/:id - Get single booking
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.uid;
    const bookingId = req.params.id;
    const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));

    if (!bookingDoc.exists()) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const bookingData = bookingDoc.data();

    // Check authorization
    if (bookingData.parentId !== userId && bookingData.tutorId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    return res.json({
      id: bookingDoc.id,
      ...bookingData,
      scheduledAt: bookingData.scheduledAt?.toDate?.()?.toISOString() || bookingData.scheduledAt,
      createdAt: bookingData.createdAt?.toDate?.()?.toISOString() || bookingData.createdAt,
      updatedAt: bookingData.updatedAt?.toDate?.()?.toISOString() || bookingData.updatedAt,
    });
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// PATCH /api/bookings/:id - Update booking
router.patch('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.uid;
    const bookingId = req.params.id;
    const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));

    if (!bookingDoc.exists()) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const bookingData = bookingDoc.data();

    // Check authorization
    if (bookingData.parentId !== userId && bookingData.tutorId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updates: any = {
      ...req.body,
      updatedAt: new Date(),
    };

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.parentId;
    delete updates.tutorId;
    delete updates.createdAt;
    delete updates.paymentIntentId;
    delete updates.paymentHash;

    // Validate status transitions
    if (updates.status) {
      const currentStatus = bookingData.status;
      const newStatus = updates.status;

      const validTransitions: Record<string, string[]> = {
        payment_held: ['awaiting_confirmation', 'cancelled'],
        awaiting_confirmation: ['completed', 'cancelled'],
        completed: [],
        cancelled: [],
      };

      if (
        validTransitions[currentStatus] &&
        !validTransitions[currentStatus].includes(newStatus)
      ) {
        return res.status(400).json({
          error: `Invalid status transition from ${currentStatus} to ${newStatus}`,
        });
      }
    }

    await updateDoc(bookingDoc.ref, updates);

    return res.json({
      id: bookingDoc.id,
      ...bookingData,
      ...updates,
    });
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/bookings/:id/confirm - Confirm booking
router.post('/:id/confirm', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.uid;
    const bookingId = req.params.id;
    const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));

    if (!bookingDoc.exists()) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const bookingData = bookingDoc.data();

    // Check authorization
    if (bookingData.parentId !== userId && bookingData.tutorId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get user profile to determine role
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userRole = userDoc.data().role;
    const isTutor = userRole === 'tutor' && bookingData.tutorId === userId;
    const isParent = userRole === 'parent' && bookingData.parentId === userId;

    if (!isTutor && !isParent) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if already confirmed
    if (isTutor && bookingData.tutorConfirmed) {
      return res.status(400).json({ error: 'Tutor already confirmed' });
    }

    if (isParent && bookingData.parentConfirmed) {
      return res.status(400).json({ error: 'Parent already confirmed' });
    }

    // Check if booking is in valid state
    if (bookingData.status !== 'payment_held' && bookingData.status !== 'awaiting_confirmation') {
      return res.status(400).json({ error: 'Booking is not in a state that allows confirmation' });
    }

    // Update confirmation
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (isTutor) {
      updateData.tutorConfirmed = true;
      updateData.tutorConfirmedAt = new Date();
      updateData.status = 'awaiting_confirmation';
    } else {
      updateData.parentConfirmed = true;
      updateData.parentConfirmedAt = new Date();
      updateData.status = 'awaiting_confirmation';
    }

    await updateDoc(bookingDoc.ref, updateData);

    // Get updated booking data
    const updatedBookingDoc = await getDoc(doc(db, 'bookings', bookingId));
    const updatedBookingData = updatedBookingDoc.data();

    // Check if both parties have confirmed
    if (updatedBookingData.tutorConfirmed && updatedBookingData.parentConfirmed) {
      try {
        // Capture payment
        if (updatedBookingData.paymentIntentId && !updatedBookingData.paymentCaptured) {
          await capturePayment(updatedBookingData.paymentIntentId);

          await updateDoc(bookingDoc.ref, {
            paymentCaptured: true,
            paymentCapturedAt: new Date(),
            status: 'completed',
            updatedAt: new Date(),
          });
        }

        // Log lesson on-chain
        if (updatedBookingData.tutorTokenId && updatedBookingData.paymentHash) {
          try {
            const lessonLog = {
              timestamp:
                Math.floor(
                  updatedBookingData.scheduledAt?.toDate?.()?.getTime() / 1000
                ) || Math.floor(Date.now() / 1000),
              durationMins: updatedBookingData.duration || 60,
              feeHkd: updatedBookingData.fee || 0,
              subjectId: 0,
              rating: updatedBookingData.rating || 0,
            };

            await logLesson(
              updatedBookingData.tutorTokenId,
              lessonLog,
              updatedBookingData.paymentHash
            );

            await updateDoc(bookingDoc.ref, {
              lessonLoggedOnChain: true,
              updatedAt: new Date(),
            });
          } catch (error) {
            console.error('Error logging lesson on-chain:', error);
          }
        }

        // Award credits to parent
        try {
          const parentDoc = await getDoc(doc(db, 'users', updatedBookingData.parentId));
          if (parentDoc.exists()) {
            const currentCredits = parentDoc.data().walletCredits || 0;
            await updateUserProfile(updatedBookingData.parentId, {
              walletCredits: currentCredits + 5,
            });
          }
        } catch (error) {
          console.error('Error awarding credits:', error);
        }

        return res.json({
          success: true,
          message: 'Both parties confirmed. Payment captured and booking completed.',
          bothConfirmed: true,
          creditsAwarded: 5,
        });
      } catch (error: any) {
        console.error('Error completing booking:', error);
        return res.status(500).json({
          error: 'Failed to complete booking',
          details: error.message,
        });
      }
    }

    return res.json({
      success: true,
      message: isTutor
        ? 'Tutor confirmation recorded. Waiting for parent confirmation.'
        : 'Parent confirmation recorded. Waiting for tutor confirmation.',
      bothConfirmed: false,
    });
  } catch (error: any) {
    console.error('Error confirming booking:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/bookings/:id/dispute - Raise dispute
router.post('/:id/dispute', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.uid;
    const bookingId = req.params.id;
    const { reason } = req.body;

    const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));

    if (!bookingDoc.exists()) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const bookingData = bookingDoc.data();

    // Check authorization
    if (bookingData.parentId !== userId && bookingData.tutorId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get user profile
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userRole = userDoc.data().role;
    const isTutor = userRole === 'tutor' && bookingData.tutorId === userId;
    const isParent = userRole === 'parent' && bookingData.parentId === userId;

    if (!isTutor && !isParent) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if already disputed
    if (bookingData.disputed) {
      return res.status(400).json({ error: 'Dispute already raised for this booking' });
    }

    await updateDoc(bookingDoc.ref, {
      disputed: true,
      disputeReason: reason || '',
      disputedBy: isTutor ? 'tutor' : 'parent',
      disputedAt: new Date(),
      updatedAt: new Date(),
    });

    return res.json({
      success: true,
      message: 'Dispute raised. Payment will still be released after timeout, but parent can provide negative rating.',
    });
  } catch (error: any) {
    console.error('Error raising dispute:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/bookings/auto-release - Auto-release escrow payments
router.post('/auto-release', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const apiKey = process.env.AUTO_RELEASE_API_KEY;

    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const ESCROW_TIMEOUT_HOURS = parseInt(process.env.ESCROW_TIMEOUT_HOURS || '72', 10);
    const now = new Date();
    const releasedBookings: string[] = [];
    const errors: string[] = [];

    const queries = [
      query(
        collection(db, 'bookings'),
        where('status', '==', 'payment_held'),
        where('paymentCaptured', '==', false)
      ),
      query(
        collection(db, 'bookings'),
        where('status', '==', 'awaiting_confirmation'),
        where('paymentCaptured', '==', false)
      ),
    ];

    const querySnapshots = await Promise.all(queries.map((q) => getDocs(q)));
    const allBookings = new Map<string, any>();

    querySnapshots.forEach((snapshot) => {
      snapshot.docs.forEach((doc) => {
        allBookings.set(doc.id, { id: doc.id, ...doc.data() });
      });
    });

    for (const [bookingId, bookingData] of allBookings.entries()) {
      const confirmationDeadline = bookingData.confirmationDeadline?.toDate?.() || bookingData.confirmationDeadline;

      if (!confirmationDeadline) {
        const scheduledAt = bookingData.scheduledAt?.toDate?.() || bookingData.scheduledAt;
        if (scheduledAt) {
          const lessonEndTime = new Date(scheduledAt);
          lessonEndTime.setHours(lessonEndTime.getHours() + Math.ceil((bookingData.duration || 60) / 60));
          const calculatedDeadline = new Date(lessonEndTime);
          calculatedDeadline.setHours(calculatedDeadline.getHours() + ESCROW_TIMEOUT_HOURS);

          if (calculatedDeadline > now) {
            continue;
          }
        } else {
          continue;
        }
      } else {
        if (new Date(confirmationDeadline) > now) {
          continue;
        }
      }

      try {
        if (bookingData.paymentIntentId) {
          await capturePayment(bookingData.paymentIntentId);
        }

        await updateDoc(doc(db, 'bookings', bookingId), {
          paymentCaptured: true,
          paymentCapturedAt: new Date(),
          status: 'completed',
          paymentStatus: 'succeeded',
          autoReleased: true,
          autoReleasedAt: new Date(),
          updatedAt: new Date(),
        });

        if (bookingData.tutorTokenId && bookingData.paymentHash && !bookingData.lessonLoggedOnChain) {
          try {
            const lessonLog = {
              timestamp:
                Math.floor(
                  bookingData.scheduledAt?.toDate?.()?.getTime() / 1000
                ) || Math.floor(Date.now() / 1000),
              durationMins: bookingData.duration || 60,
              feeHkd: bookingData.fee || 0,
              subjectId: 0,
              rating: bookingData.rating || 0,
            };

            await logLesson(
              bookingData.tutorTokenId,
              lessonLog,
              bookingData.paymentHash
            );

            await updateDoc(doc(db, 'bookings', bookingId), {
              lessonLoggedOnChain: true,
              updatedAt: new Date(),
            });
          } catch (error) {
            console.error(`Error logging lesson on-chain for booking ${bookingId}:`, error);
          }
        }

        if (!bookingData.creditsAwarded && bookingData.parentId) {
          try {
            const parentDoc = await getDoc(doc(db, 'users', bookingData.parentId));
            if (parentDoc.exists()) {
              const currentCredits = parentDoc.data().walletCredits || 0;
              await updateUserProfile(bookingData.parentId, {
                walletCredits: currentCredits + 5,
              });

              await updateDoc(doc(db, 'bookings', bookingId), {
                creditsAwarded: true,
                updatedAt: new Date(),
              });
            }
          } catch (error) {
            console.error(`Error awarding credits for booking ${bookingId}:`, error);
          }
        }

        releasedBookings.push(bookingId);
      } catch (error: any) {
        console.error(`Error auto-releasing payment for booking ${bookingId}:`, error);
        errors.push(`${bookingId}: ${error.message}`);
      }
    }

    return res.json({
      success: true,
      releasedCount: releasedBookings.length,
      releasedBookings,
      errors: errors.length > 0 ? errors : undefined,
      message: `Auto-released ${releasedBookings.length} booking(s)`,
    });
  } catch (error: any) {
    console.error('Error in auto-release endpoint:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;

