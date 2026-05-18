"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getSupabase, type StAnalysis } from "@/lib/supabase";

const quadrants = [
  {
    key: "so" as const,
    label: "SO",
    subtitle: "강점 × 기회",
    color: "from-blue-500/15 to-cyan-500/8",
    border: "border-blue-400/25",
    accent: "text-blue-300",
  },
  {
    key: "wo" as const,
    label: "WO",
    subtitle: "약점 × 기회",
    color: "from-purple-500/15 to-pink-500/8",
    border: "border-purple-400/25",
    accent: "text-purple-300",
  },
  {
    key: "st" as const,
    label: "ST",
    subtitle: "강점 × 위협",
    color: "from-indigo-500/15 to-blue-500/8",
    border: "border-indigo-400/25",
    accent: "text-indigo-300",
  },
  {
    key: "wt" as const,
    label: "WT",
    subtitle: "약점 × 위협",
    color: "from-violet-500/15 to-purple-500/8",
    border: "border-violet-400/25",
    accent: "text-violet-300",
  },
];

export default function AnalysisDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [item, setItem] = useState<StAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    async function fetchOne() {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("st_analyses")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
      } else {
        setItem(data);
      }
      setLoading(false);
    }

    fetchOne();
  }, [id]);

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-900 via-purple-900 to-blue-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-start gap-4 mb-10"
        >
          <Link href="/">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
              whileTap={{ scale: 0.96 }}
              className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white/70 hover:text-white transition-colors"
              aria-label="목록으로"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </motion.button>
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-white/45 text-sm mb-1">상세 보기</p>
            {loading ? (
              <div className="h-9 w-48 rounded-lg bg-white/10 animate-pulse" />
            ) : item ? (
              <>
                <h1 className="text-3xl font-bold text-white tracking-tight wrap-break-word">
                  {item.title}
                </h1>
                <p className="text-white/40 text-sm mt-2">
                  {new Date(item.created_at).toLocaleString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </>
            ) : null}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-24">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full"
            />
          </div>
        ) : notFound || !item ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 p-10 text-center"
          >
            <p className="text-white/70 mb-6">분석을 찾을 수 없습니다.</p>
            <Link href="/">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block px-6 py-3 rounded-2xl bg-white/15 border border-white/25 text-white text-sm font-medium cursor-pointer"
              >
                목록으로 돌아가기
              </motion.span>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {quadrants.map((q, i) => (
              <motion.article
                key={q.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * i, duration: 0.4 }}
                className={`rounded-3xl bg-linear-to-br ${q.color} backdrop-blur-md border ${q.border} p-6`}
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-2xl font-extrabold ${q.accent}`}>{q.label}</span>
                  <span className="text-white/55 text-sm font-medium">{q.subtitle}</span>
                </div>
                <p className="text-white/75 text-sm leading-relaxed whitespace-pre-wrap">
                  {item[q.key]?.trim() ? item[q.key] : "내용 없음"}
                </p>
              </motion.article>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
