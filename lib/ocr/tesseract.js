"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromImage = extractTextFromImage;
exports.extractExamScores = extractExamScores;
const tesseract_js_1 = require("tesseract.js");
/**
 * Extract text from an image using Tesseract.js OCR
 * @param imageFile The image file to process
 * @returns Extracted text
 */
async function extractTextFromImage(imageFile) {
    const worker = await (0, tesseract_js_1.createWorker)("eng");
    const { data } = await worker.recognize(imageFile);
    await worker.terminate();
    return data.text;
}
/**
 * Extract exam scores from OCR text
 * @param text The OCR-extracted text
 * @param examType "DSE" or "IB"
 * @returns Object with subject scores
 */
function extractExamScores(text, examType) {
    const scores = {};
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
    }
    else if (examType === "IB") {
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
