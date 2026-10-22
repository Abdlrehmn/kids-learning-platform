"use client";

import { useEffect, useState } from "react";

/**
 * Tracks the `prefers-reduced-motion` media query and keeps it in sync when the
 * visitor changes the setting while the page is open.
 */
export default function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(media.matches);

    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  return reducedMotion;
}
