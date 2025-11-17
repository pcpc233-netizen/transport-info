/**
 * 관리자 인증 유틸리티
 *
 * admin.bustime.site에서만 사용되는 관리자 세션 관리
 * - admin_users 테이블 기반 인증
 * - admin_sessions 테이블에 세션 토큰 저장
 * - Supabase Auth 미사용
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * 세션 토큰 저장/조회용 키 (단일 키만 사용)
 */
const SESSION_TOKEN_KEY = 'admin_session_token';

/**
 * 세션 토큰 가져오기
 */
export function getAdminSessionToken(): string | null {
  return sessionStorage.getItem(SESSION_TOKEN_KEY);
}

/**
 * 세션 토큰 저장
 */
export function setAdminSessionToken(token: string): void {
  sessionStorage.setItem(SESSION_TOKEN_KEY, token);
}

/**
 * 세션 토큰 삭제
 */
export function clearAdminSessionToken(): void {
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
}

/**
 * 관리자 로그인
 */
export async function loginAdmin(username: string, password: string): Promise<{
  success: boolean;
  sessionToken?: string;
  admin?: {
    id: string;
    username: string;
    email: string;
  };
  error?: string;
}> {
  try {
    const ipAddress = 'unknown';
    const userAgent = navigator.userAgent;

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/admin-login`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          ipAddress,
          userAgent,
        }),
      }
    );

    const result = await response.json();

    if (result.success && result.sessionToken) {
      // 세션 토큰을 단일 키에 저장 (변형하지 않음)
      setAdminSessionToken(result.sessionToken);
    }

    return result;
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      error: '로그인 중 오류가 발생했습니다',
    };
  }
}

/**
 * 세션 검증
 */
export async function verifyAdminSession(): Promise<{
  valid: boolean;
  admin?: {
    id: string;
    username: string;
    email: string;
  };
}> {
  try {
    const sessionToken = getAdminSessionToken();

    if (!sessionToken) {
      return { valid: false };
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/admin-verify-session`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionToken,
        }),
      }
    );

    const result = await response.json();

    if (!result.valid) {
      clearAdminSessionToken();
    }

    return result;
  } catch (error) {
    console.error('Session verification error:', error);
    return { valid: false };
  }
}

/**
 * 로그아웃
 */
export function logoutAdmin(): void {
  clearAdminSessionToken();
}
