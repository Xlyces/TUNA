import { createWorker } from "tesseract.js";

/**
 * Extract text from an image using Tesseract.js OCR
 * @param imageFile The image file to process
 * @returns Extracted text
 */
export async function extractTextFromImage(imageFile: File | Blob | Buffer): Promise<string> {
  const worker = await createWorker("eng");
  // Support Node/Express uploads (Buffer) as well as browser File
  const input: any =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof Buffer !== "undefined" && Buffer.isBuffer(imageFile as any)
      ? new Blob([imageFile as any])
      : (imageFile as any);

  const { data } = await worker.recognize(input);
  await worker.terminate();
  return data.text;
}

/**
 * Extract exam scores from OCR text
 * @param text The OCR-extracted text
 * @param examType "DSE" or "IB"
 * @returns Object with subject scores
 */
export function extractExamScores(
  text: string,
  examType: "DSE" | "IB"
): Record<string, string> {
  const scores: Record<string, string> = {};
  const upperText = text.toUpperCase();

  if (examType === "DSE") {
    // DSE pattern: "Mathematics: Level 5**" or "Math: 5**"
    const dsePattern = /(?:Mathematics|Math|English|Physics|Chemistry|Biology|Chinese|History|Geography)\s*:?\s*Level?\s*(\d\*{0,2})/gi;
    let match;
    while ((match = dsePattern.exec(text)) !== null) {
      const subject = match[0].split(/[:Level]/)[0].trim();
      const score = match[1];
      scores[subject] = score;
    }
  } else if (examType === "IB") {
    // IB pattern: "Mathematics HL: 7" or "Math HL: 7"
    const ibPattern = /(?:Mathematics|Math|English|Physics|Chemistry|Biology|Chinese|History|Geography)\s*(?:HL|SL)?\s*:?\s*(\d)/gi;
    let match;
    while ((match = ibPattern.exec(text)) !== null) {
      const subject = match[0].split(/[:]/)[0].trim();
      const score = match[1];
      scores[subject] = score;
    }
  }

  return scores;
}

