"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";

interface ConfirmationButtonProps {
  bookingId: string;
  tutorConfirmed: boolean;
  parentConfirmed: boolean;
  status: string;
  userRole: "tutor" | "parent";
  isTutor: boolean;
  isParent: boolean;
  onConfirm?: () => void;
}

export function ConfirmationButton({
  bookingId,
  tutorConfirmed,
  parentConfirmed,
  status,
  userRole,
  isTutor,
  isParent,
  onConfirm,
}: ConfirmationButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Determine if user can confirm
  const canConfirmTutor = isTutor && !tutorConfirmed;
  const canConfirmParent = isParent && !parentConfirmed;
  const canConfirm = canConfirmTutor || canConfirmParent;

  // Check if booking is in valid state for confirmation
  const canConfirmStatus = status === "payment_held" || status === "awaiting_confirmation";
  const isCompleted = status === "completed";

  const handleConfirm = async () => {
    if (!user || !canConfirm || !canConfirmStatus) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await axios.post(
        `/api/bookings/${bookingId}/confirm`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Confirmation Submitted",
        description: response.data.message || "Your confirmation has been recorded",
      });

      if (response.data.bothConfirmed) {
        toast({
          title: "Payment Released",
          description: `Payment has been captured. ${response.data.creditsAwarded ? `You earned ${response.data.creditsAwarded} credits!` : ""}`,
        });
      }

      onConfirm?.();
    } catch (error: any) {
      toast({
        title: "Confirmation Failed",
        description: error.response?.data?.error || "Failed to confirm booking",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Booking Completed
          </CardTitle>
          <CardDescription>Payment has been released and booking is complete.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lesson Completion Confirmation</CardTitle>
        <CardDescription>
          Both parties must confirm completion before payment is released.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-2">
            {tutorConfirmed ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Clock className="h-5 w-5 text-gray-400" />
            )}
            <span className="font-medium">Tutor Confirmation</span>
          </div>
          <span className={tutorConfirmed ? "text-green-600" : "text-gray-500"}>
            {tutorConfirmed ? "Confirmed" : "Pending"}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-2">
            {parentConfirmed ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Clock className="h-5 w-5 text-gray-400" />
            )}
            <span className="font-medium">Parent Confirmation</span>
          </div>
          <span className={parentConfirmed ? "text-green-600" : "text-gray-500"}>
            {parentConfirmed ? "Confirmed" : "Pending"}
          </span>
        </div>

        {canConfirm && canConfirmStatus && (
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Confirming..." : `Confirm as ${userRole === "tutor" ? "Tutor" : "Parent"}`}
          </Button>
        )}

        {!canConfirm && canConfirmStatus && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-800">
              You have already confirmed this booking.
            </span>
          </div>
        )}

        {tutorConfirmed && parentConfirmed && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-800">
              Both parties confirmed! Payment will be released shortly.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

