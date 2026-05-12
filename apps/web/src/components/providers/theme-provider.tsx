"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

// React 19 warns about <script> elements rendered inside components.
// next-themes injects an inline script during SSR to prevent theme flicker.
// This filter keeps the dev overlay clean without affecting runtime behavior.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const first = args[0];
    if (
      typeof first === "string" &&
      first.includes("Encountered a script tag while rendering React component")
    ) {
      return;
    }
    originalError(...args);
  };
}

export function ThemeProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      themes={["light", "dark"]}
      storageKey="shivtatva-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

