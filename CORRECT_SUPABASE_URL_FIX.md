# 올바른 Supabase URL 적용 완료

## 발견된 문제

모든 문서와 코드에서 **잘못된 Supabase 프로젝트 URL**을 사용하고 있었습니다:

- ❌ 잘못된 URL: `https://gibqdecjcdyeyxtknbok.supabase.co`
- ✅ 올바른 URL: `https://rqtphxshonrktuhhmudh.supabase.co`

이것이 401 에러의 근본 원인이었습니다!

---

## 수정된 파일 목록

### 코드 파일
1. `.env` - VITE_SUPABASE_URL 수정
2. `.env.production` - VITE_SUPABASE_URL 수정
3. `src/lib/supabase.ts` - fallback URL 수정

### 문서 파일
1. `docs/ADMIN_AUTH_DEBUG.md`
2. `docs/ADMIN_AUTH_401_FIX_SUMMARY.md`
3. `AUTOMATION_GUIDE.md`
4. `CRITICAL_VERCEL_ENV_FIX.md`
5. `VERCEL_ENV_FIX.md`
6. `PRODUCTION_AUTOMATION_GUIDE.md`
7. `TROUBLESHOOTING.md`

### 테스트 파일
1. `test-bus-collection.html`
2. `test-seoul-buses.html`
3. `src/components/BusCollectionTest.tsx`
4. `vite.config.ts`

---

## 즉시 해야 할 조치

### ✅ 1단계: Supabase에서 API 키 복사

현재 화면 (Settings → API Keys)에서:

1. **Project URL 확인**
   - ✅ `https://rqtphxshonrktuhhmudh.supabase.co` (확인 완료)

2. **anon 키 복사**
   - 화면에 보이는 긴 키 전체 복사
   - 형식: `eyJhbGciOi...`
   - 메모장에 임시 저장

3. **service_role 키 복사**
   - **"Reveal" 버튼 클릭** (필수!)
   - `**** **** **** ****`가 실제 키로 표시됨
   - 전체 복사
   - 메모장에 임시 저장

---

### ✅ 2단계: 로컬 `.env` 파일 업데이트

```bash
# 프로젝트 디렉토리로 이동
cd /path/to/transport-info1

# .env 파일 수정
nano .env
```

**다음 내용으로 교체:**
```env
VITE_SUPABASE_URL=https://rqtphxshonrktuhhmudh.supabase.co
VITE_SUPABASE_ANON_KEY=[복사한 anon 키]
SUPABASE_SERVICE_ROLE_KEY=[복사한 service_role 키]

# 공공 API 키
SEOUL_BUS_API_KEY=YOUR_API_KEY_HERE
```

저장: `Ctrl+O` → `Enter` → `Ctrl+X`

---

### ✅ 3단계: Vercel 환경변수 업데이트

1. **Vercel 대시보드 열기**
   - https://vercel.com/dashboard
   - `transport-info1` 프로젝트 선택

2. **Settings → Environment Variables**

3. **3개 환경변수 수정 또는 추가**

#### SUPABASE_URL
- Name: `SUPABASE_URL`
- Value: `https://rqtphxshonrktuhhmudh.supabase.co`
- ✅ Production
- ✅ Preview
- ✅ Development

#### SUPABASE_ANON_KEY
- Name: `SUPABASE_ANON_KEY`
- Value: [Supabase에서 복사한 anon 키]
- ✅ Production
- ✅ Preview
- ✅ Development

#### SUPABASE_SERVICE_ROLE_KEY
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: [Supabase에서 복사한 service_role 키]
- ✅ Production
- ✅ Preview
- ✅ Development

**중요: 각 환경변수는 반드시 3개 환경 모두 체크!**

---

### ✅ 4단계: Supabase RLS 정책 초기화

1. **Supabase SQL Editor 접속**
   - https://supabase.com/dashboard
   - 프로젝트: longtail-seo (rqtphxshonrktuhhmudh)
   - 왼쪽 메뉴 → **SQL Editor**

2. **새 쿼리 생성**
   - "New query" 버튼 클릭

3. **RLS 초기화 스크립트 실행**
   - `/docs/ADMIN_AUTH_RLS_FIX.sql` 파일 열기
   - 전체 내용 복사
   - SQL Editor에 붙여넣기
   - **"Run"** 버튼 클릭

4. **결과 확인**
   - 쿼리 실행 후 검증 결과 표시됨
   - 다음 3개 정책만 남아있어야 함:
     ```
     admin_activity_logs | Service role full access to admin_activity_logs
     admin_sessions      | Service role full access to admin_sessions
     admin_users         | Service role full access to admin_users
     ```

---

### ✅ 5단계: GitHub 푸시

```bash
cd /path/to/transport-info1

# 변경사항 확인
git status

# 모든 변경사항 추가
git add .

# 커밋
git commit -m "Fix: 올바른 Supabase URL (rqtphxshonrktuhhmudh) 적용"

# GitHub에 푸시
git push origin main
```

---

### ✅ 6단계: Vercel 재배포 (캐시 없이)

1. **Vercel 대시보드**
   - https://vercel.com/dashboard
   - `transport-info1` 프로젝트

2. **Deployments 탭**

3. **최신 배포 옆 "..." 메뉴 클릭**

4. **"Redeploy" 선택**

5. **중요: "Use existing Build Cache" 체크박스 해제!**
   - 이 옵션이 켜져있으면 환경변수 변경사항이 반영되지 않음

6. **"Redeploy" 버튼 클릭**

7. **배포 완료 대기 (2-3분)**

---

### ✅ 7단계: 테스트

1. **브라우저 새 시크릿 창 열기**
   - Chrome: `Ctrl+Shift+N` (Windows) / `Cmd+Shift+N` (Mac)

2. **admin.bustime.site 접속**

3. **개발자 도구 열기**
   - F12 또는 우클릭 → "검사"
   - Console 탭 선택

4. **관리자 로그인**
   - 아이디/비밀번호 입력

5. **"자동화 수동 실행" 버튼 클릭**

6. **결과 확인**
   - ✅ 200 OK 응답
   - ✅ 자동화 결과 표시
   - ❌ 401 에러 사라짐

---

## 예상 결과

### ✅ 정상 작동 시 Vercel 로그

```
[automation/run] ========== DEBUG START ==========
[automation/run] Incoming token: 47cc84b9-7000-4512-8f7f-5d5ca1acb9aa
[automation/run] SUPABASE_URL (server): https://rqtphxshonrktuhhmudh.supabase.co
[automation/run] Service role key prefix: eyJhbGciOiJIUzI1NiI...
[automation/run] Debug select error: null
[automation/run] Debug select result: {
  "id": "...",
  "session_token": "47cc84b9-7000-4512-8f7f-5d5ca1acb9aa",
  "expires_at": "2025-11-18T10:30:00.000Z",
  ...
}
[automation/run] Token match: ✓
[automation/run] Is expired? false
[automation/run] ========== DEBUG END ==========
[/api/automation/run] Admin admin triggered automation
```

---

## 핵심 포인트

### 환경변수 규칙

**서버 측 (Vercel Functions, Edge Functions):**
- ✅ 사용: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- ❌ 금지: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

**클라이언트 측 (브라우저):**
- ✅ 사용: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### Vercel 환경변수 체크박스

**반드시 3개 모두 체크:**
- ✅ Production
- ✅ Preview
- ✅ Development

**하나라도 빠지면 해당 환경에서 작동하지 않습니다!**

---

## 요약

1. ✅ 올바른 Supabase URL 확인: `https://rqtphxshonrktuhhmudh.supabase.co`
2. ✅ 모든 코드 및 문서 파일 수정 완료
3. ⏳ Supabase에서 API 키 복사 (anon, service_role)
4. ⏳ 로컬 `.env` 파일 업데이트
5. ⏳ Vercel 환경변수 설정
6. ⏳ Supabase RLS 정책 초기화
7. ⏳ GitHub 푸시
8. ⏳ Vercel 재배포 (캐시 없이)
9. ⏳ 테스트

---

**다음: Supabase API Keys 화면에서 anon 키와 service_role 키를 복사해주세요!**
