/**
 * Shared booking types for the Tuna platform
 * Consolidates booking interfaces used across the application
 */

export type BookingStatus = 
  | "pending" 
  | "confirmed" 
  | "cancelled" 
  | "completed" 
  | "payment_held" 
  | "awaiting_confirmation";

export interface Booking {
  id: string;
  parentId?: string;
  tutorId: string;
  tutorName: string;
  tutorTokenId?: number;
  subject: string;
  duration: number;
  fee: number;
  originalFee?: number;
  creditsUsed?: number;
  scheduledAt: Date;
  studentName?: string;
  studentGrade?: string;
  status: BookingStatus;
  paymentIntentId?: string;
  paymentHash?: string;
  rating?: number;
  feedback?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EnhancedBooking extends Booking {
  patternId?: string;
  isRecurring?: boolean;
}

export type PatternFrequency = "weekly" | "biweekly" | "monthly";

export interface BookingPattern {
  id: string;
  tutorId: string;
  tutorName: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  time: string; // "15:00" format
  subject: string;
  frequency: PatternFrequency;
  bookings: Booking[];
  nextOccurrence: Date;
}

