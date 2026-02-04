import { z } from "zod";

export const bookingSchema = z.object({
  tutorId: z.string().min(1, "Tutor ID is required"),
  tutorTokenId: z.number().optional(),
  subject: z.string().min(1, "Subject is required"),
  duration: z.number().min(30, "Duration must be at least 30 minutes").max(180, "Duration cannot exceed 180 minutes"),
  fee: z.number().min(0, "Fee must be positive"),
  scheduledAt: z.date({
    required_error: "Scheduled date and time is required",
  }),
  studentName: z.string().min(1, "Student name is required"),
  studentGrade: z.string().optional(),
  creditsUsed: z.number().min(0).default(0),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

