"use client";

import * as React from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: Readonly<{
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}>) {
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-0 overflow-y-auto">
        <div className="min-h-full px-4 py-10 grid place-items-center">
          <div className="w-full max-w-3xl glass rounded-3xl ring-1 ring-white/10 shadow-[0_40px_120px_rgba(0,0,0,.6)]">
            <div className="flex items-start justify-between gap-4 p-6 border-b border-white/10">
              <div>
                {title ? (
                  <div className="text-lg font-semibold">{title}</div>
                ) : null}
                <div className="text-xs text-slate-300/70">
                  Press Esc to close
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-10 w-10 rounded-2xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition grid place-items-center"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

