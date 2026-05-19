"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface GlassModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function GlassModal({ open, onClose, title, children }: GlassModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.button
        type="button"
        aria-label="닫기"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-md rounded-3xl bg-white/10 backdrop-blur-xl border border-white/25 shadow-2xl p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="glass-modal-title"
      >
        <h2 id="glass-modal-title" className="text-xl font-bold text-white mb-5">
          {title}
        </h2>
        {children}
      </motion.div>
    </div>
  );
}
