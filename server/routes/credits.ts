import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { updateUserProfile } from '@/lib/firebase/auth';

const router = Router();

// POST /api/credits - Earn or redeem credits
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.uid;
    const { action, amount, reason } = req.body;

    if (!action || (action === 'earn' && !amount) || (action === 'redeem' && !amount)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user profile
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userProfile = userDoc.data();
    const currentCredits = userProfile.walletCredits || 0;

    if (action === 'earn') {
      const newCredits = currentCredits + amount;
      await updateUserProfile(userId, {
        walletCredits: newCredits,
      });

      await addDoc(collection(db, 'creditTransactions'), {
        userId,
        type: 'earn',
        amount,
        reason: reason || 'Lesson attendance',
        balance: newCredits,
        createdAt: new Date(),
      });

      return res.json({
        success: true,
        creditsEarned: amount,
        newBalance: newCredits,
      });
    } else if (action === 'redeem') {
      if (currentCredits < amount) {
        return res.status(400).json({ error: 'Insufficient credits' });
      }

      const newCredits = currentCredits - amount;
      await updateUserProfile(userId, {
        walletCredits: newCredits,
      });

      await addDoc(collection(db, 'creditTransactions'), {
        userId,
        type: 'redeem',
        amount,
        reason: reason || 'Booking discount',
        balance: newCredits,
        createdAt: new Date(),
      });

      return res.json({
        success: true,
        creditsRedeemed: amount,
        newBalance: newCredits,
      });
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error: any) {
    console.error('Error processing credits:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/credits - Get credits balance and history
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.uid;

    // Get user profile
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userProfile = userDoc.data();
    const credits = userProfile.walletCredits || 0;

    // Get credit transaction history
    const transactionsRef = collection(db, 'creditTransactions');
    const q = query(transactionsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const transactions = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      });
    });

    transactions.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    return res.json({
      balance: credits,
      transactions: transactions.slice(0, 50),
    });
  } catch (error: any) {
    console.error('Error fetching credits:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;

