/**
 * Design System - Animation Utilities
 * 
 * Reusable animation classes and constants for TUNA platform
 */

export const animations = {
  // Wave/Ripple effects
  ripple: "ripple 0.6s ease-out",
  wave: "wave 2s ease-in-out infinite",
  
  // Floating/Swimming
  float: "float 3s ease-in-out infinite",
  swim: "swim 4s ease-in-out infinite",
  
  // Bubbles
  bubble: "bubble 2s ease-in-out infinite",
  bubbles: "bubbles 3s ease-in-out infinite",
  
  // Fishing line cast
  cast: "cast 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
  
  // Page transitions
  fadeIn: "fadeIn 0.4s ease-out",
  slideUp: "slideUp 0.5s ease-out",
  
  // Hover effects
  scale: "scale 0.2s ease-out",
  glow: "glow 2s ease-in-out infinite",
} as const;

export type AnimationKey = keyof typeof animations;

/**
 * Animation utility classes for Tailwind
 */
export const animationClasses = {
  ripple: "animate-[ripple_0.6s_ease-out]",
  wave: "animate-[wave_2s_ease-in-out_infinite]",
  float: "animate-[float_3s_ease-in-out_infinite]",
  swim: "animate-[swim_4s_ease-in-out_infinite]",
  bubble: "animate-[bubble_2s_ease-in-out_infinite]",
  bubbles: "animate-[bubbles_3s_ease-in-out_infinite]",
  cast: "animate-[cast_0.8s_cubic-bezier(0.4,0,0.2,1)]",
  glow: "animate-[glow_2s_ease-in-out_infinite]",
} as const;

