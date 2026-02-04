import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { VerificationWizard } from "@/components/features/verification/VerificationWizard";
import { PDFUpload } from "@/components/features/verification/PDFUpload";
import { SelfieUpload } from "@/components/features/verification/SelfieUpload";
import { ExamTypeSelect } from "@/components/features/verification/ExamTypeSelect";
import { OCRPreview } from "@/components/features/verification/OCRPreview";
import { VerificationStatus } from "@/components/features/verification/VerificationStatus";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import axios from "axios";
import { recognize } from "tesseract.js";

export default function TutorVerifyPage() {
  const navigate = useNavigate();
  const { user, userProfile, loading } = useAuth();
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [examType, setExamType] = useState<"DSE" | "IB">();
  const [ocrData, setOcrData] = useState<any>(null);
  const [processingOCR, setProcessingOCR] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "approved" | "rejected">("pending");

  // Wait for auth to load before checking
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login");
        return;
      }
      if (userProfile?.role !== "tutor") {
        navigate("/dashboard");
        return;
      }
    }
  }, [user, userProfile, loading, navigate]);

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  // If not authenticated or not a tutor, don't render (redirect is happening)
  if (!user || userProfile?.role !== "tutor") {
    return null;
  }

  const handleOCRProcess = async () => {
    if (!pdfFile) return;

    setProcessingOCR(true);
    try {
      // In a real implementation, you would:
      // 1. Convert PDF to image
      // 2. Use Tesseract.js to extract text
      // 3. Parse scores from the extracted text
      
      // For now, we'll simulate OCR processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Mock OCR data
      const mockOCRData = {
        math: "5**",
        english: "5*",
        physics: "5",
        chemistry: "4",
      };
      
      setOcrData(mockOCRData);
      toast({
        title: "OCR Complete",
        description: "Scores extracted from certificate",
      });
    } catch (error: any) {
      toast({
        title: "OCR Failed",
        description: error.message || "Failed to process certificate",
        variant: "destructive",
      });
    } finally {
      setProcessingOCR(false);
    }
  };

  const handleComplete = async (data: any) => {
    if (!user || !pdfFile || !selfieFile || !examType) {
      toast({
        title: "Missing Information",
        description: "Please complete all steps",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append("pdf", pdfFile);
      formData.append("selfie", selfieFile);
      formData.append("examType", examType);

      const response = await axios.post("/api/verify", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: "Verification Submitted",
        description: "Your verification is under review",
      });

      setVerificationStatus("pending");
      navigate("/dashboard/tutor");
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.response?.data?.error || "Failed to submit verification",
        variant: "destructive",
      });
    }
  };

  // If already verified, show status
  if (userProfile?.tutorTokenId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Verification Status"
          description="Your tutor verification status"
        />
        <div className="mt-8 max-w-2xl mx-auto">
          <VerificationStatus
            status="approved"
            tutorTokenId={userProfile.tutorTokenId}
          />
        </div>
      </div>
    );
  }

  const steps = [
    {
      id: "examType",
      title: "Select Exam Type",
      component: (
        <ExamTypeSelect
          value={examType}
          onChange={setExamType}
        />
      ),
    },
    {
      id: "pdf",
      title: "Upload Certificate",
      component: (
        <PDFUpload
          value={pdfFile}
          onChange={setPdfFile}
        />
      ),
    },
    {
      id: "selfie",
      title: "Upload Selfie",
      component: (
        <SelfieUpload
          value={selfieFile}
          onChange={setSelfieFile}
        />
      ),
    },
    {
      id: "ocr",
      title: "Review OCR Results",
      component: (
        <div className="space-y-4">
          <OCRPreview ocrData={ocrData} loading={processingOCR} />
          {pdfFile && !ocrData && !processingOCR && (
            <button
              onClick={handleOCRProcess}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Process Certificate
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Verify Your Credentials"
        description="Complete verification to become a verified tutor"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard/tutor" },
          { label: "Verification" },
        ]}
      />

      <div className="mt-8">
        <VerificationWizard
          steps={steps}
          onComplete={handleComplete}
          initialData={{ examType, pdfFile, selfieFile }}
        />
      </div>
    </div>
  );
}

