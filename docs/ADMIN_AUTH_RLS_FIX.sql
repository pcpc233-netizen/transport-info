/*
  관리자 인증 시스템 RLS 정책 초기화 스크립트

  목적:
  - admin_sessions, admin_users, admin_activity_logs 테이블의 RLS 정책을 깔끔하게 정리
  - service_role만 전체 접근 허용, 다른 role은 접근 불가
  - 잘못된 정책(user_id, auth.uid() 참조 등)을 완전히 제거

  실행 방법:
  1. Supabase 대시보드 접속 (https://supabase.com/dashboard)
  2. 프로젝트 선택 (gibqdecjcdyeyxtknbok)
  3. 왼쪽 메뉴에서 "SQL Editor" 클릭
  4. "New query" 버튼 클릭
  5. 이 파일의 전체 내용을 복사해서 붙여넣기
  6. "Run" 버튼 클릭하여 실행

  주의:
  - 이 스크립트는 기존 정책을 모두 삭제하고 새로 만듭니다
  - 실행 후에는 반드시 Vercel을 재배포해야 합니다 (캐시 없이)
*/

-- ============================================
-- admin_sessions 테이블 RLS 정책 초기화
-- ============================================

-- 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Service role full access to admin_sessions" ON admin_sessions;
DROP POLICY IF EXISTS "Block public access to admin sessions" ON admin_sessions;
DROP POLICY IF EXISTS "Users can read own sessions" ON admin_sessions;
DROP POLICY IF EXISTS "Service role can manage admin sessions" ON admin_sessions;
DROP POLICY IF EXISTS "No direct access to admin_sessions" ON admin_sessions;

-- service_role만 전체 접근 허용
CREATE POLICY "Service role full access to admin_sessions"
  ON admin_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS 활성화 (반드시 유지)
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- admin_users 테이블 RLS 정책 초기화
-- ============================================

-- 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Service role full access to admin_users" ON admin_users;
DROP POLICY IF EXISTS "Service role can manage admin_users" ON admin_users;
DROP POLICY IF EXISTS "No direct access to admin_users" ON admin_users;

-- service_role만 전체 접근 허용
CREATE POLICY "Service role full access to admin_users"
  ON admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS 활성화 (반드시 유지)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- admin_activity_logs 테이블 RLS 정책 초기화
-- ============================================

-- 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Service role full access to admin_activity_logs" ON admin_activity_logs;
DROP POLICY IF EXISTS "Service role activity access" ON admin_activity_logs;
DROP POLICY IF EXISTS "Service role can manage admin_activity_logs" ON admin_activity_logs;
DROP POLICY IF EXISTS "No direct access to admin_activity_logs" ON admin_activity_logs;

-- service_role만 전체 접근 허용
CREATE POLICY "Service role full access to admin_activity_logs"
  ON admin_activity_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS 활성화 (반드시 유지)
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 검증 쿼리
-- ============================================

-- 현재 적용된 정책 확인
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('admin_sessions', 'admin_users', 'admin_activity_logs')
ORDER BY tablename, policyname;

-- 예상 결과:
-- admin_activity_logs | Service role full access to admin_activity_logs | service_role | ALL
-- admin_sessions      | Service role full access to admin_sessions      | service_role | ALL
-- admin_users         | Service role full access to admin_users         | service_role | ALL
