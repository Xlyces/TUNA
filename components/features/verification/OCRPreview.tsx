"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OCRData {
  math?: string;
  english?: string;
  physics?: string;
  chemistry?: string;
  biology?: string;
  [key: string]: string | undefined;
}

interface OCRPreviewProps {
  ocrData: OCRData | null;
  loading?: boolean;
}

export function OCRPreview({ ocrData, loading }: OCRPreviewProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing Certificate</CardTitle>
          <CardDescription>Extracting information from your certificate...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!ocrData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>OCR Results</CardTitle>
          <CardDescription>No data extracted yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const subjects = Object.entries(ocrData).filter(([key]) => key !== "examType");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <CardTitle>Extracted Scores</CardTitle>
        </div>
        <CardDescription>
          Please verify that the extracted information is correct
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            If any information is incorrect, please contact support or re-upload a clearer image.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-4">
          {subjects.map(([subject, score]) => (
            <div key={subject} className="space-y-2">
              <p className="text-sm font-medium capitalize">{subject}</p>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {score || "N/A"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

