"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "st_marketing_welcome_v1";

export function MarketingWelcomeSplash() {
  const [open, setOpen] = React.useState(false);
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useLayoutEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }
    setReduceMotion(
      typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    setOpen(true);
  }, []);

  const finish = React.useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // private mode / quota
    }
    setOpen(false);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const ms = reduceMotion ? 550 : 2800;
    const id = window.setTimeout(() => finish(), ms);
    return () => window.clearTimeout(id);
  }, [open, finish, reduceMotion]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, finish]);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const r = reduceMotion;
  const tBackdrop = r ? 0.12 : 0.45;
  const tContent = r ? 0.12 : 0.65;
  const tLogo = r ? 0.1 : 0.55;
  const tTitle = r ? 0.1 : 0.5;
  const tLine = r ? 0.08 : 0.6;
  const tHint = r ? 0.08 : 0.4;
  const dLogo = r ? 0 : 0.08;
  const dTitle = r ? 0 : 0.2;
  const dLine = r ? 0 : 0.38;
  const dHint = r ? 0 : 0.52;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="marketing-welcome"
          role="dialog"
          aria-modal
          aria-label="Welcome"
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#020617]/92 backdrop-blur-md px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: tBackdrop }}
          onClick={() => finish()}
        >
          <motion.div
            className="flex flex-col items-center text-center max-w-lg pointer-events-none"
            initial={{ opacity: 0, y: r ? 0 : 16, scale: r ? 1 : 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: tContent, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-[1.75rem] ring-1 ring-white/15 bg-white/[0.06] shadow-[0_0_60px_rgba(245,124,0,.25)]"
              initial={{ opacity: 0, scale: r ? 1 : 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: dLogo, duration: tLogo, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src="/brand/shivtatva-logo.png"
                alt="Shiv Tatva Solutions"
                fill
                className="object-contain p-3"
                priority
              />
            </motion.div>
            <motion.h1
              className="mt-8 text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-white text-balance leading-snug"
              initial={{ opacity: 0, y: r ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dTitle, duration: tTitle }}
            >
              Shiv Tatva Solutions Pvt Ltd
            </motion.h1>
            <motion.div
              className="mt-10 h-1 w-28 rounded-full bg-gradient-to-r from-transparent via-[#F57C00] to-transparent"
              initial={{ opacity: 0, scaleX: r ? 1 : 0.3 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: dLine, duration: tLine }}
            />
            <motion.p
              className="mt-6 text-xs text-slate-400/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: dHint, duration: tHint }}
            >
              {r ? "Press Esc or tap to continue" : "Tap anywhere to continue"}
            </motion.p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
