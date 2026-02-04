/**
 * Tutor color generation utilities
 * Generates consistent colors for tutors based on their ID
 */

// Color palette for tutor differentiation
const TUTOR_COLORS = [
  "bg-blue-100 border-blue-300 text-blue-900",
  "bg-green-100 border-green-300 text-green-900",
  "bg-purple-100 border-purple-300 text-purple-900",
  "bg-orange-100 border-orange-300 text-orange-900",
  "bg-pink-100 border-pink-300 text-pink-900",
  "bg-indigo-100 border-indigo-300 text-indigo-900",
  "bg-teal-100 border-teal-300 text-teal-900",
  "bg-amber-100 border-amber-300 text-amber-900",
  "bg-cyan-100 border-cyan-300 text-cyan-900",
  "bg-rose-100 border-rose-300 text-rose-900",
] as const;

// Dark mode variants
const TUTOR_COLORS_DARK = [
  "bg-blue-900/30 border-blue-600 text-blue-100",
  "bg-green-900/30 border-green-600 text-green-100",
  "bg-purple-900/30 border-purple-600 text-purple-100",
  "bg-orange-900/30 border-orange-600 text-orange-100",
  "bg-pink-900/30 border-pink-600 text-pink-100",
  "bg-indigo-900/30 border-indigo-600 text-indigo-100",
  "bg-teal-900/30 border-teal-600 text-teal-100",
  "bg-amber-900/30 border-amber-600 text-amber-100",
  "bg-cyan-900/30 border-cyan-600 text-cyan-100",
  "bg-rose-900/30 border-rose-600 text-rose-100",
] as const;

/**
 * Simple hash function for consistent color assignment
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Gets a consistent color class for a tutor based on their ID
 */
export function getTutorColor(tutorId: string, useDark = false): string {
  const hash = hashString(tutorId);
  const index = hash % TUTOR_COLORS.length;
  return useDark ? TUTOR_COLORS_DARK[index] : TUTOR_COLORS[index];
}

/**
 * Gets just the background color class (without border/text)
 */
export function getTutorBgColor(tutorId: string, useDark = false): string {
  const colorClass = getTutorColor(tutorId, useDark);
  // Extract just the bg-* class
  return colorClass.split(" ").find((cls) => cls.startsWith("bg-")) || "";
}

/**
 * Gets just the border color class
 */
export function getTutorBorderColor(tutorId: string, useDark = false): string {
  const colorClass = getTutorColor(tutorId, useDark);
  // Extract just the border-* class
  return colorClass.split(" ").find((cls) => cls.startsWith("border-")) || "";
}

