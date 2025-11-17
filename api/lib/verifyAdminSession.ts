/**
 * 공통 관리자 세션 검증 유틸리티
 *
 * admin.bustime.site API에서 사용하는 통합 세션 검증 함수
 * - 오직 서버 전용 환경변수만 사용
 * - VITE_ 접두사 환경변수 사용 금지
 * - service_role로 admin_sessions 테이블 직접 조회
 */

import { createClient } from '@supabase/supabase-js';

/**
 * 관리자 세션 정보
 */
export interface AdminSession {
  adminId: string;
  username: string;
  email: string;
}

/**
 * 관리자 세션 검증
 *
 * @param sessionToken - Authorization 헤더에서 추출한 토큰 (Bearer 제거됨)
 * @returns 검증 성공 시 관리자 정보, 실패 시 null
 */
export async function verifyAdminSession(sessionToken: string): Promise<AdminSession | null> {
  try {
    // 서버 전용 환경변수만 사용 (VITE_ 접두사 금지)
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('[verifyAdminSession] Missing server environment variables');
      return null;
    }

    if (!sessionToken || sessionToken.trim().length === 0) {
      console.error('[verifyAdminSession] Empty or invalid token');
      return null;
    }

    // service_role로 Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, serviceKey);

    // admin_sessions 테이블에서 토큰 검증
    // - session_token이 정확히 일치
    // - expires_at이 현재 시각 이후
    // - auth.uid() 같은 레거시 조건 사용 금지
    const { data: session, error: sessionError } = await supabase
      .from('admin_sessions')
      .select('admin_id, expires_at')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (sessionError) {
      console.error('[verifyAdminSession] Session query error:', sessionError);
      return null;
    }

    if (!session) {
      console.log('[verifyAdminSession] Session not found or expired');
      return null;
    }

    // admin_users 테이블에서 관리자 정보 조회
    const { data: admin, error: adminError } = await supabase
      .from('admin_users')
      .select('id, username, email, is_active')
      .eq('id', session.admin_id)
      .eq('is_active', true)
      .maybeSingle();

    if (adminError) {
      console.error('[verifyAdminSession] Admin user query error:', adminError);
      return null;
    }

    if (!admin) {
      console.log('[verifyAdminSession] Admin user not found or inactive');
      return null;
    }

    // 검증 성공
    return {
      adminId: admin.id,
      username: admin.username,
      email: admin.email,
    };
  } catch (error) {
    console.error('[verifyAdminSession] Unexpected error:', error);
    return null;
  }
}
