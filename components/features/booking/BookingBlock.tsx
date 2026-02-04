"use client";

import { Booking, EnhancedBooking } from "@/lib/types/booking";
import { getTutorColor } from "@/lib/utils/tutor-colors";
import { formatTime } from "@/lib/utils/date-helpers";
import { cn } from "@/lib/utils";
import { Repeat } from "lucide-react";

interface BookingBlockProps {
  booking: Booking | EnhancedBooking;
  onClick?: (booking: Booking) => void;
  className?: string;
}

export function BookingBlock({
  booking,
  onClick,
  className,
}: BookingBlockProps) {
  const isRecurring = "isRecurring" in booking && booking.isRecurring;
  const colorClass = getTutorColor(booking.tutorId);
  const timeStr = formatTime(booking.scheduledAt);

  return (
    <div
      className={cn(
        "p-2 rounded text-xs cursor-pointer transition-all hover:shadow-md",
        isRecurring
          ? "bg-primary/20 border-2 border-dashed border-primary"
          : "bg-primary/10 border border-primary/30",
        colorClass,
        className
      )}
      onClick={() => onClick?.(booking)}
      title={`${booking.tutorName} - ${booking.subject} at ${timeStr} (${booking.duration} min)`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(booking);
        }
      }}
    >
      <div className="font-medium truncate">{booking.tutorName}</div>
      <div className="text-muted-foreground truncate text-[10px]">
        {booking.subject}
      </div>
      <div className="text-muted-foreground truncate text-[10px] mt-0.5">
        {timeStr}
      </div>
      {isRecurring && (
        <div className="flex items-center gap-1 mt-1">
          <Repeat className="h-3 w-3 text-primary" />
          <span className="text-[10px] text-primary font-medium">
            Recurring
          </span>
        </div>
      )}
    </div>
  );
}

