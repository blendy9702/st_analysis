import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

/** 빌드·프리렌더 시에는 env가 없을 수 있으므로, 호출 시점에만 클라이언트를 만듭니다. */
export function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY가 없습니다. Vercel 프로젝트 환경 변수에 두 값을 설정하세요.",
    );
  }
  if (!browserClient) {
    browserClient = createClient(url, key);
  }
  return browserClient;
}

export interface StAnalysis {
  id: string;
  title: string;
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
  created_at: string;
  password_hash?: string;
}
