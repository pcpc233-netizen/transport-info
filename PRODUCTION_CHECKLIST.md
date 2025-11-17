# ✅ 상용 서비스 런칭 체크리스트

## 🎯 목표
볼트 테스트 환경에서 실제 상용 서비스로 전환하기

---

## 📅 1단계: Supabase 프로젝트 설정 (30분)

### Supabase 계정 및 프로젝트
- [ ] Supabase 계정 생성 (https://supabase.com)
- [ ] 새 프로젝트 생성
  - [ ] 프로젝트 이름: `bustime-production`
  - [ ] Region: Northeast Asia (Seoul)
  - [ ] 강력한 데이터베이스 비밀번호 생성 및 저장
- [ ] API 키 복사 및 안전하게 보관
  - [ ] Project URL
  - [ ] anon/public key
  - [ ] service_role key ⚠️

### 데이터베이스 마이그레이션
- [ ] Supabase CLI 설치: `npm install -g supabase`
- [ ] Supabase 로그인: `supabase login`
- [ ] 프로젝트 연결: `supabase link --project-ref <YOUR_REF>`
- [ ] 마이그레이션 실행: `supabase db push`
  - [ ] 20개 마이그레이션 파일 모두 성공
  - [ ] 테이블 생성 확인 (Supabase Dashboard > Table Editor)

### Edge Functions 배포
- [ ] admin-login 배포
- [ ] admin-verify-session 배포
- [ ] create-initial-admin 배포
- [ ] auto-content-orchestrator 배포
- [ ] daily-automation 배포
- [ ] 기타 15개 Edge Functions 배포

### 초기 관리자 계정
- [ ] create-initial-admin 함수 실행
  - [ ] username: admin
  - [ ] password: 강력한 비밀번호
  - [ ] email: 실제 이메일 주소
- [ ] 관리자 계정 테스트 로그인

---

## 🔧 2단계: 환경 변수 설정 (10분)

### 로컬 개발 환경
- [ ] `.env` 파일 생성 (`.env.example` 복사)
- [ ] VITE_SUPABASE_URL 입력
- [ ] VITE_SUPABASE_ANON_KEY 입력
- [ ] SUPABASE_SERVICE_ROLE_KEY 입력
- [ ] SEOUL_BUS_API_KEY 입력 (나중에 가능)

### Vercel 프로덕션 환경
- [ ] Vercel 프로젝트에서 Environment Variables 설정
- [ ] VITE_SUPABASE_URL
- [ ] VITE_SUPABASE_ANON_KEY
- [ ] SUPABASE_URL (동일 URL)
- [ ] SUPABASE_ANON_KEY (동일 key)
- [ ] SUPABASE_SERVICE_ROLE_KEY ⚠️
- [ ] SEOUL_BUS_API_KEY

---

## 🚀 3단계: Vercel 배포 (15분)

### 배포 설정
- [ ] Vercel 계정 생성/로그인
- [ ] GitHub 저장소 Import
- [ ] Framework: Vite 자동 감지 확인
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`

### 배포 실행
- [ ] Deploy 버튼 클릭
- [ ] 빌드 성공 확인 (약 3분)
- [ ] 배포 완료 확인

### 배포 확인
- [ ] 메인 도메인 접속 (예: bustime.vercel.app)
- [ ] 관리자 도메인 접속 (예: admin.bustime.vercel.app)
- [ ] 메인 페이지 정상 로딩
- [ ] 카테고리 표시 확인
- [ ] 관리자 로그인 테스트

---

## 🔐 4단계: 보안 점검 (5분)

### 환경 변수 보안
- [ ] `.env` 파일이 `.gitignore`에 포함됨
- [ ] GitHub에 `.env` 파일 커밋되지 않음
- [ ] service_role key가 코드에 노출되지 않음

### 데이터베이스 보안
- [ ] RLS (Row Level Security) 활성화 확인
- [ ] admin_users 테이블 정책 확인
- [ ] admin_sessions 테이블 정책 확인
- [ ] 모든 테이블에 적절한 정책 적용

### 관리자 보안
- [ ] 초기 비밀번호 변경 완료
- [ ] 강력한 비밀번호 사용 (8자 이상, 특수문자 포함)
- [ ] 이메일 주소 실제 사용 가능한 주소로 설정

---

## 📊 5단계: 모니터링 설정 (10분)

### Google Analytics
- [ ] Google Analytics 계정 생성
- [ ] 측정 ID 발급 (G-XXXXXXXXXX)
- [ ] src/components/SEOHead.tsx에 GA 코드 추가
- [ ] 실시간 방문자 추적 확인

### Supabase 모니터링
- [ ] Dashboard > Reports 확인
- [ ] API 사용량 모니터링 설정
- [ ] 데이터베이스 크기 확인
- [ ] Edge Function 실행 횟수 확인

### 알림 설정
- [ ] send-alert-email 함수 테스트
- [ ] 관리자 이메일 주소 설정
- [ ] 오류 발생 시 이메일 수신 확인

---

## 🤖 6단계: 자동화 설정 (15분)

### Supabase Cron Jobs
- [ ] Dashboard > Database > Cron Jobs 접속
- [ ] 매일 새벽 2시 콘텐츠 자동 생성 스케줄 추가
- [ ] 매시간 버스 데이터 수집 스케줄 추가
- [ ] Cron Job 작동 테스트

### 관리자 대시보드 테스트
- [ ] 관리자 로그인
- [ ] 시스템 모니터링 탭 확인
- [ ] 자동화 수동 실행 테스트
- [ ] 실행 로그 확인

---

## 🌐 7단계: 공공 API 연동 (20분)

### 서울 공공데이터 API
- [ ] https://data.seoul.go.kr 회원가입
- [ ] 버스도착정보조회 서비스 신청
- [ ] 버스위치정보조회 서비스 신청
- [ ] 정류소정보조회 서비스 신청
- [ ] API 키 발급 확인
- [ ] 환경 변수에 API 키 추가
- [ ] Vercel 재배포

### API 테스트
- [ ] collect-seoul-buses 함수 실행
- [ ] 버스 데이터 수집 확인
- [ ] 데이터베이스에 데이터 저장 확인
- [ ] 프론트엔드에서 데이터 표시 확인

---

## 🔍 8단계: SEO 설정 (15분)

### Google Search Console
- [ ] https://search.google.com/search-console 접속
- [ ] 속성 추가 (도메인)
- [ ] 소유권 확인
- [ ] 사이트맵 제출: `https://yourdomain.com/sitemap.xml`

### 메타 태그 확인
- [ ] 각 페이지 title 태그 확인
- [ ] description 메타 태그 확인
- [ ] Open Graph 태그 확인
- [ ] Twitter Card 확인

### 사이트맵 생성
- [ ] generate-sitemap Edge Function 실행
- [ ] /sitemap.xml 접속 확인
- [ ] 모든 페이지 포함 확인

---

## 📱 9단계: 도메인 설정 (선택사항, 20분)

### 도메인 구매 (선택사항)
- [ ] 원하는 도메인 구매 (예: bustime.site)
- [ ] 도메인 등록업체에서 DNS 관리 접속

### Vercel 도메인 연결
- [ ] Vercel Dashboard > Settings > Domains
- [ ] 메인 도메인 추가 (예: bustime.site)
- [ ] 관리자 서브도메인 추가 (예: admin.bustime.site)
- [ ] DNS 레코드 설정
  - [ ] A 레코드: @ → 76.76.21.21
  - [ ] CNAME: admin → cname.vercel-dns.com
- [ ] SSL 인증서 자동 발급 확인 (약 5분)
- [ ] 새 도메인으로 접속 테스트

---

## 🎨 10단계: 최종 테스트 (20분)

### 기능 테스트
- [ ] 메인 페이지 로딩
- [ ] 카테고리 표시 및 클릭
- [ ] 검색 기능
- [ ] 상세 페이지 이동
- [ ] 관리자 로그인
- [ ] 관리자 대시보드 모든 탭
- [ ] 자동화 수동 실행

### 성능 테스트
- [ ] Google PageSpeed Insights 테스트
- [ ] 모바일 반응형 확인
- [ ] 로딩 속도 확인 (3초 이내)

### 브라우저 호환성
- [ ] Chrome 테스트
- [ ] Safari 테스트
- [ ] Firefox 테스트
- [ ] 모바일 브라우저 테스트

### 소셜 공유 테스트
- [ ] 카카오톡 링크 공유
- [ ] 페이스북 링크 공유
- [ ] 미리보기 이미지 정상 표시
- [ ] 제목과 설명 정상 표시

---

## 📈 11단계: 초기 콘텐츠 생성 (30분)

### 롱테일 키워드 생성
- [ ] generate-longtail-keywords 함수 실행
- [ ] 100개 키워드 생성 확인
- [ ] 데이터베이스에 저장 확인

### 콘텐츠 발행
- [ ] publish-longtail-content 함수 실행
- [ ] 20개 콘텐츠 자동 생성
- [ ] 프론트엔드에서 새 페이지 접속 확인
- [ ] SEO 메타 태그 확인

### 버스 데이터 수집
- [ ] collect-seoul-buses 실행
- [ ] 100개 버스 데이터 수집
- [ ] 정류소 데이터 수집
- [ ] 실시간 도착 정보 테스트

---

## 💰 12단계: 비용 관리 (5분)

### 무료 플랜 확인
- [ ] Supabase Free Tier 확인
  - [ ] 데이터베이스: 500MB
  - [ ] Edge Functions: 2GB/월
  - [ ] 활성 사용자: 50,000/월
- [ ] Vercel Free Tier 확인
  - [ ] 대역폭: 100GB/월
  - [ ] 빌드: 무제한

### 사용량 모니터링
- [ ] Supabase Dashboard > Usage 확인
- [ ] Vercel Dashboard > Analytics 확인
- [ ] 일일 사용량 추적 설정
- [ ] 알림 임계값 설정 (80%)

---

## 🎉 13단계: 런칭! (완료)

### 최종 확인
- [ ] 모든 기능 정상 작동
- [ ] 보안 점검 완료
- [ ] 모니터링 설정 완료
- [ ] 자동화 작동 확인

### 런칭 발표
- [ ] 지인에게 공유
- [ ] 소셜 미디어 포스팅 (선택사항)
- [ ] 초기 사용자 피드백 수집

### 다음 단계 계획
- [ ] Week 1: 데이터 수집 및 콘텐츠 500개 생성
- [ ] Week 2: Google 검색 노출 시작
- [ ] Week 3: 사용자 피드백 반영
- [ ] Week 4: 추가 기능 개발

---

## 📞 지원 및 문제 해결

### 자주 발생하는 문제

**1. 빌드 실패**
- 환경 변수 확인
- node_modules 삭제 후 재설치
- Vercel 빌드 로그 확인

**2. 데이터베이스 연결 오류**
- Supabase URL 확인
- API 키 정확성 확인
- RLS 정책 확인

**3. Edge Function 오류**
- Supabase Dashboard > Functions > Logs 확인
- service_role key 권한 확인
- 함수 재배포

### 도움말 문서
- PRODUCTION_SETUP.md - 전체 설정 가이드
- VERCEL_DEPLOY_GUIDE.md - Vercel 배포 가이드
- TROUBLESHOOTING.md - 문제 해결 가이드

---

## ✅ 완료 확인

모든 체크박스를 완료했다면 축하합니다! 🎊

**이제 실제 상용 서비스가 시작되었습니다!**

- 안정적인 자체 Supabase 데이터베이스
- 자동 배포 파이프라인
- 보안이 강화된 관리자 시스템
- 자동화된 콘텐츠 생성
- SEO 최적화 완료

**다음 목표:**
- 일일 방문자 100명 달성
- Google 검색 1페이지 노출
- 롱테일 페이지 1,000개 생성
- 월 광고 수익 발생

**성공을 기원합니다! 🚀**
