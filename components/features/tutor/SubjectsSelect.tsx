"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const availableSubjects = [
  "Mathematics",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Chinese",
  "History",
  "Geography",
  "Computer Science",
];

interface SubjectsSelectProps {
  value: string[];
  onChange: (subjects: string[]) => void;
  error?: string;
}

export function SubjectsSelect({ value, onChange, error }: SubjectsSelectProps) {
  const [selectedSubject, setSelectedSubject] = useState("");

  const handleAdd = () => {
    if (selectedSubject && !value.includes(selectedSubject)) {
      onChange([...value, selectedSubject]);
      setSelectedSubject("");
    }
  };

  const handleRemove = (subject: string) => {
    onChange(value.filter((s) => s !== subject));
  };

  const availableOptions = availableSubjects.filter(
    (s) => !value.includes(s)
  );

  return (
    <div className="space-y-2">
      <Label>Subjects Taught *</Label>
      <div className="flex gap-2">
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {availableOptions.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          onClick={handleAdd}
          disabled={!selectedSubject}
        >
          Add
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((subject) => (
            <Badge key={subject} variant="secondary" className="flex items-center gap-1">
              {subject}
              <button
                type="button"
                onClick={() => handleRemove(subject)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

