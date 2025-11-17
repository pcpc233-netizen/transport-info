# 🚀 상용 서비스 배포 가이드

## ⚠️ 중요: 볼트 데이터베이스는 테스트용입니다

현재 프로젝트는 **볼트(Bolt) 제공 Supabase 데이터베이스**를 사용하고 있습니다.
이는 **개발/테스트 전용**이며, **실제 상용 서비스에는 사용할 수 없습니다**.

상용화를 위해서는 **자체 Supabase 프로젝트**를 생성하고 마이그레이션해야 합니다.

---

## 📋 상용화 체크리스트

### 1단계: Supabase 프로젝트 생성 (5분)

1. **Supabase 계정 생성**
   - https://supabase.com 접속
   - 계정 생성 (무료 플랜으로 시작 가능)

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - 프로젝트 이름: `bustime-production` (원하는 이름)
   - 데이터베이스 비밀번호: **강력한 비밀번호 생성 및 안전하게 저장**
   - Region: **Northeast Asia (Seoul)** 선택 (한국 서비스이므로)
   - Pricing Plan: 무료 또는 Pro ($25/월, 권장)

3. **API 키 복사**
   프로젝트 생성 후 Settings > API 메뉴에서 다음 키 복사:
   - `Project URL` (예: https://xxxxx.supabase.co)
   - `anon/public key`
   - `service_role key` ⚠️ **절대 공개하면 안됨!**

---

### 2단계: 데이터베이스 마이그레이션 (10분)

#### 방법 1: Supabase CLI 사용 (권장)

```bash
# 1. Supabase CLI 설치
npm install -g supabase

# 2. Supabase 로그인
supabase login

# 3. 프로젝트 연결
supabase link --project-ref <YOUR_PROJECT_REF>

# 4. 모든 마이그레이션 실행
supabase db push

# 5. Edge Functions 배포
cd supabase/functions
supabase functions deploy admin-login
supabase functions deploy admin-verify-session
supabase functions deploy create-initial-admin
supabase functions deploy auto-content-orchestrator
supabase functions deploy daily-automation
supabase functions deploy fetch-bus-arrivals
supabase functions deploy fetch-bus-location
supabase functions deploy fetch-bus-stops
supabase functions deploy collect-seoul-buses
supabase functions deploy fetch-real-bus-data
supabase functions deploy fetch-public-transport-data
supabase functions deploy fetch-hospital-passport-data
supabase functions deploy generate-longtail-keywords
supabase functions deploy publish-longtail-content
supabase functions deploy generate-sitemap
supabase functions deploy verify-transport-data
supabase functions deploy send-alert-email
supabase functions deploy request-password-recovery
supabase functions deploy reset-password-with-code
```

#### 방법 2: 수동 실행 (CLI 없이)

1. Supabase Dashboard > SQL Editor 접속
2. `supabase/migrations/` 폴더의 모든 `.sql` 파일을 **순서대로** 실행:
   - 파일명 앞의 날짜순으로 실행 (20251110... -> 20251114...)
   - 각 파일 내용을 복사하여 SQL Editor에 붙여넣고 RUN

3. Edge Functions는 Supabase Dashboard > Edge Functions에서 수동 배포

---

### 3단계: 초기 관리자 계정 생성 (2분)

```bash
# Edge Function으로 초기 관리자 생성
curl -X POST \
  https://YOUR_PROJECT_URL.supabase.co/functions/v1/create-initial-admin \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "강력한비밀번호입력",
    "email": "your-email@example.com"
  }'
```

⚠️ **즉시 비밀번호 변경** - 초기 비밀번호는 임시이므로 로그인 후 반드시 변경하세요!

---

### 4단계: 환경 변수 설정

#### 로컬 개발용 (.env)

프로젝트 루트에 `.env` 파일 생성:

```env
# Supabase 설정 (자체 프로젝트)
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# 서울 공공데이터 API 키
SEOUL_BUS_API_KEY=YOUR_SEOUL_API_KEY
```

#### Vercel 프로덕션용

Vercel Dashboard > Settings > Environment Variables에 추가:

| 변수명 | 값 | 환경 |
|--------|-----|------|
| `VITE_SUPABASE_URL` | https://YOUR_PROJECT.supabase.co | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | your_anon_key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | your_service_role_key | Production, Preview, Development |
| `SUPABASE_URL` | https://YOUR_PROJECT.supabase.co | Production, Preview, Development |
| `SUPABASE_ANON_KEY` | your_anon_key | Production, Preview, Development |
| `SEOUL_BUS_API_KEY` | your_seoul_api_key | Production, Preview, Development |

⚠️ **중요**: `SUPABASE_SERVICE_ROLE_KEY`는 절대 노출되면 안됩니다!

---

### 5단계: 서울 공공데이터 API 키 발급 (5분)

1. **서울 열린데이터광장** 접속
   - https://data.seoul.go.kr

2. **회원가입/로그인**

3. **API 신청**
   - 필요한 API:
     - 버스도착정보조회 서비스
     - 버스위치정보조회 서비스
     - 정류소정보조회 서비스

4. **API 키 발급**
   - 신청 후 즉시 발급 (일부는 승인 필요)
   - 발급된 키를 환경 변수에 설정

---

### 6단계: Vercel 배포 (3분)

```bash
# 1. Vercel CLI 설치 (선택사항)
npm install -g vercel

# 2. 배포
vercel --prod

# 또는 GitHub 연동으로 자동 배포 (권장)
# - GitHub에 코드 푸시
# - Vercel에서 GitHub 저장소 연결
# - 자동으로 배포됨
```

#### 도메인 설정

1. **Vercel Dashboard** > 프로젝트 > Settings > Domains
2. 도메인 추가:
   - 메인: `bustime.site`
   - 관리자: `admin.bustime.site`
3. DNS 레코드 설정 (도메인 등록업체에서):
   ```
   A     @     76.76.21.21
   CNAME admin cname.vercel-dns.com
   ```

---

### 7단계: 자동화 설정 (5분)

#### Supabase Cron Jobs 설정

Supabase Dashboard > Database > Cron Jobs:

```sql
-- 매일 새벽 2시 자동 콘텐츠 생성
SELECT cron.schedule(
  'daily-content-automation',
  '0 2 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT.supabase.co/functions/v1/daily-automation',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    );
  $$
);

-- 매시간 버스 데이터 수집
SELECT cron.schedule(
  'hourly-bus-collection',
  '0 * * * *',
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT.supabase.co/functions/v1/collect-seoul-buses',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    );
  $$
);
```

---

## 🔒 보안 체크리스트

- [ ] `.env` 파일을 `.gitignore`에 추가 (이미 추가됨)
- [ ] `SUPABASE_SERVICE_ROLE_KEY`를 절대 GitHub에 커밋하지 않음
- [ ] 초기 관리자 비밀번호 즉시 변경
- [ ] Supabase RLS 정책 활성화 확인
- [ ] API Rate Limiting 설정 고려
- [ ] HTTPS 강제 적용
- [ ] 정기적인 백업 설정

---

## 📊 모니터링 설정

### Google Analytics 추가

`src/components/SEOHead.tsx`에서 GA 코드 활성화:

```typescript
// Google Analytics 추가
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Supabase 모니터링

- Dashboard > Reports에서 실시간 통계 확인
- API 사용량, 데이터베이스 크기, Edge Function 실행 횟수 등

---

## 💰 예상 비용 (월)

### 무료 플랜으로 시작 가능
- Supabase Free: $0/월
  - 500MB 데이터베이스
  - 2GB Edge Function 실행
  - 50,000 월간 활성 사용자

### 성장 시 Pro 플랜 권장
- Supabase Pro: $25/월
  - 8GB 데이터베이스
  - 150GB Edge Function 실행
  - 100,000 월간 활성 사용자

- Vercel Pro: $20/월 (선택사항)
  - 무제한 배포
  - 더 많은 대역폭

**예상 초기 비용**: $0~45/월

---

## 🆘 문제 해결

### 마이그레이션 오류
```bash
# 마이그레이션 상태 확인
supabase migration list

# 특정 마이그레이션 롤백
supabase db reset
```

### Edge Function 배포 오류
- Supabase CLI 최신 버전 확인: `supabase --version`
- 로그 확인: Supabase Dashboard > Edge Functions > Logs

### 환경 변수 오류
- Vercel에서 환경 변수 재배포: Settings > Environment Variables > Redeploy

---

## 📞 지원

문제가 발생하면:
1. Supabase 문서: https://supabase.com/docs
2. Vercel 문서: https://vercel.com/docs
3. 프로젝트 TROUBLESHOOTING.md 참고

---

## ✅ 배포 완료 체크

배포가 완료되면 다음을 확인하세요:

- [ ] https://bustime.site 접속 가능
- [ ] https://admin.bustime.site 접속 가능
- [ ] 관리자 로그인 작동
- [ ] 버스 검색 기능 작동
- [ ] 자동화 수동 실행 테스트
- [ ] 모든 Edge Functions 정상 작동
- [ ] 데이터베이스 RLS 정책 확인
- [ ] SSL 인증서 적용 확인

---

**축하합니다! 🎉 이제 실제 상용 서비스가 시작되었습니다!**
