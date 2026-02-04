"use client";

import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, DollarSign, Star, CheckCircle2, AlertCircle, X, BookOpen } from "lucide-react";
import { Tutor } from "@/hooks/useTutors";
import { useAuth } from "@/hooks/useAuth";
import { BookingWizard } from "@/components/features/booking/BookingWizard";
import { BookingStep1DateTime } from "@/components/features/booking/BookingStep1DateTime";
import { BookingStep2StudentInfo } from "@/components/features/booking/BookingStep2StudentInfo";
import { BookingStep3Review } from "@/components/features/booking/BookingStep3Review";
import { BookingStep4Payment } from "@/components/features/booking/BookingStep4Payment";
import { CreditRedeem } from "@/components/features/booking/CreditRedeem";
import { createBooking } from "@/lib/api/bookings";
import { useToast } from "@/hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface TutorBookingTabProps {
  tutor: Tutor;
}

export function TutorBookingTab({ tutor }: TutorBookingTabProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user, userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<any>({});
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [paymentInfo, setPaymentInfo] = useState<{ clientSecret?: string; paymentIntentId?: string; bookingId?: string } | null>(null);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const subjects = tutor.subjects || [];
  const hourlyRate = tutor.hourlyRate || 0;
  const rating = tutor.averageRating || 0;
  const totalHours = tutor.totalHours || 0;

  const handleBookService = (subject: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setSelectedService(subject);
    setBookingData({ subject });
    setCreditsUsed(0);
    setPaymentInfo(null);
    setBookingError(null);
  };

  const handleCloseBooking = () => {
    setSelectedService(null);
    setBookingData({});
    setCreditsUsed(0);
    setPaymentInfo(null);
    setBookingError(null);
  };

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

  const handleMoveToPayment = useCallback(async () => {
    if (!user || creatingBooking || paymentInfo || !tutor || !selectedService) return;

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
        duration: 60,
        fee: hourlyRate,
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

      if (userProfile?.uid && userProfile?.role) {
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
  }, [user, creatingBooking, paymentInfo, bookingData, tutor, creditsUsed, selectedService, hourlyRate, toast, queryClient, userProfile]);

  const handleComplete = useCallback(async () => {
    if (!paymentInfo?.bookingId) {
      toast({
        title: "Booking Not Created",
        description: "Please wait for the booking to be created, or try again.",
        variant: "destructive",
      });
      return;
    }
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
    if (userProfile?.uid && userProfile?.role) {
      await queryClient.invalidateQueries({ queryKey: ["bookings", userProfile.uid, userProfile.role] });
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    navigate("/bookings");
  }, [toast, navigate, queryClient, userProfile]);

  const handleStepChange = useCallback((step: number) => {
    if (step === 3 && !paymentInfo && !creatingBooking) {
      handleMoveToPayment();
    }
  }, [paymentInfo, creatingBooking, handleMoveToPayment]);

  const steps = useMemo(() => {
    if (!tutor || !selectedService) return [];
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
            subject={selectedService}
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
              subject={bookingData.subject || selectedService}
              duration={60}
              fee={hourlyRate}
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
  }, [bookingData, tutor, creditsUsed, userProfile, paymentInfo, selectedService, hourlyRate, handleStep1Complete, handleStep2Complete, handlePaymentComplete]);

  return (
    <div className="space-y-6">
      {/* Services Offered */}
      <Card className="bg-gradient-to-br from-[hsl(var(--sky))]/10 to-[hsl(var(--cyan))]/5 border-[hsl(var(--sky))]/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[hsl(var(--sky))]" />
            Services Offered
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">No services listed</p>
          ) : (
            <div className="space-y-3">
              {subjects.map((subject) => (
                <div
                  key={subject}
                  className="flex items-center justify-between p-4 bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] hover:border-[hsl(var(--sky))]/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-sm">
                      {subject}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                        HKD {hourlyRate} / hour
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Standard 60-minute lesson
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleBookService(subject)}
                    className="bg-gradient-ocean text-white hover:opacity-90"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Time
                  </Button>
                </div>
              ))}
            </div>
          )}
          {!isAuthenticated && (
            <p className="text-sm text-[hsl(var(--muted-foreground))] text-center mt-4">
              Sign in to book a lesson
            </p>
          )}
        </CardContent>
      </Card>

      {/* Inline Booking Form */}
      {selectedService && (
        <Card className="border-2 border-[hsl(var(--sky))]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[hsl(var(--sky))]" />
                Book {selectedService}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseBooking}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* What to Expect */}
      <Card>
        <CardHeader>
          <CardTitle>What to Expect</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-[hsl(var(--muted))] rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-[hsl(var(--sky))] mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-[hsl(var(--foreground))]">Easy Booking</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Choose your preferred date and time. Flexible scheduling to fit your needs.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-[hsl(var(--muted))] rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-[hsl(var(--cyan))] mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-[hsl(var(--foreground))]">Secure Payment</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Pay via FPS or credit card. No crypto knowledge required. All payments are secure.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-[hsl(var(--muted))] rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-[hsl(var(--aqua))] mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-[hsl(var(--foreground))]">Verified Tutor</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  This tutor has been verified with credentials checked and reputation on blockchain.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Accepted Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-sm">FPS</Badge>
            <Badge variant="outline" className="text-sm">Credit Card</Badge>
            <Badge variant="outline" className="text-sm">Debit Card</Badge>
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-3">
            All payments are processed securely. You can also use credits earned from previous lessons for discounts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

