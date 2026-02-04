"use client";

import { useState } from "react";
import { FileUpload } from "@/components/forms/FileUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface PDFUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
}

export function PDFUpload({ value, onChange }: PDFUploadProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle>Upload Certificate</CardTitle>
        </div>
        <CardDescription>
          Upload your DSE or IB certificate PDF
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FileUpload
          accept="application/pdf"
          maxSize={10}
          value={value || null}
          onChange={onChange}
          label="Certificate PDF"
          description="Upload your exam certificate (max 10MB)"
          required
        />
      </CardContent>
    </Card>
  );
}

