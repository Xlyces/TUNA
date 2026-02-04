"use client";

import { useState, useMemo } from "react";
import { Booking } from "@/lib/types/booking";
import { BookingPattern } from "@/lib/types/booking";
import { BookingBlock } from "./BookingBlock";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import {
  getWeekDays,
  getTimeSlots,
  getBookingsForDateTime,
} from "@/lib/utils/date-helpers";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  bookings: Booking[];
  patterns: BookingPattern[];
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
  onBookingClick?: (booking: Booking) => void;
}

export function CalendarView({
  bookings,
  patterns,
  selectedMonth,
  onMonthChange,
  onBookingClick,
}: CalendarViewProps) {
  const weekDays = useMemo(
    () => getWeekDays(selectedMonth, 0),
    [selectedMonth]
  );
  const timeSlots = useMemo(() => getTimeSlots(9, 22), []);

  const handlePreviousMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  // Enhance bookings with pattern info
  const enhancedBookings = useMemo(() => {
    return bookings.map((booking) => {
      const pattern = patterns.find(
        (p) =>
          p.tutorId === booking.tutorId &&
          booking.scheduledAt.getDay() === p.dayOfWeek &&
          format(booking.scheduledAt, "HH:mm") === p.time
      );
      return {
        ...booking,
        patternId: pattern?.id,
        isRecurring: !!pattern,
      };
    });
  }, [bookings, patterns]);

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">
          {format(selectedMonth, "MMMM yyyy")}
        </h2>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Header with day names */}
        <div className="grid grid-cols-8 border-b bg-muted/50">
          <div className="p-2 text-sm font-medium border-r">Time</div>
          {weekDays.map((day, idx) => (
            <div
              key={idx}
              className="p-2 text-center text-sm font-medium border-r last:border-r-0"
            >
              <div>{format(day, "EEE")}</div>
              <div className="text-xs text-muted-foreground">
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="divide-y max-h-[600px] overflow-y-auto">
          {timeSlots.map((hour) => (
            <div key={hour} className="grid grid-cols-8">
              <div className="p-2 text-sm text-muted-foreground border-r bg-muted/30 sticky left-0 z-10">
                {hour}:00
              </div>
              {weekDays.map((day, dayIdx) => {
                const dayBookings = getBookingsForDateTime(
                  enhancedBookings,
                  day,
                  hour
                );

                return (
                  <div
                    key={dayIdx}
                    className="p-1 border-r last:border-r-0 min-h-[60px] hover:bg-muted/50 transition-colors relative"
                  >
                    {dayBookings.map((booking) => (
                      <BookingBlock
                        key={booking.id}
                        booking={booking}
                        onClick={onBookingClick}
                        className="mb-1"
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

