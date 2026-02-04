/**
 * Design System - Responsive Breakpoints
 * 
 * Breakpoints for responsive design
 */

export const breakpoints = {
  sm: "640px", // Small devices (phones)
  md: "768px", // Medium devices (tablets)
  lg: "1024px", // Large devices (desktops)
  xl: "1280px", // Extra large devices
  "2xl": "1536px", // 2X large devices
} as const;

export type Breakpoint = keyof typeof breakpoints;

