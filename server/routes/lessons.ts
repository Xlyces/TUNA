import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { logLesson } from '@/lib/blockchain/logLesson';
import { updateUserProfile } from '@/lib/firebase/auth';

const router = Router();

// POST /api/lessons/:id/rate - Rate a lesson
router.post('/:id/rate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.uid;
    const lessonId = req.params.id;
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating (must be 1-5)' });
    }

    // Get booking/lesson document
    const bookingDoc = await getDoc(doc(db, 'bookings', lessonId));
    if (!bookingDoc.exists()) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const bookingData = bookingDoc.data();

    // Check authorization (only parent can rate)
    if (bookingData.parentId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if already rated
    if (bookingData.rating) {
      return res.status(400).json({ error: 'Lesson already rated' });
    }

    // Check if lesson is completed
    if (bookingData.status !== 'completed') {
      return res.status(400).json({ error: 'Lesson must be completed before rating' });
    }

    // Update booking with rating
    await updateDoc(bookingDoc.ref, {
      rating,
      feedback: feedback || '',
      ratedAt: new Date(),
      updatedAt: new Date(),
    });

    // Log lesson on-chain
    if (bookingData.tutorTokenId && bookingData.paymentHash) {
      try {
        const lessonLog = {
          timestamp: Math.floor(bookingData.scheduledAt?.toDate?.()?.getTime() / 1000) || Math.floor(Date.now() / 1000),
          durationMins: bookingData.duration || 60,
          feeHkd: bookingData.fee || 0,
          subjectId: 0,
          rating: rating,
        };

        await logLesson(
          bookingData.tutorTokenId,
          lessonLog,
          bookingData.paymentHash
        );
      } catch (error) {
        console.error('Error logging lesson on-chain:', error);
      }
    }

    // Award credits to parent if not already awarded
    if (!bookingData.creditsAwarded) {
      const parentDoc = await getDoc(doc(db, 'users', userId));
      if (parentDoc.exists()) {
        const currentCredits = parentDoc.data().walletCredits || 0;
        const creditsEarned = 5;

        await updateUserProfile(userId, {
          walletCredits: currentCredits + creditsEarned,
        });

        await updateDoc(bookingDoc.ref, {
          creditsAwarded: true,
          updatedAt: new Date(),
        });
      }
    }

    return res.json({
      success: true,
      creditsEarned: bookingData.creditsAwarded ? 0 : 5,
      message: 'Rating submitted successfully',
    });
  } catch (error: any) {
    console.error('Error submitting rating:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;

