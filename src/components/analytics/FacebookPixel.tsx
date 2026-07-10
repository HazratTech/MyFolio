"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Lightweight route-change tracker for Facebook Pixel.
 * The actual pixel script is injected in <head> via layout.tsx (beforeInteractive).
 * This component only fires fbq('track', 'PageView') on client-side navigations.
 */
export const FacebookPixelRouteTracker = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Skip the first render — the <head> script already fires PageView on initial load
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "PageView");
    }
  }, [pathname]);

  return null;
};
