"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

type VerificationStatus = "pending" | "approved" | "rejected";

interface VerificationStatusProps {
  status: VerificationStatus;
  message?: string;
  tutorTokenId?: number;
}

export function VerificationStatus({
  status,
  message,
  tutorTokenId,
}: VerificationStatusProps) {
  const getIcon = () => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getMessage = () => {
    if (message) return message;
    
    switch (status) {
      case "approved":
        return "Your verification has been approved! Your SBT has been minted.";
      case "rejected":
        return "Your verification was rejected. Please check the reason and resubmit.";
      default:
        return "Your verification is under review. We'll notify you once it's processed.";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getIcon()}
            <CardTitle>Verification Status</CardTitle>
          </div>
          <StatusBadge status={status} />
        </div>
        <CardDescription>{getMessage()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "approved" && tutorTokenId && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your SBT Token ID: <strong>#{tutorTokenId}</strong>
            </AlertDescription>
          </Alert>
        )}
        {status === "rejected" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {message || "Please review your documents and resubmit."}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

