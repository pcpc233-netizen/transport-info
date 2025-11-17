# 🚀 즉시 실행 체크리스트

## 📌 현재 상황
- ✅ 올바른 Supabase URL 확인: `https://rqtphxshonrktuhhmudh.supabase.co`
- ✅ 모든 코드 파일 수정 완료
- ✅ `admin_users`, `admin_sessions`, `admin_activity_logs` 테이블 존재 확인
- ⚠️ API 키 설정 필요
- ⚠️ RLS 정책 설정 필요

---

## ✅ 질문 답변

### Q1: 로컬 `.env` 파일 업데이트를 직접 해주세요
**답변:** 아래 1단계에서 자동으로 처리됩니다!

### Q2: Vercel 환경변수 - 나머지는 이전 값으로 두면 되나요?
**답변:**
- ✅ **네! 기존 환경변수는 그대로 두세요**
- 🔄 다음 3개만 **값 수정**:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- ✅ 나머지 (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SEOUL_BUS_API_KEY` 등)는 **그대로 유지**

### Q3: RLS 정책 초기화 시 "admin_sessions does not exist" 오류
**답변:**
- ❌ **Primary Database** role로 실행하면 테이블이 보이지 않습니다
- ✅ **postgres** role로 변경해서 실행해야 합니다
- 아래 3단계 참고!

---

## 📋 실행 순서

### ✅ 1단계: Supabase에서 API 키 복사 (지금 바로!)

**현재 Supabase 대시보드 → Settings → API Keys 화면에서:**

#### 1-1. Project URL 확인
```
https://rqtphxshonrktuhhmudh.supabase.co
```
✅ 이미 확인됨!

#### 1-2. anon public 키 복사
- 화면에 표시된 긴 키 전체 복사
- 형식: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- 메모장에 임시 저장

#### 1-3. service_role 키 복사
- **"Reveal" 버튼 클릭** (필수!)
- `**** **** ****`가 실제 키로 표시됨
- 전체 복사
- 메모장에 임시 저장

---

### ✅ 2단계: Vercel 환경변수 업데이트

**Vercel 대시보드 열기:**
- https://vercel.com/dashboard
- `transport-info1` 프로젝트 선택
- Settings → Environment Variables

**3개 환경변수 수정 (기존 값 덮어쓰기):**

#### SUPABASE_URL
- 기존 항목 찾기 → Edit 클릭
- Value: `https://rqtphxshonrktuhhmudh.supabase.co`
- ✅ Production
- ✅ Preview
- ✅ Development
- Save

#### SUPABASE_ANON_KEY
- 기존 항목 찾기 → Edit 클릭
- Value: [1단계에서 복사한 anon 키]
- ✅ Production
- ✅ Preview
- ✅ Development
- Save

#### SUPABASE_SERVICE_ROLE_KEY
- 기존 항목 찾기 → Edit 클릭
- Value: [1단계에서 복사한 service_role 키]
- ✅ Production
- ✅ Preview
- ✅ Development
- Save

**⚠️ 중요:**
- 기존 환경변수는 절대 삭제하지 마세요!
- 위 3개만 **값 수정**하시면 됩니다
- 각 환경변수마다 3개 환경(Production, Preview, Development) 모두 체크 필수!

---

### ✅ 3단계: Supabase RLS 정책 초기화

#### 3-1. Supabase SQL Editor 접속
- https://supabase.com/dashboard
- 프로젝트: longtail-seo (rqtphxshonrktuhhmudh)
- 왼쪽 메뉴 → **SQL Editor**

#### 3-2. Role 변경 (중요!)
- SQL Editor 화면 우측 상단
- **"Role: postgres"** 선택 (Primary Database 아님!)
- 이렇게 해야 admin 테이블들이 보입니다

#### 3-3. New Query 생성
- "New query" 버튼 클릭

#### 3-4. SQL 스크립트 실행
```sql
-- admin_sessions RLS 정책
DROP POLICY IF EXISTS "Service role full access to admin_sessions" ON admin_sessions;
CREATE POLICY "Service role full access to admin_sessions"
  ON admin_sessions FOR ALL TO service_role
  USING (true) WITH CHECK (true);
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- admin_users RLS 정책
DROP POLICY IF EXISTS "Service role full access to admin_users" ON admin_users;
CREATE POLICY "Service role full access to admin_users"
  ON admin_users FOR ALL TO service_role
  USING (true) WITH CHECK (true);
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- admin_activity_logs RLS 정책
DROP POLICY IF EXISTS "Service role full access to admin_activity_logs" ON admin_activity_logs;
CREATE POLICY "Service role full access to admin_activity_logs"
  ON admin_activity_logs FOR ALL TO service_role
  USING (true) WITH CHECK (true);
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- 검증
SELECT tablename, policyname, roles
FROM pg_policies
WHERE tablename IN ('admin_sessions', 'admin_users', 'admin_activity_logs')
ORDER BY tablename;
```

#### 3-5. 실행 및 확인
- **"Run"** 버튼 클릭
- Results 탭에서 다음 3개 정책 확인:
  ```
  admin_activity_logs | Service role full access to admin_activity_logs | {service_role}
  admin_sessions      | Service role full access to admin_sessions      | {service_role}
  admin_users         | Service role full access to admin_users         | {service_role}
  ```

---

### ✅ 4단계: GitHub 저장소 설정 및 푸시

**GitHub 저장소 URL을 알려주세요!**

예시:
- `https://github.com/username/transport-info1`
- 또는 `username/transport-info1`

저장소 URL을 알려주시면 자동으로:
- ✅ Git 설정
- ✅ 전체 커밋
- ✅ Personal Access Token으로 푸시

해드리겠습니다!

---

### ✅ 5단계: Vercel 재배포 (캐시 없이)

1. **Vercel 대시보드**
   - https://vercel.com/dashboard
   - `transport-info1` 프로젝트

2. **Deployments 탭**

3. **최신 배포 옆 "..." 메뉴 클릭**

4. **"Redeploy" 선택**

5. **⚠️ 중요: "Use existing Build Cache" 체크박스 해제!**
   - 환경변수 변경사항 반영을 위해 필수

6. **"Redeploy" 버튼 클릭**

7. **배포 완료 대기 (2-3분)**

---

### ✅ 6단계: 관리자 계정 생성 (최초 1회만)

#### 6-1. create-initial-admin Edge Function 호출

**방법 1: Supabase SQL Editor에서 실행**
```sql
SELECT
  net.http_post(
    url := 'https://rqtphxshonrktuhhmudh.supabase.co/functions/v1/create-initial-admin',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('request.jwt.claims', true)::json->>'sub'
    ),
    body := jsonb_build_object(
      'username', 'admin',
      'password', 'YourSecurePassword123!',
      'email', 'admin@bustime.site'
    )
  ) AS request_id;
```

**방법 2: curl 명령어 (로컬 터미널)**
```bash
curl -X POST \
  https://rqtphxshonrktuhhmudh.supabase.co/functions/v1/create-initial-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  -d '{
    "username": "admin",
    "password": "YourSecurePassword123!",
    "email": "admin@bustime.site"
  }'
```

#### 6-2. 관리자 계정 정보 안전하게 저장
- Username: `admin`
- Password: `YourSecurePassword123!` (변경하세요!)
- Email: `admin@bustime.site`

---

### ✅ 7단계: 테스트

1. **브라우저 새 시크릿 창**
   - Chrome: `Ctrl+Shift+N` (Windows) / `Cmd+Shift+N` (Mac)

2. **admin.bustime.site 접속**

3. **개발자 도구 열기**
   - F12 또는 우클릭 → "검사"
   - Console 탭 선택

4. **로그인**
   - Username: `admin`
   - Password: [6단계에서 설정한 비밀번호]

5. **"자동화 수동 실행" 버튼 클릭**

6. **결과 확인**
   - ✅ 200 OK
   - ✅ 자동화 실행 결과 표시
   - ❌ 401 에러 없음!

---

## 🎯 예상 결과

### ✅ Vercel Functions 로그 (정상)
```
[automation/run] ========== DEBUG START ==========
[automation/run] SUPABASE_URL: https://rqtphxshonrktuhhmudh.supabase.co
[automation/run] Session found: { id: '...', expires_at: '...' }
[automation/run] Is expired? false
[automation/run] ========== DEBUG END ==========
[/api/automation/run] Admin admin triggered automation
```

---

## 🔍 트러블슈팅

### 문제: SQL Editor에서 "admin_sessions does not exist" 에러
**해결:** Role을 **"postgres"**로 변경

### 문제: Vercel에서 여전히 401 에러
**확인:**
1. Vercel 환경변수 3개가 정확히 설정되었는지
2. 환경변수마다 Production, Preview, Development 모두 체크했는지
3. "Use existing Build Cache" 체크 해제하고 재배포했는지

### 문제: 로그인 후 세션이 저장되지 않음
**확인:**
1. admin-login Edge Function이 배포되었는지
2. Supabase URL이 올바른지
3. service_role 키가 정확한지

---

## 📞 다음 단계

**지금 알려주세요:**
1. ✅ GitHub 저장소 URL (예: `username/transport-info1`)
   → Personal Access Token으로 자동 푸시해드립니다!

2. ✅ 1단계 완료 여부 (API 키 복사 완료?)
   → 2단계(Vercel 환경변수) 진행 가능

---

**먼저 Supabase 화면에서 anon 키와 service_role 키를 복사해주세요!**
