const ADMIN_SESSION_KEY = "st_analysis_admin";
const PASS_PREFIX = "st_analysis_pass_";
const EDIT_PREFIX = "st_analysis_edit_";

export const ADMIN_ID = "admin";
export const ADMIN_PASSWORD = "1324qewr";

export function isAdminSession(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

export function setAdminSession(active: boolean): void {
  sessionStorage.setItem(ADMIN_SESSION_KEY, active ? "true" : "false");
}

export function verifyAdminLogin(id: string, password: string): boolean {
  return id === ADMIN_ID && password === ADMIN_PASSWORD;
}

/** 메인에서 비밀번호 확인 직후 상세 1회 진입용 (페이지 로드 시 소비) */
export function grantOneTimeAccess(id: string): void {
  sessionStorage.setItem(`${PASS_PREFIX}${id}`, "1");
  grantEditAccess(id);
}

export function consumeOneTimeAccess(id: string): boolean {
  const key = `${PASS_PREFIX}${id}`;
  if (sessionStorage.getItem(key) !== "1") return false;
  sessionStorage.removeItem(key);
  grantEditAccess(id);
  return true;
}

/** 열람 인증 후 수정 허용 (세션 유지) */
export function grantEditAccess(id: string): void {
  sessionStorage.setItem(`${EDIT_PREFIX}${id}`, "1");
}

export function hasEditAccess(id: string): boolean {
  if (typeof window === "undefined") return false;
  return isAdminSession() || sessionStorage.getItem(`${EDIT_PREFIX}${id}`) === "1";
}

export function revokeAnalysisAccess(id: string): void {
  sessionStorage.removeItem(`${EDIT_PREFIX}${id}`);
  sessionStorage.removeItem(`${PASS_PREFIX}${id}`);
}

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`${password}:st_analysis`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyAnalysisPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  if (!passwordHash) return false;
  return (await hashPassword(password)) === passwordHash;
}

export async function promptAndVerifyAnalysisPassword(
  title: string,
  passwordHash: string,
  action = "상세 보기",
): Promise<boolean> {
  if (!passwordHash) {
    window.alert("비밀번호가 설정되지 않은 항목입니다. 접근할 수 없습니다.");
    return false;
  }

  const password = window.prompt(`"${title}" ${action}\n비밀번호를 입력하세요.`);
  if (password === null) return false;
  if (!password.trim()) {
    window.alert("비밀번호를 입력해주세요.");
    return false;
  }

  const ok = await verifyAnalysisPassword(password.trim(), passwordHash);
  if (!ok) {
    window.alert("비밀번호가 올바르지 않습니다. 접근이 거부되었습니다.");
    return false;
  }

  return true;
}

export async function promptConfirmAndVerifyDelete(
  title: string,
  passwordHash: string,
  skipPassword: boolean,
): Promise<boolean> {
  if (
    !window.confirm(
      `"${title}" 분석을 삭제하시겠습니까?\n삭제 후 복구할 수 없습니다.`,
    )
  ) {
    return false;
  }

  if (skipPassword) return true;

  return promptAndVerifyAnalysisPassword(title, passwordHash, "삭제");
}
