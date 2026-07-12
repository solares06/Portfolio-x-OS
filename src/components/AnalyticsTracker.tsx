"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/actions/portfolio";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname && !pathname.startsWith('/os')) {
      trackPageView(pathname).catch(console.error);
    }
  }, [pathname]);

  return null;
}
