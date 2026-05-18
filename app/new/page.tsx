"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getSupabase } from "@/lib/supabase";
import { SWOT_FIELDS } from "@/lib/swot-fields";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function NewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [values, setValues] = useState({
    strengths: "",
    weaknesses: "",
    opportunities: "",
    threats: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    setSaving(true);
    setError(null);

    const supabase = getSupabase();
    const { error: supabaseError } = await supabase.from("st_analyses").insert({
      title: title.trim(),
      strengths: values.strengths,
      weaknesses: values.weaknesses,
      opportunities: values.opportunities,
      threats: values.threats,
    });

    if (supabaseError) {
      setError("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
      setSaving(false);
      return;
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-900 via-purple-900 to-blue-900">
      {/* 배경 장식 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-10"
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
              whileTap={{ scale: 0.96 }}
              className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white/70 hover:text-white transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </motion.button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">새 분석 작성</h1>
            <p className="text-white/50 text-sm mt-1">강점(S)·약점(W)·기회(O)·위협(T)를 각각 작성하세요</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
          {/* 제목 입력 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-6"
          >
            <label className="block text-white/70 text-sm font-medium mb-3">
              분석 제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 신제품 출시 전략 분석"
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-base outline-none focus:border-white/50 focus:ring-2 focus:ring-white/10 transition-all duration-200"
            />
          </motion.div>

          {/* SWOT 4요소 */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8"
          >
            {SWOT_FIELDS.map((field) => (
              <motion.div
                key={field.key}
                variants={itemVariants}
                className={`rounded-3xl bg-linear-to-br ${field.color} backdrop-blur-md border ${field.border} p-6`}
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-2xl font-extrabold ${field.accent}`}>
                    {field.letter}
                  </span>
                  <span className="text-white/60 text-sm font-medium">
                    {field.subtitle}
                  </span>
                </div>
                <p className="text-white/40 text-xs mb-4">{field.description}</p>
                <textarea
                  value={values[field.key]}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  placeholder={`${field.subtitle}(${field.letter}) 내용을 입력하세요...`}
                  rows={6}
                  className={`w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3 text-white placeholder-white/25 text-sm outline-none resize-none transition-all duration-200 focus:ring-2 ${field.focus} leading-relaxed`}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* 에러 메시지 */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm mb-4 text-center"
            >
              {error}
            </motion.p>
          )}

          {/* 제출 버튼 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-end gap-3"
          >
            <Link href="/">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white/70 hover:text-white text-sm font-medium transition-colors"
              >
                취소
              </motion.button>
            </Link>
            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: saving ? 1 : 1.03, backgroundColor: "rgba(255,255,255,0.28)" }}
              whileTap={{ scale: saving ? 1 : 0.97 }}
              className="px-8 py-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold text-sm tracking-wide shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                  />
                  저장 중...
                </span>
              ) : (
                "저장하기"
              )}
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
