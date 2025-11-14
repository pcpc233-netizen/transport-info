# 🚨 긴급 수정 완료 - Unauthorized 오류 해결

## 문제 원인

1. **프론트엔드가 잘못된 엔드포인트 호출**
   - Edge Function을 직접 호출 (SERVICE_ROLE_KEY 필요)
   - ANON_KEY만 사용 가능해서 401 Unauthorized 발생

2. **vercel.json의 rewrites 설정 문제**
   - `/api/*` 경로도 HTML로 리다이렉트됨
   - API 요청이 제대로 처리되지 않음

## 수정 내용

### 1. SystemMonitoring.tsx
```typescript
// 변경 전
fetch(`${SUPABASE_URL}/functions/v1/auto-content-orchestrator`)

// 변경 후
fetch('https://admin.bustime.site/api/automation/run')
```

### 2. AutomationDashboard.tsx
```typescript
// 변경 전
fetch(`${SUPABASE_URL}/functions/v1/auto-content-orchestrator`)

// 변경 후
fetch('https://admin.bustime.site/api/automation/run')
```

### 3. vercel.json
```json
{
  "rewrites": [
    {
      "source": "/((?!api/).*)",  // API 경로 제외
      "destination": "/admin.html",
      "has": [{"type": "host", "value": "admin.bustime.site"}]
    },
    {
      "source": "/((?!api/).*)",  // API 경로 제외
      "destination": "/index.html"
    }
  ]
}
```

## 배포 방법

```bash
# Git에 커밋 및 푸시
git add -A
git commit -m "fix: Fix Unauthorized error - correct API endpoints and vercel routing"
git push origin main
```

## 확인 방법

1. Vercel 배포 완료 대기 (2-3분)
2. https://admin.bustime.site 접속
3. "수동 실행" 버튼 클릭
4. ✅ "팩트 기반 자동화 완료!" 메시지 확인

## 수정된 파일

- src/components/SystemMonitoring.tsx
- src/components/AutomationDashboard.tsx  
- vercel.json

