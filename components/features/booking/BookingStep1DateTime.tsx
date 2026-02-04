"use client";

import { useState, useEffect, memo, lazy, Suspense, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

// Lazy load Calendar component to reduce initial bundle size
const Calendar = lazy(() => import("@/components/ui/calendar").then(module => ({ default: module.Calendar })));

interface BookingStep1DateTimeProps {
  value?: Date;
  onChange: (date: Date, time: string) => void;
}

export const BookingStep1DateTime = memo(function BookingStep1DateTime({
  value,
  onChange,
}: BookingStep1DateTimeProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  const [selectedTime, setSelectedTime] = useState<string>(value ? format(value, "HH:mm") : "");

  // Update when value prop changes
  useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setSelectedTime(format(value, "HH:mm"));
    }
  }, [value]);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      // Use current selectedTime from state via closure
      setSelectedTime((prevTime) => {
        if (prevTime) {
          const [hours, minutes] = prevTime.split(":");
          const dateTime = new Date(date);
          dateTime.setHours(parseInt(hours), parseInt(minutes));
          // Schedule onChange to run after state update completes
          queueMicrotask(() => onChange(dateTime, prevTime));
        } else {
          // If time not selected yet, just update date
          const dateTime = new Date(date);
          dateTime.setHours(12, 0); // Default to noon
          // Schedule onChange to run after state update completes
          queueMicrotask(() => onChange(dateTime, ""));
        }
        return prevTime; // Keep the time value
      });
    }
  }, [onChange]);

  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(time);
    // Use current selectedDate from state via closure
    setSelectedDate((prevDate) => {
      if (prevDate) {
        const [hours, minutes] = time.split(":");
        const dateTime = new Date(prevDate);
        dateTime.setHours(parseInt(hours), parseInt(minutes));
        // Schedule onChange to run after state update completes
        queueMicrotask(() => onChange(dateTime, time));
      }
      return prevDate; // Keep the date value
    });
  }, [onChange]);

  // Generate time slots (9 AM to 9 PM, every hour) - memoized
  const timeSlots = useMemo(() => 
    Array.from({ length: 13 }, (_, i) => {
      const hour = 9 + i;
      return `${hour.toString().padStart(2, "0")}:00`;
    }), []
  );

  const isDateSelected = !!selectedDate;
  const isTimeSelected = !!selectedTime;
  const isComplete = isDateSelected && isTimeSelected;

  return (
    <div className="space-y-6">
      {!isComplete && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select both a date and time to continue.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={!isDateSelected ? "border-destructive" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Select Date <span className="text-destructive">*</span>
            </CardTitle>
            <CardDescription>Choose a date for your lesson</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center w-full">
              <Suspense fallback={<LoadingSpinner text="Loading calendar..." />}>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  className="rounded-md border w-full"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4 w-full",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                    day_disabled: "text-muted-foreground opacity-50",
                  }}
                />
              </Suspense>
            </div>
            {selectedDate && (
              <p className="mt-4 text-sm text-muted-foreground text-center">
                Selected: {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className={!isTimeSelected ? "border-destructive" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Select Time <span className="text-destructive">*</span>
            </CardTitle>
            <CardDescription>Choose a time slot</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedTime || ""} onValueChange={handleTimeSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTime && (
              <p className="mt-4 text-sm text-muted-foreground text-center">
                Selected: {selectedTime}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {isComplete && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            ✓ Lesson scheduled for {format(selectedDate!, "EEEE, MMMM d, yyyy")} at {selectedTime}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
});

