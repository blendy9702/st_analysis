"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getSupabase, type StAnalysis } from "@/lib/supabase";
import { SWOT_FIELDS } from "@/lib/swot-fields";
import {
  grantEditAccess,
  hasEditAccess,
  isAdminSession,
  promptAndVerifyAnalysisPassword,
} from "@/lib/auth";

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

export default function AnalysisEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const accessCheckedRef = useRef(false);

  const [title, setTitle] = useState("");
  const [values, setValues] = useState({
    strengths: "",
    weaknesses: "",
    opportunities: "",
    threats: "",
  });
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    async function fetchOne() {
      const supabase = getSupabase();
      const { data, error: fetchError } = await supabase
        .from("st_analyses")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (fetchError || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const item = data as StAnalysis;
      setTitle(item.title);
      setValues({
        strengths: item.strengths,
        weaknesses: item.weaknesses,
        opportunities: item.opportunities,
        threats: item.threats,
      });
      setLoading(false);
    }

    fetchOne();
  }, [id]);

  useEffect(() => {
    if (loading || notFound || accessCheckedRef.current) return;
    accessCheckedRef.current = true;

    async function verifyAccess() {
      if (isAdminSession() || hasEditAccess(id)) {
        setCanEdit(true);
        return;
      }

      const supabase = getSupabase();
      const { data } = await supabase
        .from("st_analyses")
        .select("title, password_hash")
        .eq("id", id)
        .maybeSingle();

      if (!data?.password_hash) {
        window.alert("수정 권한이 없습니다.");
        setAccessDenied(true);
        router.replace("/");
        return;
      }

      const ok = await promptAndVerifyAnalysisPassword(data.title, data.password_hash);
      if (!ok) {
        setAccessDenied(true);
        router.replace(`/analysis/${id}`);
        return;
      }

      grantEditAccess(id);
      setCanEdit(true);
    }

    verifyAccess();
  }, [loading, notFound, id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }

    setSaving(true);
    setError(null);

    const supabase = getSupabase();
    const { error: updateError } = await supabase
      .from("st_analyses")
      .update({
        title: title.trim(),
        strengths: values.strengths,
        weaknesses: values.weaknesses,
        opportunities: values.opportunities,
        threats: values.threats,
      })
      .eq("id", id);

    if (updateError) {
      setError("수정 중 오류가 발생했습니다. 다시 시도해주세요.");
      setSaving(false);
      return;
    }

    router.push(`/analysis/${id}`);
  };

  if (accessDenied) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-900 via-purple-900 to-blue-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-10"
        >
          <Link href={`/analysis/${id}`}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
              whileTap={{ scale: 0.96 }}
              className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white/70 hover:text-white transition-colors"
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
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">분석 수정</h1>
            <p className="text-white/50 text-sm mt-1">
              강점(S)·약점(W)·기회(O)·위협(T) 내용을 수정하세요
            </p>
          </div>
        </motion.div>

        {loading || !canEdit ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full"
            />
            {!loading && !canEdit && (
              <p className="text-white/50 text-sm">수정 권한 확인 중...</p>
            )}
          </div>
        ) : notFound ? (
          <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 p-10 text-center">
            <p className="text-white/70 mb-6">분석을 찾을 수 없습니다.</p>
            <Link href="/">
              <span className="inline-block px-6 py-3 rounded-2xl bg-white/15 border border-white/25 text-white text-sm font-medium cursor-pointer">
                목록으로 돌아가기
              </span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-6"
            >
              <label className="block text-white/70 text-sm font-medium mb-3">분석 제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-base outline-none focus:border-white/50 focus:ring-2 focus:ring-white/10 transition-all duration-200"
              />
            </motion.div>

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
                    <span className="text-white/60 text-sm font-medium">{field.subtitle}</span>
                  </div>
                  <p className="text-white/40 text-xs mb-4">{field.description}</p>
                  <textarea
                    value={values[field.key]}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    rows={6}
                    className={`w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3 text-white placeholder-white/25 text-sm outline-none resize-none transition-all duration-200 focus:ring-2 ${field.focus} leading-relaxed`}
                  />
                </motion.div>
              ))}
            </motion.div>

            {error && (
              <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-end gap-3"
            >
              <Link href={`/analysis/${id}`}>
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
                whileHover={{
                  scale: saving ? 1 : 1.03,
                  backgroundColor: "rgba(255,255,255,0.28)",
                }}
                whileTap={{ scale: saving ? 1 : 0.97 }}
                className="px-8 py-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold text-sm tracking-wide shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "저장 중..." : "수정 완료"}
              </motion.button>
            </motion.div>
          </form>
        )}
      </div>
    </div>
  );
}
