# 관리자 인증 401 에러 디버깅 가이드

## 문제 상황
admin.bustime.site/admin.html에서 로그인 후 "자동화 수동 실행" 버튼을 클릭하면 `401 Unauthorized` 에러가 발생

---

## 체크리스트: 내가 직접 해야 할 작업

### ✅ 1단계: Vercel 환경변수 확인

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - `transport-info1` 프로젝트 선택

2. **Settings → Environment Variables로 이동**

3. **다음 환경변수가 정확히 설정되어 있는지 확인:**

   | 변수명 | 값 | 확인 사항 |
   |--------|-----|-----------|
   | `SUPABASE_URL` | `https://rqtphxshonrktuhhmudh.supabase.co` | ✅ 정확히 이 URL인지 확인 |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` (service_role 키) | ✅ Supabase 대시보드에서 복사한 키와 일치하는지 확인 |
   | `SUPABASE_ANON_KEY` | `eyJhbG...` (anon 키) | ✅ Supabase 대시보드에서 복사한 키와 일치하는지 확인 |

4. **Supabase 키 확인 방법:**
   - Supabase 대시보드: https://supabase.com/dashboard
   - 프로젝트 선택 (longtail-seo / rqtphxshonrktuhhmudh)
   - Settings → API
   - `Project URL` = SUPABASE_URL
   - `anon public` = SUPABASE_ANON_KEY
   - `service_role` (Show 클릭) = SUPABASE_SERVICE_ROLE_KEY

5. **중요: 모든 환경변수가 Production, Preview, Development 모두에 체크되어 있어야 함**

---

### ✅ 2단계: Supabase RLS 정책 초기화

1. **Supabase SQL 에디터 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택 (longtail-seo / rqtphxshonrktuhhmudh)
   - 왼쪽 메뉴에서 **SQL Editor** 클릭

2. **새 쿼리 생성**
   - "New query" 버튼 클릭

3. **RLS 초기화 스크립트 실행**
   - `/docs/ADMIN_AUTH_RLS_FIX.sql` 파일의 전체 내용 복사
   - SQL 에디터에 붙여넣기
   - **"Run"** 버튼 클릭

4. **결과 확인**
   - 쿼리 실행 후 검증 쿼리 결과가 표시됨
   - 다음 3개 정책만 남아있어야 함:
     ```
     admin_activity_logs | Service role full access to admin_activity_logs
     admin_sessions      | Service role full access to admin_sessions
     admin_users         | Service role full access to admin_users
     ```

---

### ✅ 3단계: GitHub에 코드 푸시

```bash
cd /path/to/transport-info1

# 변경사항 확인
git status

# 모든 변경사항 추가
git add .

# 커밋
git commit -m "Fix: 관리자 인증 401 에러 디버깅 로그 추가 및 RLS 정책 수정"

# GitHub에 푸시
git push origin main
```

---

### ✅ 4단계: Vercel 재배포 (캐시 없이)

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - `transport-info1` 프로젝트 선택

2. **Deployments 탭으로 이동**

3. **최신 배포 옆의 "..." 메뉴 클릭**

4. **"Redeploy" 선택**

5. **중요: "Use existing Build Cache" 체크박스를 반드시 해제!**
   - 이 옵션이 켜져있으면 새 환경변수가 반영되지 않음

6. **"Redeploy" 버튼 클릭**

7. **배포 완료까지 대기 (약 2-3분)**

---

### ✅ 5단계: 테스트 및 로그 확인

1. **브라우저 새 시크릿 창 열기**
   - Chrome: Ctrl+Shift+N (Windows) / Cmd+Shift+N (Mac)
   - 기존 세션 데이터를 무시하기 위함

2. **admin.bustime.site 접속**

3. **관리자 로그인**
   - 아이디: (admin_users 테이블의 username)
   - 비밀번호: (설정한 비밀번호)

4. **개발자 도구 열기**
   - F12 키 또는 우클릭 → "검사"
   - **Console** 탭 선택

5. **"자동화 수동 실행" 버튼 클릭**

6. **Vercel 로그 확인**
   - Vercel 대시보드 → Deployments → 최신 배포 클릭
   - **Functions** 탭 선택
   - `/api/automation/run` 함수의 로그 확인

---

## 정상 작동 시 예상 로그

### Vercel Functions 로그 (`/api/automation/run`)

```
[automation/run] ========== DEBUG START ==========
[automation/run] Incoming token: 47cc84b9-7000-4512-8f7f-5d5ca1acb9aa
[automation/run] SUPABASE_URL (server): https://rqtphxshonrktuhhmudh.supabase.co
[automation/run] Service role key prefix: eyJhbGciOiJIUzI1NiI...
[automation/run] Debug select error: null
[automation/run] Debug select result: {
  "id": "...",
  "admin_id": "...",
  "session_token": "47cc84b9-7000-4512-8f7f-5d5ca1acb9aa",
  "expires_at": "2025-11-18T10:30:00.000Z",
  "created_at": "2025-11-17T10:30:00.000Z"
}
[automation/run] Token match: ✓
[automation/run] Expires at: 2025-11-18T10:30:00.000Z
[automation/run] Current time: 2025-11-17T11:00:00.000Z
[automation/run] Is expired? false
[automation/run] ========== DEBUG END ==========
[/api/automation/run] Verifying session token via utility...
[/api/automation/run] Admin {username} triggered automation
```

### 비정상 시나리오별 로그

#### 시나리오 1: 환경변수 누락
```
[automation/run] SUPABASE_URL (server): undefined
[automation/run] Service role key prefix: undefined...
→ 해결: Vercel 환경변수 설정 확인
```

#### 시나리오 2: 잘못된 Supabase URL
```
[automation/run] SUPABASE_URL (server): https://wrong-project.supabase.co
[automation/run] Debug select result: null
[automation/run] Token match: ✗ (no session found)
→ 해결: Vercel 환경변수의 SUPABASE_URL을 https://rqtphxshonrktuhhmudh.supabase.co로 수정
```

#### 시나리오 3: RLS 정책으로 인한 접근 차단
```
[automation/run] Debug select error: { code: '42501', message: 'permission denied for table admin_sessions' }
[automation/run] Debug select result: null
→ 해결: /docs/ADMIN_AUTH_RLS_FIX.sql 실행
```

#### 시나리오 4: 세션 만료
```
[automation/run] Debug select result: {
  "expires_at": "2025-11-16T10:30:00.000Z",
  ...
}
[automation/run] Is expired? true
→ 해결: 다시 로그인
```

---

## 문제가 계속되면

### 추가 확인 사항

1. **admin_sessions 테이블에 세션이 저장되는지 확인**
   ```sql
   SELECT * FROM admin_sessions
   ORDER BY created_at DESC
   LIMIT 5;
   ```

2. **admin_users 테이블에 관리자 계정이 있는지 확인**
   ```sql
   SELECT id, username, email, is_active
   FROM admin_users
   WHERE is_active = true;
   ```

3. **프론트엔드에서 토큰이 올바르게 저장되는지 확인**
   - 브라우저 개발자 도구 → Application → Session Storage
   - `admin_session_token` 키가 있는지 확인
   - 값이 UUID 형식인지 확인 (예: `47cc84b9-7000-4512-8f7f-5d5ca1acb9aa`)

---

## 핵심 포인트

### ✅ 서버 측 (Vercel Functions, Edge Functions)
- **반드시 사용:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- **절대 사용 금지:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### ✅ 클라이언트 측 (브라우저)
- **반드시 사용:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### ✅ 세션 토큰
- **저장 키:** `admin_session_token` (단일 키)
- **형식:** UUID (예: `47cc84b9-7000-4512-8f7f-5d5ca1acb9aa`)
- **전송:** `Authorization: Bearer {token}` 헤더

### ✅ RLS 정책
- **admin_sessions, admin_users, admin_activity_logs**: service_role만 접근 가능
- **public, authenticated, anon**: 접근 불가

---

## 연락처

문제가 해결되지 않으면 다음 정보를 포함하여 문의:
1. Vercel Functions 로그의 전체 DEBUG START ~ DEBUG END 섹션
2. Supabase SQL Editor에서 실행한 RLS 정책 검증 쿼리 결과
3. 브라우저 개발자 도구 Console의 전체 로그
