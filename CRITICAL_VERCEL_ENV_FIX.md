# 🚨 긴급: Vercel 환경변수 설정 필요

## 문제 원인

**API가 배포되었지만 환경변수가 설정되지 않아 Supabase에 연결할 수 없습니다.**

`api/automation/run.ts`가 다음 환경변수를 필요로 합니다:
- `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## 즉시 해결 방법

### 1. Vercel Dashboard 접속

https://vercel.com/pcpc233-netizens-projects/transport-info

### 2. Settings → Environment Variables 이동

### 3. 다음 환경변수 추가

**중요: 각 변수를 개별적으로 추가해야 합니다!**

#### 첫 번째 변수
```
Name: VITE_SUPABASE_URL
Value: https://rqtphxshonrktuhhmudh.supabase.co
Environment: Production, Preview, Development (모두 체크)
```

#### 두 번째 변수
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpYnFkZWNqY2R5ZXl4dGtuYm9rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc1MzA3OSwiZXhwIjoyMDc4MzI5MDc5fQ.Y3xje6vYDXHqbKAMZqU6Lo6e_BrjOpLZWl9NXOFn_IA
Environment: Production, Preview, Development (모두 체크)
```

#### 세 번째 변수
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpYnFkZWNqY2R5ZXl4dGtuYm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NTMwNzksImV4cCI6MjA3ODMyOTA3OX0.zstQH1P-4pPb2y74LhrH3uSws9I_KkQ55mPRAR0up84
Environment: Production, Preview, Development (모두 체크)
```

### 4. Redeploy (재배포 트리거)

환경변수를 추가한 후 **반드시 재배포**해야 합니다:

**방법 1: Vercel Dashboard에서**
1. Deployments 탭 이동
2. 최신 배포 클릭
3. 우측 상단 "..." 메뉴 → "Redeploy" 클릭
4. "Redeploy" 버튼 클릭 확인

**방법 2: GitHub에서 (더 쉬움)**
```bash
# 빈 커밋 푸시로 재배포 트리거
git commit --allow-empty -m "trigger redeploy with env vars"
git push origin main
```

## 예상 시간

- 환경변수 추가: 2분
- 재배포: 2-3분
- **총 소요 시간: 약 5분**

## 테스트 방법

재배포 완료 후:

1. https://admin.bustime.site 접속
2. 로그인 (admin / bustime2025)
3. 시스템 탭 → 수동 실행
4. ✅ 성공 메시지 확인!

## 왜 이 문제가 발생했나?

- `.env.production` 파일은 로컬에만 존재
- Vercel은 자체 환경변수 시스템 사용
- GitHub 푸시 시 `.env` 파일은 업로드되지 않음 (보안상 올바름)
- **Vercel Dashboard에서 수동으로 설정해야 함**

## 스크린샷 가이드

### Vercel Settings → Environment Variables

```
┌─────────────────────────────────────────────────────┐
│ Environment Variables                                │
├─────────────────────────────────────────────────────┤
│                                                       │
│ [Add New] 버튼 클릭                                  │
│                                                       │
│ Name: VITE_SUPABASE_URL                              │
│ Value: https://rqtphxshonrktuhhmudh.supabase.co     │
│ ☑ Production  ☑ Preview  ☑ Development              │
│                                                       │
│ [Save] 클릭                                          │
│                                                       │
└─────────────────────────────────────────────────────┘
```

## 확인 방법

환경변수가 제대로 설정되었는지 확인:

```bash
# API 테스트
curl -X POST 'https://admin.bustime.site/api/automation/run' \
  -H 'Authorization: Bearer 0887e4b7-c144-4c88-81c3-8606e3bc4c8f'

# 성공 시: {...result...}
# 실패 시: {"error":"Unauthorized: Invalid or expired session"}
```

---

**⚠️ 이 작업을 완료하기 전에는 API가 작동하지 않습니다!**
