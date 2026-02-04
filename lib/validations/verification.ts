import { z } from "zod";

export const verificationSchema = z.object({
  examType: z.enum(["DSE", "IB"], {
    required_error: "Please select an exam type",
  }),
  pdfFile: z.instanceof(File, {
    message: "PDF file is required",
  }).refine((file) => file.type === "application/pdf", {
    message: "File must be a PDF",
  }),
  selfieFile: z.instanceof(File, {
    message: "Selfie image is required",
  }).refine((file) => file.type.startsWith("image/"), {
    message: "File must be an image",
  }),
});

export type VerificationFormData = z.infer<typeof verificationSchema>;

