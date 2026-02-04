"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingCard } from "@/components/features/booking/BookingCard";
import { EmptyState } from "@/components/shared/EmptyState";

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

interface PastLessonsProps {
  bookings: Booking[];
}

export function PastLessons({ bookings }: PastLessonsProps) {
  const pastBookings = bookings.filter(
    (b) => b.status === "completed" || b.status === "cancelled"
  );

  if (pastBookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Past Lessons</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No past lessons"
            description="Your completed lessons will appear here."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Past Lessons</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pastBookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            showActions={false}
          />
        ))}
      </CardContent>
    </Card>
  );
}

