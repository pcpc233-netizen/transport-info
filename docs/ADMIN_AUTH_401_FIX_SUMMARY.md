# 관리자 인증 401 에러 수정 요약

## 수정 완료된 내용

### 1️⃣ `/api/automation/run.ts` - 디버그 로그 추가

**위치:** verifyAdminSession 호출 직전

**추가된 로그:**
```typescript
console.log('[automation/run] ========== DEBUG START ==========');
console.log('[automation/run] Incoming token:', sessionToken);
console.log('[automation/run] SUPABASE_URL (server):', process.env.SUPABASE_URL);
console.log('[automation/run] Service role key prefix:', prefix);

// DB 직접 조회
const { data: debugSession, error: debugError } = await debugClient
  .from('admin_sessions')
  .select('id, admin_id, session_token, expires_at, created_at')
  .eq('session_token', sessionToken)
  .maybeSingle();

console.log('[automation/run] Debug select error:', debugError);
console.log('[automation/run] Debug select result:', debugSession);
console.log('[automation/run] ========== DEBUG END ==========');
```

**목적:**
- 어떤 Supabase URL을 사용하는지 확인
- service_role 키가 올바른지 확인
- admin_sessions 테이블에 세션이 실제로 존재하는지 확인
- RLS 정책으로 인한 접근 차단이 있는지 확인

---

### 2️⃣ `supabase/functions/admin-login/index.ts` - 환경변수 명시

**수정 전:**
```typescript
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);
```

**수정 후:**
```typescript
// 서버 전용 환경변수만 사용 (VITE_ 접두사 절대 금지)
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});
```

**추가 개선:**
- 세션 저장 시 에러 처리 추가
- admin_sessions 테이블 컬럼명 주석 추가
- 세션 insert 실패 시 500 에러 반환

---

### 3️⃣ `/docs/ADMIN_AUTH_RLS_FIX.sql` - RLS 정책 초기화 스크립트

**내용:**
- admin_sessions, admin_users, admin_activity_logs의 모든 기존 정책 삭제
- service_role만 전체 접근 허용하는 단일 정책 생성
- RLS 활성화 유지
- 검증 쿼리 포함

**실행 방법:**
1. Supabase SQL Editor 접속
2. 스크립트 전체 복사 & 붙여넣기
3. "Run" 클릭

---

### 4️⃣ `/docs/ADMIN_AUTH_DEBUG.md` - 디버깅 가이드

**포함된 내용:**
- Vercel 환경변수 확인 체크리스트
- Supabase RLS 정책 초기화 방법
- GitHub 푸시 명령어
- Vercel 재배포 방법 (캐시 없이)
- 테스트 및 로그 확인 방법
- 정상 작동 시 예상 로그
- 비정상 시나리오별 로그 예시
- 추가 확인 사항

---

## 다음 단계: 내가 직접 해야 할 작업

### ✅ 체크리스트

- [ ] **1. Vercel 환경변수 확인**
  - `SUPABASE_URL` = `https://rqtphxshonrktuhhmudh.supabase.co`
  - `SUPABASE_SERVICE_ROLE_KEY` = Supabase 대시보드의 service_role 키
  - `SUPABASE_ANON_KEY` = Supabase 대시보드의 anon 키
  - 모든 환경변수가 Production, Preview, Development에 체크되어 있는지 확인

- [ ] **2. Supabase RLS 정책 초기화**
  - Supabase SQL Editor 접속
  - `/docs/ADMIN_AUTH_RLS_FIX.sql` 내용 복사
  - SQL Editor에 붙여넣기
  - "Run" 클릭
  - 결과 확인 (3개 정책만 남아있어야 함)

- [ ] **3. GitHub에 코드 푸시**
  ```bash
  git add .
  git commit -m "Fix: 관리자 인증 401 에러 디버깅 로그 추가"
  git push origin main
  ```

- [ ] **4. Vercel 재배포 (캐시 없이)**
  - Vercel 대시보드 → transport-info1 → Deployments
  - 최신 배포 → "..." → Redeploy
  - **"Use existing Build Cache" 체크 해제** (매우 중요!)
  - "Redeploy" 클릭
  - 배포 완료까지 대기 (2-3분)

- [ ] **5. 테스트**
  - 브라우저 새 시크릿 창 열기
  - admin.bustime.site 접속
  - 로그인
  - 개발자 도구 Console 열기
  - "자동화 수동 실행" 버튼 클릭
  - Vercel Functions 로그 확인

---

## 예상 결과

### ✅ 정상 작동 시

**Vercel Functions 로그:**
```
[automation/run] ========== DEBUG START ==========
[automation/run] Incoming token: 47cc84b9-7000-4512-8f7f-5d5ca1acb9aa
[automation/run] SUPABASE_URL (server): https://rqtphxshonrktuhhmudh.supabase.co
[automation/run] Service role key prefix: eyJhbGciOiJIUzI1NiI...
[automation/run] Debug select error: null
[automation/run] Debug select result: { "id": "...", "session_token": "...", ... }
[automation/run] Token match: ✓
[automation/run] Is expired? false
[automation/run] ========== DEBUG END ==========
[/api/automation/run] Admin {username} triggered automation
```

**브라우저:**
- 200 OK 응답
- 자동화 결과 표시

---

### ❌ 문제가 있는 경우

#### 시나리오 1: 환경변수 누락
```
[automation/run] SUPABASE_URL (server): undefined
```
→ **해결:** Vercel 환경변수 설정 확인 및 재배포

#### 시나리오 2: 잘못된 Supabase URL
```
[automation/run] Debug select result: null
[automation/run] Token match: ✗ (no session found)
```
→ **해결:** Vercel의 SUPABASE_URL을 `https://rqtphxshonrktuhhmudh.supabase.co`로 수정

#### 시나리오 3: RLS 정책 차단
```
[automation/run] Debug select error: { code: '42501', message: 'permission denied' }
```
→ **해결:** `/docs/ADMIN_AUTH_RLS_FIX.sql` 실행

---

## 핵심 원칙

### 환경변수 사용 규칙

**서버 측 (Vercel Functions, Edge Functions):**
- ✅ 사용: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- ❌ 금지: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

**클라이언트 측 (브라우저):**
- ✅ 사용: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### 세션 토큰 관리

- **저장 키:** `admin_session_token` (단일 키만 사용)
- **형식:** UUID (변형 없이 그대로 저장/전송)
- **전송:** `Authorization: Bearer {token}` 헤더

### RLS 정책

- **service_role:** 전체 접근 허용 (admin_sessions, admin_users, admin_activity_logs)
- **public/authenticated/anon:** 접근 차단

---

## 참고 문서

- `/docs/ADMIN_AUTH_DEBUG.md` - 상세 디버깅 가이드
- `/docs/ADMIN_AUTH_RLS_FIX.sql` - RLS 정책 초기화 스크립트

---

## 문제 해결이 안 되면

다음 정보를 포함하여 문의:
1. Vercel Functions 로그의 전체 DEBUG 섹션
2. Supabase RLS 정책 검증 쿼리 결과
3. 브라우저 Console의 전체 로그
