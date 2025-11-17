# Edge Functions 수동 배포 가이드

## 1단계: Supabase CLI 설치

### macOS/Linux:
```bash
brew install supabase/tap/supabase
```

### Windows:
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### NPM (모든 OS):
```bash
npm install -g supabase
```

---

## 2단계: Supabase 로그인

```bash
supabase login
```

브라우저가 열리면 로그인하세요.

---

## 3단계: 프로젝트 링크

```bash
cd /tmp/cc-agent/59952428/project
supabase link --project-ref rqtphxshonrktuhhmudh
```

비밀번호를 물어보면 Supabase 프로젝트의 데이터베이스 비밀번호를 입력하세요.

---

## 4단계: Edge Functions 배포

### admin-login 함수 배포:
```bash
supabase functions deploy admin-login
```

### admin-verify-session 함수 배포:
```bash
supabase functions deploy admin-verify-session
```

### 모든 함수 한번에 배포:
```bash
supabase functions deploy
```

---

## 5단계: 배포 확인

```bash
supabase functions list
```

또는 Dashboard에서 확인:
https://supabase.com/dashboard/project/rqtphxshonrktuhhmudh/functions

---

## 🔧 문제 해결

### "Project not found" 오류:
프로젝트 ID를 확인하세요:
```bash
supabase projects list
```

### "Authentication required" 오류:
다시 로그인하세요:
```bash
supabase login
```

### 함수가 여전히 안 보이는 경우:
Dashboard를 새로고침하고 몇 분 기다려보세요. 배포에는 시간이 걸릴 수 있습니다.

---

## 📁 함수 파일 위치

Edge Functions는 다음 위치에 있습니다:
- `/tmp/cc-agent/59952428/project/supabase/functions/admin-login/index.ts`
- `/tmp/cc-agent/59952428/project/supabase/functions/admin-verify-session/index.ts`

---

## 🎯 빠른 명령어 요약

```bash
# CLI 설치 (npm 사용)
npm install -g supabase

# 로그인
supabase login

# 프로젝트 디렉토리로 이동
cd /tmp/cc-agent/59952428/project

# 프로젝트 링크
supabase link --project-ref rqtphxshonrktuhhmudh

# 모든 함수 배포
supabase functions deploy

# 배포 확인
supabase functions list
```

---

## ⚠️ 주의사항

1. **데이터베이스 비밀번호**: `supabase link` 명령 시 필요합니다. Supabase Dashboard > Settings > Database에서 확인할 수 있습니다.

2. **환경 변수**: Edge Functions는 자동으로 다음 환경 변수를 사용합니다:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **배포 시간**: 배포 후 함수가 활성화되는 데 1-2분 정도 걸릴 수 있습니다.
