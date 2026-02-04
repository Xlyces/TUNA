/**
 * Design System - Color Palette
 * 
 * Ocean-themed color palette for TUNA platform
 * Ocean blues, coral accents, aqua highlights, and subtle web3 purple
 */

export const colors = {
  primary: {
    50: "#e3f2fd",   // Lightest ocean surface
    100: "#bbdefb",
    200: "#90caf9",
    300: "#64b5f6",
    400: "#42a5f5",
    500: "#0052cc",  // Main deep ocean blue (deeper)
    600: "#003d99",  // Deeper blue
    700: "#002d73",  // Deep navy
    800: "#001f3f",  // Deep navy
    900: "#000d1a",  // Deepest ocean
  },
  sky: {
    50: "#e0f7fa",
    100: "#b2ebf2",
    200: "#80deea",
    300: "#4dd0e1",
    400: "#26c6da",
    500: "#4fc3f7",  // Sky blue
    600: "#29b6f6",
    700: "#0288d1",
    800: "#01579b",
    900: "#003d5b",
  },
  navy: {
    50: "#e8eaf6",
    100: "#c5cae9",
    200: "#9fa8da",
    300: "#7986cb",
    400: "#5c6bc0",
    500: "#001f3f",  // Deep navy
    600: "#001529",
    700: "#000f1f",
    800: "#000a14",
    900: "#00050a",
  },
  cyan: {
    50: "#e0f7fa",
    100: "#b2ebf2",
    200: "#80deea",
    300: "#4dd0e1",
    400: "#26c6da",
    500: "#00bcd4",  // Cyan blue
    600: "#00acc1",
    700: "#0097a7",
    800: "#00838f",
    900: "#006064",
  },
  teal: {
    50: "#e0f2f1",
    100: "#b2dfdb",
    200: "#80cbc4",
    300: "#4db6ac",
    400: "#26a69a",
    500: "#00897b",  // Teal blue
    600: "#00695c",
    700: "#004d40",
    800: "#003d33",
    900: "#002d26",
  },
  coral: {
    50: "#fff5f2",
    100: "#ffe0d6",
    200: "#ffcbb9",
    300: "#ffb69d",
    400: "#ffa180",
    500: "#ff8c63",  // Main coral
    600: "#ff7046",
    700: "#cc5a38",
    800: "#99432b",
    900: "#662d1d",
  },
  aqua: {
    50: "#e0f7fa",
    100: "#b2ebf2",
    200: "#80deea",
    300: "#4dd0e1",
    400: "#26c6da",
    500: "#00acc1",  // Enhanced aqua/turquoise
    600: "#00897b",
    700: "#00695c",
    800: "#004d40",
    900: "#002d26",
  },
  web3: {
    50: "#f5f3ff",
    100: "#e9e5ff",
    200: "#d4ccff",
    300: "#b8aaff",
    400: "#9c88ff",
    500: "#8066ff",  // Ethereum-inspired
    600: "#664dcc",
    700: "#4d3399",
    800: "#331a66",
    900: "#1a0d33",
  },
  secondary: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },
} as const;

export type ColorScale = typeof colors.primary;

