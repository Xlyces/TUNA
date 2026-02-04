"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Coins } from "lucide-react";

interface CreditEarnedProps {
  credits: number;
}

export function CreditEarned({ credits }: CreditEarnedProps) {
  return (
    <Alert className="bg-green-50 border-green-200">
      <Coins className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        <strong>Congratulations!</strong> You've earned {credits} credits for completing this lesson.
      </AlertDescription>
    </Alert>
  );
}

