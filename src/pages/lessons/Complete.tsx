import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { RatingForm } from "@/components/features/rating/RatingForm";
import { CreditEarned } from "@/components/features/rating/CreditEarned";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import axios from "axios";
import { CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CompleteLessonPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const lessonId = params.id as string;
  const [submitted, setSubmitted] = useState(false);
  const [creditsEarned, setCreditsEarned] = useState(0);

  const handleSubmit = async (rating: number, feedback?: string) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await axios.post(
        `/api/lessons/${lessonId}/rate`,
        { rating, feedback },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCreditsEarned(response.data.creditsEarned || 5);
      setSubmitted(true);

      toast({
        title: "Rating Submitted",
        description: "Thank you for your feedback!",
      });

      // Redirect after a delay
      setTimeout(() => {
        navigate("/bookings");
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.response?.data?.error || "Failed to submit rating",
        variant: "destructive",
      });
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="Thank You!" />
        <div className="mt-8 max-w-2xl mx-auto space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Your rating has been submitted successfully!
            </AlertDescription>
          </Alert>
          {creditsEarned > 0 && <CreditEarned credits={creditsEarned} />}
          <p className="text-sm text-muted-foreground text-center">
            Redirecting to bookings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Complete Lesson"
        description="Rate your lesson experience"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Bookings", href: "/bookings" },
          { label: "Rate Lesson" },
        ]}
      />

      <div className="mt-8 max-w-2xl mx-auto">
        <RatingForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

