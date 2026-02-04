import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { BookingWizard } from "@/components/features/booking/BookingWizard";
import { BookingStep1DateTime } from "@/components/features/booking/BookingStep1DateTime";
import { BookingStep2StudentInfo } from "@/components/features/booking/BookingStep2StudentInfo";
import { BookingStep3Review } from "@/components/features/booking/BookingStep3Review";
import { BookingStep4Payment } from "@/components/features/booking/BookingStep4Payment";
import { CreditRedeem } from "@/components/features/booking/CreditRedeem";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { createBooking } from "@/lib/api/bookings";
import { useToast } from "@/hooks/useToast";
import { Tutor } from "@/hooks/useTutors";

async function fetchTutor(id: string): Promise<Tutor | null> {
  const tutorDoc = await getDoc(doc(db, "users", id));
  if (!tutorDoc.exists()) {
    return null;
  }
  return { id: tutorDoc.id, ...tutorDoc.data() } as Tutor;
}

export default function BookLessonPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userProfile, isAuthenticated, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const tutorId = params.tutorId as string;

  const [bookingData, setBookingData] = useState<any>({});
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [paymentInfo, setPaymentInfo] = useState<{ clientSecret?: string; paymentIntentId?: string; bookingId?: string } | null>(null);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const { data: tutor, isLoading } = useQuery({
    queryKey: ["tutor", tutorId],
    queryFn: () => fetchTutor(tutorId),
  });

  // All hooks must be called before any conditional returns
  const handleStep1Complete = useCallback((date: Date, time: string) => {
    setBookingData((prev: any) => ({
      ...prev,
      scheduledAt: date,
      time,
    }));
  }, []);

  const handleStep2Complete = useCallback((data: {
    studentName: string;
    studentGrade?: string;
    subject: string;
  }) => {
    setBookingData((prev: any) => ({
      ...prev,
      ...data,
    }));
  }, []);

  // Create booking when moving to payment step
  const handleMoveToPayment = useCallback(async () => {
    if (!user || creatingBooking || paymentInfo || !tutor) return;

    // Validate required fields
    if (!bookingData.scheduledAt || !bookingData.studentName || !bookingData.subject) {
      toast({
        title: "Missing Information",
        description: "Please complete all previous steps",
        variant: "destructive",
      });
      return;
    }

    setCreatingBooking(true);
    try {
      const token = await user.getIdToken();
      const bookingRequest = {
        tutorId: tutor.id,
        tutorTokenId: tutor.tutorTokenId,
        subject: bookingData.subject,
        duration: 60, // Default 60 minutes
        fee: tutor.hourlyRate || 500,
        scheduledAt: bookingData.scheduledAt.toISOString(),
        studentName: bookingData.studentName,
        studentGrade: bookingData.studentGrade,
        creditsUsed,
      };

      const response = await createBooking(bookingRequest, token);
      
      setPaymentInfo({
        clientSecret: response.clientSecret || undefined,
        paymentIntentId: response.paymentIntentId || undefined,
        bookingId: response.bookingId,
      });

      // Invalidate bookings query to ensure it refreshes after navigation
      if (userProfile?.uid && userProfile?.role) {
        // Use refetchQueries to immediately fetch fresh data
        queryClient.refetchQueries({ queryKey: ["bookings", userProfile.uid, userProfile.role] });
      }

      setBookingError(null);
      toast({
        title: "Booking Created",
        description: "Please complete payment to confirm your booking",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to create booking";
      setBookingError(errorMessage);
      toast({
        title: "Booking Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCreatingBooking(false);
    }
  }, [user, creatingBooking, paymentInfo, bookingData, tutor, creditsUsed, toast, queryClient, userProfile]);

  const handleComplete = useCallback(async (data: any) => {
    // This is called when "Complete Booking" button is clicked
    // Only allow completion if booking was successfully created
    if (!paymentInfo?.bookingId) {
      toast({
        title: "Booking Not Created",
        description: "Please wait for the booking to be created, or try again.",
        variant: "destructive",
      });
      return;
    }
    // Navigate to bookings page
    if (userProfile?.uid && userProfile?.role) {
      await queryClient.refetchQueries({ queryKey: ["bookings", userProfile.uid, userProfile.role] });
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    navigate("/bookings");
  }, [navigate, paymentInfo, toast, queryClient, userProfile]);

  const handlePaymentComplete = useCallback(async () => {
    toast({
      title: "Payment Successful",
      description: "Your booking has been confirmed!",
    });
    // Invalidate bookings query to ensure fresh data
    if (userProfile?.uid && userProfile?.role) {
      await queryClient.invalidateQueries({ queryKey: ["bookings", userProfile.uid, userProfile.role] });
      // Small delay to ensure Firestore write is complete
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    navigate("/bookings");
  }, [toast, navigate, queryClient, userProfile]);

  const handleStepChange = useCallback((step: number) => {
    // When trying to move to payment step (step 3), create booking first
    if (step === 3 && !paymentInfo && !creatingBooking) {
      // Only create booking if we're not already creating one and don't have payment info
      handleMoveToPayment();
    }
  }, [paymentInfo, creatingBooking, handleMoveToPayment]);
  
  // Move to payment step after booking is successfully created
  useEffect(() => {
    if (paymentInfo?.bookingId) {
      // Force wizard to move to payment step by updating the steps
      // The wizard will handle the step change internally
    }
  }, [paymentInfo]);

  const steps = useMemo(() => {
    if (!tutor) return [];
    return [
      {
        id: "datetime",
        title: "Select Date & Time",
        component: (
          <BookingStep1DateTime
            value={bookingData.scheduledAt}
            onChange={handleStep1Complete}
          />
        ),
        validate: (data: any) => {
          if (!data.scheduledAt) {
            return { isValid: false, error: "Please select both a date and time" };
          }
          // Check if date is in the past
          if (data.scheduledAt < new Date()) {
            return { isValid: false, error: "Please select a future date and time" };
          }
          return { isValid: true };
        },
      },
      {
        id: "student",
        title: "Student Information",
        component: (
          <BookingStep2StudentInfo
            studentName={bookingData.studentName}
            studentGrade={bookingData.studentGrade}
            subject={bookingData.subject}
            onChange={handleStep2Complete}
          />
        ),
        validate: (data: any) => {
          if (!data.studentName || data.studentName.trim() === "") {
            return { isValid: false, error: "Student name is required" };
          }
          if (!data.subject || data.subject.trim() === "") {
            return { isValid: false, error: "Subject is required" };
          }
          return { isValid: true };
        },
      },
      {
        id: "review",
        title: "Review Booking",
        component: (
          <div className="space-y-4">
            <BookingStep3Review
              tutorName={tutor.name || "Tutor"}
              scheduledAt={bookingData.scheduledAt || new Date()}
              studentName={bookingData.studentName || ""}
              studentGrade={bookingData.studentGrade}
              subject={bookingData.subject || ""}
              duration={60}
              fee={tutor.hourlyRate || 500}
              creditsUsed={creditsUsed}
            />
            {userProfile && userProfile.walletCredits > 0 && (
              <CreditRedeem
                availableCredits={userProfile.walletCredits}
                onRedeem={setCreditsUsed}
              />
            )}
          </div>
        ),
      },
      {
        id: "payment",
        title: "Payment",
        component: (
          <BookingStep4Payment
            clientSecret={paymentInfo?.clientSecret}
            paymentIntentId={paymentInfo?.paymentIntentId}
            onPaymentComplete={handlePaymentComplete}
          />
        ),
      },
    ];
  }, [bookingData, tutor, creditsUsed, userProfile, paymentInfo, handleStep1Complete, handleStep2Complete, handlePaymentComplete]);

  // Handle authentication redirect in useEffect (client-side only)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  // If not authenticated, don't render (redirect is happening)
  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner text="Loading tutor information..." />
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="Tutor Not Found" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Book a Lesson"
        description={`Book a lesson with ${tutor.name}`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Search", href: "/search" },
          { label: tutor.name || "Tutor", href: `/tutors/${tutorId}` },
          { label: "Book Lesson" },
        ]}
      />

      <div className="mt-8">
        <BookingWizard
          steps={steps}
          onComplete={handleComplete}
          initialData={bookingData}
          onStepChange={handleStepChange}
          canComplete={!!paymentInfo?.bookingId}
        />
        {creatingBooking && (
          <div className="mt-4 text-center">
            <LoadingSpinner text="Creating booking..." />
          </div>
        )}
        {bookingError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {bookingError}
            </p>
            <p className="text-xs text-red-600 mt-2">
              Please check your connection and try again. If the problem persists, contact support.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

