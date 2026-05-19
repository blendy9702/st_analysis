"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabase, type StAnalysis } from "@/lib/supabase";
import { SWOT_FIELDS } from "@/lib/swot-fields";
import {
  grantOneTimeAccess,
  isAdminSession,
  promptAndVerifyAnalysisPassword,
  setAdminSession,
} from "@/lib/auth";
import { AdminLoginModal } from "@/components/AdminLoginModal";

type AnalysisListItem = Pick<StAnalysis, "id" | "title" | "created_at"> &
  Partial<Pick<StAnalysis, "strengths" | "weaknesses" | "opportunities" | "threats">>;

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
  const router = useRouter();
  const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  useEffect(() => {
    setIsAdmin(isAdminSession());
  }, []);

  useEffect(() => {
    async function fetchAnalyses() {
      setLoading(true);
      const supabase = getSupabase();

      const { data } = isAdmin
        ? await supabase
            .from("st_analyses")
            .select("id, title, strengths, weaknesses, opportunities, threats, created_at")
            .order("created_at", { ascending: false })
        : await supabase
            .from("st_analyses")
            .select("id, title, created_at")
            .order("created_at", { ascending: false });

      setAnalyses((data as AnalysisListItem[] | null) ?? []);
      setLoading(false);
    }
    fetchAnalyses();
  }, [isAdmin]);

  const handleLogoutAdmin = () => {
    setAdminSession(false);
    setIsAdmin(false);
  };

  const handleCardClick = async (item: AnalysisListItem) => {
    if (isAdmin) {
      router.push(`/analysis/${item.id}`);
      return;
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("st_analyses")
      .select("password_hash")
      .eq("id", item.id)
      .maybeSingle();

    if (error || !data?.password_hash) {
      window.alert("접근할 수 없습니다.");
      return;
    }

    const ok = await promptAndVerifyAnalysisPassword(item.title, data.password_hash);
    if (!ok) return;

    grantOneTimeAccess(item.id);
    router.push(`/analysis/${item.id}`);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-900 via-purple-900 to-blue-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <button
              type="button"
              onClick={() => setAdminModalOpen(true)}
              className="text-left group"
            >
              <h1 className="text-4xl font-bold text-white tracking-tight group-hover:text-white/90 transition-colors cursor-pointer">
                ST 분석
              </h1>
            </button>
            <p className="text-white/60 mt-2 text-lg">SWOT 기반 전략 분석 도구</p>
            {isAdmin && (
              <div className="flex items-center gap-3 mt-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-medium">
                  어드민 로그인됨
                </span>
                <button
                  type="button"
                  onClick={handleLogoutAdmin}
                  className="text-white/45 text-xs hover:text-white/70 underline underline-offset-2"
                >
                  로그아웃
                </button>
              </div>
            )}
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
                  <button
                    type="button"
                    onClick={() => handleCardClick(item)}
                    className="block h-full w-full text-left rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  >
                    <div className="group h-full rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden cursor-pointer transition-shadow duration-300 hover:shadow-2xl hover:border-white/30">
                      <div className="px-6 pt-6 pb-4 border-b border-white/10">
                        <h2 className="text-white font-semibold text-lg truncate">{item.title}</h2>
                        <p className="text-white/40 text-xs mt-1">
                          {new Date(item.created_at).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="relative p-4 grid grid-cols-2 gap-2">
                        {SWOT_FIELDS.map((field) => (
                          <div
                            key={field.key}
                            className={`rounded-xl border ${field.previewBg} p-3 ${
                              isAdmin ? "" : "select-none"
                            }`}
                          >
                            <span className="text-white/80 font-bold text-xs block mb-1">
                              {field.letter}{" "}
                              <span className="text-white/50 font-medium">{field.subtitle}</span>
                            </span>
                            <p
                              className={`text-white/60 text-xs line-clamp-3 leading-relaxed ${
                                isAdmin ? "" : "blur-md"
                              }`}
                            >
                              {isAdmin && item[field.key] !== undefined
                                ? item[field.key] || "—"
                                : "비밀번호 확인 후 열람 가능"}
                            </p>
                          </div>
                        ))}

                        {!isAdmin && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/15 text-white/70 text-xs">
                              클릭하여 상세 보기 · 비밀번호 필요
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AdminLoginModal
        open={adminModalOpen}
        onSuccess={() => setIsAdmin(true)}
        onClose={() => setAdminModalOpen(false)}
      />
    </div>
  );
}
