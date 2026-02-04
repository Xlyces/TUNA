"use client";

import { memo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BookingStep2StudentInfoProps {
  studentName?: string;
  studentGrade?: string;
  subject?: string;
  onChange: (data: { studentName: string; studentGrade?: string; subject: string }) => void;
}

const grades = [
  "F1", "F2", "F3", "F4", "F5", "F6",
  "Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12", "Year 13"
];

const subjects = [
  "Mathematics",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Chinese",
  "History",
];

export const BookingStep2StudentInfo = memo(function BookingStep2StudentInfo({
  studentName = "",
  studentGrade = "",
  subject = "",
  onChange,
}: BookingStep2StudentInfoProps) {
  const handleChange = useCallback((field: string, value: string) => {
    onChange({
      studentName: field === "studentName" ? value : studentName,
      studentGrade: field === "studentGrade" ? value : studentGrade,
      subject: field === "subject" ? value : subject,
    });
  }, [onChange, studentName, studentGrade, subject]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Information</CardTitle>
        <CardDescription>Tell us about the student</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="studentName">
            Student Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="studentName"
            value={studentName}
            onChange={(e) => handleChange("studentName", e.target.value)}
            placeholder="Enter student name"
            required
            className={!studentName ? "border-destructive" : ""}
          />
          {!studentName && (
            <p className="text-sm text-destructive">Student name is required</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="studentGrade">Grade/Year Level (Optional)</Label>
          <Select 
            value={studentGrade || undefined} 
            onValueChange={(value) => handleChange("studentGrade", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select grade (optional)" />
            </SelectTrigger>
            <SelectContent>
              {grades.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">
            Subject <span className="text-destructive">*</span>
          </Label>
          <Select 
            value={subject || undefined} 
            onValueChange={(value) => handleChange("subject", value)}
          >
            <SelectTrigger className={!subject ? "border-destructive" : ""}>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subj) => (
                <SelectItem key={subj} value={subj}>
                  {subj}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!subject && (
            <p className="text-sm text-destructive">Subject is required</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

