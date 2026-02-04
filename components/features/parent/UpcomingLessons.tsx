"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingCard } from "@/components/features/booking/BookingCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Booking {
  id: string;
  tutorName: string;
  tutorId: string;
  scheduledAt: Date;
  subject: string;
  duration: number;
  fee: number;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  studentName?: string;
}

interface UpcomingLessonsProps {
  bookings: Booking[];
  onCancel?: (id: string) => void;
  onReschedule?: (id: string) => void;
}

export function UpcomingLessons({
  bookings,
  onCancel,
  onReschedule,
}: UpcomingLessonsProps) {
  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "pending"
  );

  if (upcomingBookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Lessons</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No upcoming lessons"
            description="You don't have any scheduled lessons yet."
            action={{
              label: "Find a Tutor",
              href: "/search",
            }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Lessons</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingBookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onCancel={onCancel}
            onReschedule={onReschedule}
          />
        ))}
      </CardContent>
    </Card>
  );
}

