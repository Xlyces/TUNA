"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { UserProfile } from "@/lib/firebase/auth";

interface TutorVerificationBannerProps {
  userProfile: UserProfile | null;
}

export function TutorVerificationBanner({
  userProfile,
}: TutorVerificationBannerProps) {
  const isVerified = !!userProfile?.tutorTokenId;

  if (isVerified) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-green-800">
            ✓ Verified Tutor - Verification Badge: #{userProfile.tutorTokenId}
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-yellow-50 border-yellow-200">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-yellow-800">
          Verification Required - You need to verify your credentials before you can receive bookings.
        </span>
        <Button variant="outline" size="sm" asChild>
          <Link to="/tutor/verify">Start Verification</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}

