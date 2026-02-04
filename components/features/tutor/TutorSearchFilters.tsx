"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TutorFilters } from "@/hooks/useTutors";
import { X } from "lucide-react";

interface TutorSearchFiltersProps {
  filters: TutorFilters;
  onFiltersChange: (filters: TutorFilters) => void;
}

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

export function TutorSearchFilters({
  filters,
  onFiltersChange,
}: TutorSearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<TutorFilters>(filters);

  const updateFilter = (key: keyof TutorFilters, value: any) => {
    // Convert "all" to undefined to clear the filter
    const filterValue = value === "all" || value === "" ? undefined : value;
    const newFilters = { ...localFilters, [key]: filterValue };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: TutorFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.keys(localFilters).length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Exam Type</Label>
          <Select
            value={localFilters.examType || "all"}
            onValueChange={(value) => updateFilter("examType", value === "all" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All exam types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All exam types</SelectItem>
              <SelectItem value="DSE">DSE</SelectItem>
              <SelectItem value="IB">IB</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Subject</Label>
          <Select
            value={localFilters.subjects?.[0] || "all"}
            onValueChange={(value) => {
              if (value === "all") {
                updateFilter("subjects", undefined);
              } else {
                updateFilter("subjects", [value]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Price Range (HKD/hr)</Label>
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={localFilters.minPrice || ""}
              onChange={(e) =>
                updateFilter(
                  "minPrice",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
            <Input
              type="number"
              placeholder="Max"
              value={localFilters.maxPrice || ""}
              onChange={(e) =>
                updateFilter(
                  "maxPrice",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Minimum Rating</Label>
          <Select
            value={localFilters?.minRating?.toString() || "all"}
            onValueChange={(value) =>
              updateFilter(
                "minRating",
                value === "all" ? undefined : value ? Number(value) : undefined
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Any rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any rating</SelectItem>
              <SelectItem value="4">4+ stars</SelectItem>
              <SelectItem value="4.5">4.5+ stars</SelectItem>
              <SelectItem value="5">5 stars</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Minimum Hours Taught</Label>
          <Input
            type="number"
            placeholder="0"
            value={localFilters.minHours || ""}
            onChange={(e) =>
              updateFilter(
                "minHours",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

