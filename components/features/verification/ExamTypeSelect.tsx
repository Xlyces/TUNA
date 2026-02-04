"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap } from "lucide-react";

interface ExamTypeSelectProps {
  value?: "DSE" | "IB";
  onChange: (value: "DSE" | "IB") => void;
}

export function ExamTypeSelect({ value, onChange }: ExamTypeSelectProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <CardTitle>Exam Type</CardTitle>
        </div>
        <CardDescription>
          Select the type of exam certificate you're submitting
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="examType">Exam Type *</Label>
          <Select value={value} onValueChange={(val) => onChange(val as "DSE" | "IB")}>
            <SelectTrigger id="examType">
              <SelectValue placeholder="Select exam type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DSE">DSE (Hong Kong Diploma of Secondary Education)</SelectItem>
              <SelectItem value="IB">IB (International Baccalaureate)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

