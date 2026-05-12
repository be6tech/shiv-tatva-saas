"use client";

import * as React from "react";
import { MarketingWelcomeSplash } from "@/components/marketing/marketing-welcome-splash";

/** Marketing pages: welcome splash (once per session) + page content. */
export function MarketingChrome({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <MarketingWelcomeSplash />
      {children}
    </>
  );
}
