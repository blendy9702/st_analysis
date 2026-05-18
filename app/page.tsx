"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, type StAnalysis } from "@/lib/supabase";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function HomePage() {
  const [analyses, setAnalyses] = useState<StAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalyses() {
      const { data } = await supabase
        .from("st_analyses")
        .select("*")
        .order("created_at", { ascending: false });
      setAnalyses(data ?? []);
      setLoading(false);
    }
    fetchAnalyses();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-900 via-purple-900 to-blue-900">
      {/* 배경 장식 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              ST 분석
            </h1>
            <p className="text-white/60 mt-2 text-lg">
              SWOT 기반 전략 분석 도구
            </p>
          </div>
          <Link href="/new">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.25)" }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 text-white font-semibold text-sm tracking-wide shadow-lg transition-colors duration-200"
            >
              + 작성하기
            </motion.button>
          </Link>
        </motion.div>

        {/* 콘텐츠 */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full"
            />
          </div>
        ) : analyses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-64 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10"
          >
            <p className="text-white/50 text-lg mb-4">아직 작성된 분석이 없습니다</p>
            <Link href="/new">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white text-sm font-medium"
              >
                첫 번째 분석 작성하기
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {analyses.map((item) => (
                <motion.div
                  key={item.id}
                  variants={cardVariants}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="h-full"
                >
                  <Link
                    href={`/analysis/${item.id}`}
                    className="block h-full rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  >
                    <div className="group h-full rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden cursor-pointer transition-shadow duration-300 hover:shadow-2xl hover:border-white/30">
                      {/* 카드 헤더 */}
                      <div className="px-6 pt-6 pb-4 border-b border-white/10">
                        <h2 className="text-white font-semibold text-lg truncate">
                          {item.title}
                        </h2>
                        <p className="text-white/40 text-xs mt-1">
                          {new Date(item.created_at).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>

                      {/* ST 매트릭스 미리보기 */}
                      <div className="p-4 grid grid-cols-2 gap-2">
                        {[
                          { label: "SO", value: item.so, color: "bg-blue-500/20 border-blue-400/30" },
                          { label: "WO", value: item.wo, color: "bg-purple-500/20 border-purple-400/30" },
                          { label: "ST", value: item.st, color: "bg-indigo-500/20 border-indigo-400/30" },
                          { label: "WT", value: item.wt, color: "bg-violet-500/20 border-violet-400/30" },
                        ].map(({ label, value, color }) => (
                          <div
                            key={label}
                            className={`rounded-xl border ${color} p-3`}
                          >
                            <span className="text-white/80 font-bold text-xs block mb-1">
                              {label}
                            </span>
                            <p className="text-white/60 text-xs line-clamp-3 leading-relaxed">
                              {value || "—"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
