"use client";

import { FileUpload } from "@/components/forms/FileUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from "lucide-react";

interface SelfieUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
}

export function SelfieUpload({ value, onChange }: SelfieUploadProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Camera className="h-5 w-5 text-primary" />
          <CardTitle>Upload Selfie</CardTitle>
        </div>
        <CardDescription>
          Upload a clear selfie for verification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FileUpload
          accept="image/*"
          maxSize={5}
          value={value || null}
          onChange={onChange}
          label="Selfie Photo"
          description="Upload a clear photo of yourself (max 5MB)"
          required
        />
      </CardContent>
    </Card>
  );
}

