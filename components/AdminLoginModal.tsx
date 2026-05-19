"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GlassModal } from "@/components/GlassModal";
import { setAdminSession, verifyAdminLogin } from "@/lib/auth";

interface AdminLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminLoginModal({ open, onClose, onSuccess }: AdminLoginModalProps) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyAdminLogin(id.trim(), password)) {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      return;
    }
    setAdminSession(true);
    setId("");
    setPassword("");
    setError(null);
    onSuccess();
    onClose();
  };

  const handleClose = () => {
    setId("");
    setPassword("");
    setError(null);
    onClose();
  };

  return (
    <GlassModal open={open} onClose={handleClose} title="어드민 로그인">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white/60 text-sm mb-2">아이디</label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            autoComplete="username"
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-white/50 focus:ring-2 focus:ring-white/10"
            placeholder="admin"
          />
        </div>
        <div>
          <label className="block text-white/60 text-sm mb-2">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-white/50 focus:ring-2 focus:ring-white/10"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white/70 text-sm"
          >
            취소
          </motion.button>
          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2.5 rounded-xl bg-white/20 border border-white/30 text-white text-sm font-semibold"
          >
            로그인
          </motion.button>
        </div>
      </form>
    </GlassModal>
  );
}
