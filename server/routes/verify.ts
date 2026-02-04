import { Router, Response } from 'express';
import multer from 'multer';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';
import { uploadFileToIPFS, uploadToIPFS } from '@/lib/ipfs/pinata';
import { extractTextFromImage, extractExamScores } from '@/lib/ocr/tesseract';
import { mintTutorSBT } from '@/lib/blockchain/mintSBT';
import { ethers } from 'ethers';

const router = Router();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/verify - Submit verification documents
router.post(
  '/',
  authenticateToken,
  upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.uid;

      // Get user profile
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists() || userDoc.data().role !== 'tutor') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const pdfFile = files?.pdf?.[0];
      const selfieFile = files?.selfie?.[0];
      const examType = req.body.examType as 'DSE' | 'IB';

      if (!pdfFile || !selfieFile || !examType) {
        return res.status(400).json({ error: 'Missing required files' });
      }

      // Upload files to Firebase Storage
      const pdfRef = ref(storage, `verifications/${userId}/certificate.pdf`);
      const selfieRef = ref(storage, `verifications/${userId}/selfie.jpg`);

      const [pdfSnapshot, selfieSnapshot] = await Promise.all([
        uploadBytes(pdfRef, pdfFile.buffer),
        uploadBytes(selfieRef, selfieFile.buffer),
      ]);

      const [pdfUrl, selfieUrl] = await Promise.all([
        getDownloadURL(pdfSnapshot.ref),
        getDownloadURL(selfieSnapshot.ref),
      ]);

      // Process OCR on PDF
      let ocrScores: Record<string, string> = {};
      try {
        const ocrText = await extractTextFromImage(selfieFile.buffer);
        ocrScores = extractExamScores(ocrText, examType);
      } catch (error) {
        console.error('OCR processing error:', error);
      }

      // Upload metadata to IPFS
      const metadata = {
        tutorId: userId,
        examType,
        pdfUrl,
        selfieUrl,
        ocrScores,
        submittedAt: new Date().toISOString(),
      };

      let ipfsHash = '';
      try {
        ipfsHash = await uploadToIPFS(metadata);
      } catch (error) {
        console.error('IPFS upload error:', error);
      }

      // Create verification request in Firestore
      const verificationData = {
        tutorId: userId,
        examType,
        pdfUrl,
        selfieUrl,
        ipfsHash,
        ocrScores,
        status: 'pending',
        submittedAt: new Date(),
        updatedAt: new Date(),
      };

      const verificationRef = await addDoc(collection(db, 'verifications'), verificationData);

      return res.json({
        verificationId: verificationRef.id,
        status: 'pending',
        message: 'Verification submitted successfully',
      });
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
);

// GET /api/verify - Get verification status
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.uid;

    // Get user's verification status
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userProfile = userDoc.data();

    // If already verified, return status
    if (userProfile.tutorTokenId) {
      return res.json({
        status: 'approved',
        tutorTokenId: userProfile.tutorTokenId,
      });
    }

    // Check for pending verification
    const verificationsRef = collection(db, 'verifications');
    const q = query(verificationsRef, where('tutorId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const latestVerification = querySnapshot.docs[0].data();
      return res.json({
        status: latestVerification.status || 'pending',
        verificationId: querySnapshot.docs[0].id,
      });
    }

    return res.json({
      status: 'not_submitted',
    });
  } catch (error: any) {
    console.error('Error fetching verification status:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/verify/approve - Approve/reject verification (admin only)
router.post('/approve', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.uid;

    // Check if user is admin
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists() || userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { verificationId, action, tutorWalletAddress } = req.body;

    if (!verificationId || !action || (action === 'approve' && !tutorWalletAddress)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get verification document
    const verificationDoc = await getDoc(doc(db, 'verifications', verificationId));
    if (!verificationDoc.exists()) {
      return res.status(404).json({ error: 'Verification not found' });
    }

    const verificationData = verificationDoc.data();

    if (action === 'approve') {
      // Upload final metadata to IPFS
      const metadata = {
        tutorId: verificationData.tutorId,
        examType: verificationData.examType,
        ipfsHash: verificationData.ipfsHash,
        verifiedAt: new Date().toISOString(),
        verifiedBy: userId,
      };

      let credHash = verificationData.ipfsHash || '';
      if (!credHash) {
        try {
          credHash = await uploadToIPFS(metadata);
        } catch (error) {
          console.error('IPFS upload error:', error);
          credHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(metadata)));
        }
      }

      // Mint SBT
      try {
        const examTypeNum = verificationData.examType === 'DSE' ? 0 : 1;
        const txHash = await mintTutorSBT(tutorWalletAddress, credHash, examTypeNum as 0 | 1);

        const tutorTokenId = 0; // This should be fetched from the contract

        // Update verification status
        await updateDoc(verificationDoc.ref, {
          status: 'approved',
          tutorTokenId,
          txHash,
          approvedAt: new Date(),
          approvedBy: userId,
        });

        // Update tutor profile
        const tutorDoc = await getDoc(doc(db, 'users', verificationData.tutorId));
        if (tutorDoc.exists()) {
          await updateDoc(tutorDoc.ref, {
            tutorTokenId,
            verifiedAt: new Date(),
            updatedAt: new Date(),
          });
        }

        return res.json({
          success: true,
          tutorTokenId,
          txHash,
        });
      } catch (error: any) {
        console.error('Error minting SBT:', error);
        return res.status(500).json({ error: `SBT minting failed: ${error.message}` });
      }
    } else if (action === 'reject') {
      await updateDoc(verificationDoc.ref, {
        status: 'rejected',
        rejectedAt: new Date(),
        rejectedBy: userId,
        rejectionReason: req.body.rejectionReason || '',
      });

      return res.json({
        success: true,
        message: 'Verification rejected',
      });
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error: any) {
    console.error('Error processing verification:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;

