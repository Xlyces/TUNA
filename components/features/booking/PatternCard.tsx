"use client";

import { BookingPattern } from "@/lib/types/booking";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Repeat } from "lucide-react";
import { format } from "date-fns";

interface PatternCardProps {
  pattern: BookingPattern;
  onBookNext?: (pattern: BookingPattern, weeks: number) => void;
  onManageSeries?: (pattern: BookingPattern) => void;
}

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function PatternCard({
  pattern,
  onBookNext,
  onManageSeries,
}: PatternCardProps) {
  const timeFormatted = format(
    new Date(`2000-01-01T${pattern.time}`),
    "h:mm a"
  );

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold">{pattern.tutorName}</h4>
          <p className="text-sm text-muted-foreground">{pattern.subject}</p>
        </div>
        <Badge variant="secondary">
          <Repeat className="h-3 w-3 mr-1" />
          {pattern.frequency}
        </Badge>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            Every {dayNames[pattern.dayOfWeek]} at {timeFormatted}
          </span>
        </div>
        <div className="text-muted-foreground">
          {pattern.bookings.length} lesson{pattern.bookings.length !== 1 ? "s" : ""} booked
        </div>
        <div className="text-muted-foreground">
          Next: {format(pattern.nextOccurrence, "MMM d, yyyy")}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onBookNext?.(pattern, 4)}
        >
          Book Next 4 Weeks
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onManageSeries?.(pattern)}
        >
          Manage Series
        </Button>
      </div>
    </Card>
  );
}

