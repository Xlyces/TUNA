/**
 * Pattern detection utilities for recurring bookings
 */

import { Booking, BookingPattern, PatternFrequency } from "@/lib/types/booking";
import { format, addDays, addWeeks, addMonths } from "date-fns";

/**
 * Detects recurring patterns in bookings
 * Groups bookings by tutor + day of week + time
 * Requires minimum 3 bookings with consistent intervals
 */
export function detectPatterns(bookings: Booking[]): BookingPattern[] {
  const patterns: BookingPattern[] = [];
  const patternMap = new Map<string, Booking[]>();

  // Group bookings by tutor + day + time
  bookings.forEach((booking) => {
    const dayOfWeek = booking.scheduledAt.getDay();
    const time = format(booking.scheduledAt, "HH:mm");
    const key = `${booking.tutorId}-${dayOfWeek}-${time}`;

    if (!patternMap.has(key)) {
      patternMap.set(key, []);
    }
    patternMap.get(key)!.push(booking);
  });

  // Detect patterns (3+ occurrences = potential pattern)
  patternMap.forEach((bookingGroup, key) => {
    if (bookingGroup.length < 3) return;

    const [tutorId, dayOfWeekStr, time] = key.split("-");
    const dayOfWeek = parseInt(dayOfWeekStr);
    const firstBooking = bookingGroup[0];

    // Sort bookings by date
    const sortedBookings = [...bookingGroup].sort(
      (a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime()
    );

    // Check interval consistency
    const intervals: number[] = [];
    for (let i = 1; i < sortedBookings.length; i++) {
      const daysDiff = Math.round(
        (sortedBookings[i].scheduledAt.getTime() -
          sortedBookings[i - 1].scheduledAt.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      intervals.push(daysDiff);
    }

    // Determine frequency based on intervals
    const frequency = detectFrequency(intervals);

    if (frequency) {
      patterns.push({
        id: key,
        tutorId,
        tutorName: firstBooking.tutorName,
        dayOfWeek,
        time,
        subject: firstBooking.subject,
        frequency,
        bookings: sortedBookings,
        nextOccurrence: calculateNextOccurrence(
          sortedBookings[sortedBookings.length - 1].scheduledAt,
          dayOfWeek,
          time,
          frequency
        ),
      });
    }
  });

  return patterns;
}

/**
 * Detects frequency pattern from intervals
 * Returns null if pattern is inconsistent
 */
function detectFrequency(intervals: number[]): PatternFrequency | null {
  if (intervals.length === 0) return null;

  // Check if all intervals are approximately weekly (6-8 days)
  const isWeekly = intervals.every((interval) => interval >= 6 && interval <= 8);
  if (isWeekly) return "weekly";

  // Check if all intervals are approximately biweekly (13-15 days)
  const isBiweekly = intervals.every(
    (interval) => interval >= 13 && interval <= 15
  );
  if (isBiweekly) return "biweekly";

  // Check if all intervals are approximately monthly (28-31 days)
  const isMonthly = intervals.every(
    (interval) => interval >= 28 && interval <= 31
  );
  if (isMonthly) return "monthly";

  return null;
}

/**
 * Calculates the next occurrence of a pattern
 */
export function calculateNextOccurrence(
  lastDate: Date,
  dayOfWeek: number,
  time: string,
  frequency: PatternFrequency
): Date {
  const [hours, minutes] = time.split(":").map(Number);
  let next: Date;

  switch (frequency) {
    case "weekly":
      next = addWeeks(lastDate, 1);
      break;
    case "biweekly":
      next = addWeeks(lastDate, 2);
      break;
    case "monthly":
      next = addMonths(lastDate, 1);
      break;
    default:
      next = addWeeks(lastDate, 1);
  }

  // Adjust to correct day of week if needed
  const currentDay = next.getDay();
  const dayDiff = dayOfWeek - currentDay;
  if (dayDiff !== 0) {
    next = addDays(next, dayDiff);
  }

  next.setHours(hours, minutes, 0, 0);
  return next;
}

/**
 * Checks if a booking belongs to a pattern
 */
export function isBookingInPattern(
  booking: Booking,
  pattern: BookingPattern
): boolean {
  return (
    booking.tutorId === pattern.tutorId &&
    booking.scheduledAt.getDay() === pattern.dayOfWeek &&
    format(booking.scheduledAt, "HH:mm") === pattern.time
  );
}

/**
 * Enhances bookings with pattern information
 */
export function enhanceBookingsWithPatterns(
  bookings: Booking[],
  patterns: BookingPattern[]
): Booking[] {
  return bookings.map((booking) => {
    const pattern = patterns.find((p) => isBookingInPattern(booking, p));
    return {
      ...booking,
      patternId: pattern?.id,
      isRecurring: !!pattern,
    };
  });
}

