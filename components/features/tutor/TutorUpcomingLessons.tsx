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

interface TutorUpcomingLessonsProps {
  bookings: Booking[];
}

export function TutorUpcomingLessons({ bookings }: TutorUpcomingLessonsProps) {
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
            showActions={false}
          />
        ))}
      </CardContent>
    </Card>
  );
}

