"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import {
  marketingPageRoot,
  marketingSectionLine,
  marketingSurface,
  marketingStrong,
  marketingBody,
} from "@/components/marketing/marketing-styles";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

export function PageShell({
  title,
  subtitle,
  children,
}: Readonly<{
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}>) {
  return (
    <div className={marketingPageRoot}>
      <Navbar appearance="landing" />
      <main className="flex-1">
        <header className={cn("relative overflow-hidden", marketingSectionLine)}>
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.4] dark:opacity-[0.35]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(15,23,42,0.09) 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 hidden opacity-[0.35] dark:block"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148,163,184,0.12) 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-28 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(249,115,22,.32), transparent 55%), radial-gradient(circle at 70% 40%, rgba(59,130,246,.18), transparent 60%)",
            }}
            initial={{ opacity: 0.35 }}
            animate={{ opacity: [0.35, 0.5, 0.35], scale: [1, 1.03, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className={cn(marketingSurface, "p-8 lg:p-10")}
            >
              <h1 className={cn("text-3xl font-semibold tracking-tight sm:text-4xl", marketingStrong)}>{title}</h1>
              {subtitle ? (
                <div className={cn("mt-3 max-w-3xl text-base leading-relaxed", marketingBody)}>{subtitle}</div>
              ) : null}
            </motion.div>
          </div>
        </header>
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">{children}</section>
      </main>
      <Footer variant="dark" />
    </div>
  );
}
