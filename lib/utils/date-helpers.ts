/**
 * Date helper utilities for calendar and booking views
 */

import { Booking } from "@/lib/types/booking";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameHour,
  startOfDay,
  format,
} from "date-fns";

/**
 * Gets array of dates for a week starting from the given date
 */
export function getWeekDays(date: Date, weekStartsOn: 0 | 1 = 0): Date[] {
  const weekStart = startOfWeek(date, { weekStartsOn });
  const weekEnd = endOfWeek(date, { weekStartsOn });
  return eachDayOfInterval({ start: weekStart, end: weekEnd });
}

/**
 * Gets time slots (hour numbers) for calendar display
 * Default: 9 AM to 10 PM (14 slots)
 */
export function getTimeSlots(
  startHour: number = 9,
  endHour: number = 22
): number[] {
  return Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
}

/**
 * Groups bookings by day
 */
export function groupBookingsByDay(
  bookings: Booking[],
  date: Date
): Booking[] {
  return bookings.filter((booking) => isSameDay(booking.scheduledAt, date));
}

/**
 * Groups bookings by time (hour)
 */
export function groupBookingsByTime(
  bookings: Booking[],
  hour: number
): Booking[] {
  return bookings.filter((booking) => {
    const bookingHour = booking.scheduledAt.getHours();
    return bookingHour === hour;
  });
}

/**
 * Groups bookings by day and time
 */
export function groupBookingsByDayAndTime(
  bookings: Booking[],
  date: Date,
  hour: number
): Booking[] {
  return bookings.filter((booking) => {
    return (
      isSameDay(booking.scheduledAt, date) &&
      booking.scheduledAt.getHours() === hour
    );
  });
}

/**
 * Gets all bookings for a specific date
 */
export function getBookingsForDate(
  bookings: Booking[],
  date: Date
): Booking[] {
  return bookings.filter((booking) => isSameDay(booking.scheduledAt, date));
}

/**
 * Gets all bookings for a specific hour on a specific date
 */
export function getBookingsForDateTime(
  bookings: Booking[],
  date: Date,
  hour: number
): Booking[] {
  return bookings.filter((booking) => {
    const bookingDate = startOfDay(booking.scheduledAt);
    const targetDate = startOfDay(date);
    return (
      isSameDay(bookingDate, targetDate) &&
      booking.scheduledAt.getHours() === hour
    );
  });
}

/**
 * Formats time for display (e.g., "3:00 PM")
 */
export function formatTime(date: Date): string {
  return format(date, "h:mm a");
}

/**
 * Formats date for display (e.g., "Monday, January 1")
 */
export function formatDate(date: Date): string {
  return format(date, "EEEE, MMMM d");
}

/**
 * Formats short date (e.g., "Jan 1")
 */
export function formatShortDate(date: Date): string {
  return format(date, "MMM d");
}

