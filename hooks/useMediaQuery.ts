"use client";

import { useState, useEffect } from "react";
import { breakpoints } from "@/lib/design-system/breakpoints";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

export function useBreakpoint(breakpoint: keyof typeof breakpoints): boolean {
  const query = `(min-width: ${breakpoints[breakpoint]})`;
  return useMediaQuery(query);
}

