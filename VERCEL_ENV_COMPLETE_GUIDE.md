# 🚀 Vercel 환경변수 완전 가이드

## ⚠️ 치명적 문제 해결됨

**문제**: `.env` 파일에 2개의 서로 다른 Supabase 프로젝트가 혼재
- 잘못된 URL: `gibqdecjcdyeyxtknbok.supabase.co`
- **올바른 URL**: `rqtphxshonrktuhhmudh.supabase.co` ✅

**해결**: 모든 파일을 `rqtphxshonrktuhhmudh` 프로젝트로 통일 완료

---

## 📋 Vercel 환경변수 설정 체크리스트

### 1️⃣ Vercel Dashboard 접속

1. https://vercel.com/dashboard 접속
2. `bustime` 프로젝트 선택
3. **Settings** → **Environment Variables** 클릭

---

### 2️⃣ 필수 환경변수 설정

다음 **3개 변수**를 정확히 입력하세요:

#### ✅ VITE_SUPABASE_URL
```
https://rqtphxshonrktuhhmudh.supabase.co
```
- **Environment**: `Production`, `Preview`, `Development` 모두 체크
- **주의**: 끝에 `/` 없음!

#### ✅ VITE_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdHBoeHNob25ya3R1aGhtdWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4MzQwNTQsImV4cCI6MjA0NzQxMDA1NH0.0X-f6k7-lIKj-IArXz6oFZ0-r75IW7d0P7lnkVVk3j0
```
- **Environment**: `Production`, `Preview`, `Development` 모두 체크
- **주의**: 공개 키이므로 안전함 (ANON key)

#### ✅ SUPABASE_SERVICE_ROLE_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdHBoeHNob25ya3R1aGhtdWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE0NTQ5MywiZXhwIjoyMDc3NzIxNDkzfQ.pRzZDp0QWvcmSiBaQLn9KDmRFH5flCDPnJQHK02ZU7c
```
- **Environment**: `Production` 만 체크 (보안상 중요!)
- **경고**: 절대 공개하면 안 되는 키! (SERVICE_ROLE)

---

### 3️⃣ 환경변수 입력 방법

#### 방법 1: 웹 UI 사용 (추천)

1. **Add New** 버튼 클릭
2. **Key**: `VITE_SUPABASE_URL`
3. **Value**: 위의 URL 복사-붙여넣기
4. **Environment**: Production, Preview, Development 모두 선택
5. **Save** 클릭
6. 나머지 2개 변수도 동일하게 추가

#### 방법 2: .env 파일 복사

```bash
# 로컬 .env 파일 내용을 Vercel에 복사
VITE_SUPABASE_URL=https://rqtphxshonrktuhhmudh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**주의**: Vercel UI에서 한 줄씩 수동 입력해야 함

---

### 4️⃣ 잘못된 환경변수 삭제

다음 변수가 있다면 **즉시 삭제**하세요:

❌ `SUPABASE_URL` (VITE_ 없는 버전)
❌ `SUPABASE_ANON_KEY` (VITE_ 없는 버전)
❌ `gibqdecjcdyeyxtknbok` 관련 모든 값

**이유**: 코드가 `VITE_` 버전만 사용하도록 수정됨

---

### 5️⃣ 재배포 (필수!)

환경변수 변경 후 **반드시 재배포** 필요:

#### 방법 1: Vercel Dashboard
1. **Deployments** 탭 클릭
2. 최신 배포 찾기
3. **...** 메뉴 → **Redeploy** 클릭

#### 방법 2: Git Push
```bash
git add .
git commit -m "Fix: Update Supabase project to rqtphxshonrktuhhmudh"
git push origin main
```

---

## ✅ 검증 체크리스트

배포 후 다음을 확인하세요:

### 1. Admin 로그인 테스트
- https://admin.bustime.site 접속
- 아이디: `admin` / 비밀번호: (설정한 비밀번호)
- 로그인 성공 확인

### 2. 브라우저 콘솔 확인
- F12 → Console 탭
- 404 오류 없는지 확인
- `/api/auth/login` 호출 성공 확인

### 3. Network 탭 확인
- F12 → Network 탭
- `admin-login` 호출 시 200 응답 확인
- 응답에 `sessionToken` 있는지 확인

### 4. Supabase 프로젝트 확인
```
https://supabase.com/dashboard/project/rqtphxshonrktuhhmudh
```
- Table Editor → `admin_users` 테이블 확인
- Table Editor → `admin_sessions` 테이블 확인

---

## 🐛 여전히 안 되면?

### 증상 1: 404 에러 (admin-login)
```
Failed to load resource: the server responded with a status of 404 ()
```

**원인**: Edge Function이 다른 프로젝트에 배포됨

**해결**:
```bash
# Edge Functions 재배포 (아래 명령으로 안내 요청)
"admin-login과 admin-verify-session을 다시 배포해줘"
```

### 증상 2: 401 Unauthorized
```
{"success": false, "error": "Invalid credentials"}
```

**원인**: 비밀번호 불일치 또는 admin_users 테이블 없음

**해결**:
```sql
-- Supabase SQL Editor에서 실행
SELECT * FROM admin_users WHERE username = 'admin';
```

### 증상 3: CORS 에러
```
Access to fetch has been blocked by CORS policy
```

**원인**: Vercel API 라우트의 CORS 설정 문제

**해결**: 이미 수정 완료 (ALLOWED_ORIGINS에 admin.bustime.site 추가됨)

---

## 📊 현재 설정 상태

### ✅ 로컬 개발 (.env)
```
VITE_SUPABASE_URL=https://rqtphxshonrktuhhmudh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ✅ 프로덕션 (.env.production)
```
VITE_SUPABASE_URL=https://rqtphxshonrktuhhmudh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ❓ Vercel Dashboard
**지금 확인하고 설정하세요!**

---

## 🎯 다음 단계

1. ✅ 로컬 .env 수정 완료
2. ✅ .env.production 확인 완료
3. ⏳ **Vercel 환경변수 설정** ← 지금 여기!
4. ⏳ GitHub에 푸시
5. ⏳ Vercel 재배포
6. ⏳ 로그인 테스트

---

## 💡 Tip

Vercel 환경변수는 **배포 시점**에 빌드에 포함됩니다.
따라서 환경변수 변경 후 **반드시 재배포**가 필요합니다!

```bash
# 강제 재배포 트리거
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```
