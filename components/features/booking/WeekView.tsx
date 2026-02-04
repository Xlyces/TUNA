"use client";

import { useMemo } from "react";
import { Booking } from "@/lib/types/booking";
import { BookingCard } from "./BookingCard";
import { Card } from "@/components/ui/card";
import { getWeekDays, getBookingsForDate } from "@/lib/utils/date-helpers";
import { format } from "date-fns";

interface WeekViewProps {
  bookings: Booking[];
  selectedDate: Date;
  onBookingClick?: (booking: Booking) => void;
}

export function WeekView({
  bookings,
  selectedDate,
  onBookingClick,
}: WeekViewProps) {
  const weekDays = useMemo(() => getWeekDays(selectedDate, 0), [selectedDate]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayBookings = getBookingsForDate(bookings, day);
          const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

          return (
            <Card
              key={day.toISOString()}
              className={isToday ? "p-4 border-primary border-2" : "p-4"}
            >
              <div className="mb-4">
                <div className="font-semibold">{format(day, "EEEE")}</div>
                <div className="text-sm text-muted-foreground">
                  {format(day, "MMM d")}
                </div>
                {isToday && (
                  <div className="text-xs text-primary font-medium mt-1">
                    Today
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {dayBookings.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No bookings
                  </div>
                ) : (
                  dayBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      compact
                      showActions={false}
                    />
                  ))
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

