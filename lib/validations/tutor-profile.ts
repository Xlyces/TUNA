import { z } from "zod";

export const tutorProfileSchema = z.object({
  bio: z.string().max(1000, "Bio must be less than 1000 characters").optional(),
  subjects: z.array(z.string()).min(1, "Please select at least one subject"),
  hourlyRate: z.number().min(100, "Hourly rate must be at least HKD 100").max(2000, "Hourly rate cannot exceed HKD 2000"),
  profilePicture: z.instanceof(File).optional(),
});

export type TutorProfileFormData = z.infer<typeof tutorProfileSchema>;

