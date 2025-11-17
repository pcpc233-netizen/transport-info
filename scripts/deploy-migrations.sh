#!/bin/bash

# ===========================================
# Supabase 마이그레이션 수동 배포 스크립트
# ===========================================
#
# 사용법:
#   chmod +x scripts/deploy-migrations.sh
#   ./scripts/deploy-migrations.sh
#

set -e

echo "🚀 Supabase 마이그레이션 배포 시작..."
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Supabase CLI 설치 확인
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI가 설치되어 있지 않습니다.${NC}"
    echo ""
    echo "다음 명령어로 설치하세요:"
    echo "  npm install -g supabase"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓${NC} Supabase CLI 확인됨"

# 로그인 확인
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} Supabase에 로그인이 필요합니다."
    echo ""
    supabase login
fi

echo -e "${GREEN}✓${NC} Supabase 로그인 확인됨"
echo ""

# 프로젝트 연결 확인
if [ ! -f ".supabase/config.toml" ]; then
    echo -e "${YELLOW}⚠${NC} 프로젝트가 연결되지 않았습니다."
    echo ""
    read -p "프로젝트 REF를 입력하세요 (예: abcdefghijklmnop): " PROJECT_REF

    if [ -z "$PROJECT_REF" ]; then
        echo -e "${RED}❌ 프로젝트 REF가 필요합니다.${NC}"
        exit 1
    fi

    supabase link --project-ref "$PROJECT_REF"
fi

echo -e "${GREEN}✓${NC} 프로젝트 연결 확인됨"
echo ""

# 마이그레이션 파일 확인
MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)

if [ "$MIGRATION_COUNT" -eq 0 ]; then
    echo -e "${RED}❌ 마이그레이션 파일을 찾을 수 없습니다.${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} ${MIGRATION_COUNT}개의 마이그레이션 파일 발견됨"
echo ""

# 마이그레이션 실행
echo "📦 마이그레이션 실행 중..."
echo ""

supabase db push

echo ""
echo -e "${GREEN}✅ 마이그레이션 완료!${NC}"
echo ""

# Edge Functions 배포 여부 확인
echo ""
read -p "Edge Functions도 배포하시겠습니까? (y/N): " DEPLOY_FUNCTIONS

if [[ "$DEPLOY_FUNCTIONS" =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔧 Edge Functions 배포 중..."
    echo ""

    FUNCTIONS=(
        "admin-login"
        "admin-verify-session"
        "create-initial-admin"
        "auto-content-orchestrator"
        "daily-automation"
        "fetch-bus-arrivals"
        "fetch-bus-location"
        "fetch-bus-stops"
        "collect-seoul-buses"
        "fetch-real-bus-data"
        "fetch-public-transport-data"
        "fetch-hospital-passport-data"
        "generate-longtail-keywords"
        "publish-longtail-content"
        "generate-sitemap"
        "verify-transport-data"
        "send-alert-email"
        "request-password-recovery"
        "reset-password-with-code"
    )

    for func in "${FUNCTIONS[@]}"; do
        echo "  배포 중: $func"
        supabase functions deploy "$func" --no-verify-jwt
    done

    echo ""
    echo -e "${GREEN}✅ Edge Functions 배포 완료!${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 배포가 완료되었습니다!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "다음 단계:"
echo "  1. 초기 관리자 계정 생성 (아직 안했다면)"
echo "  2. 환경 변수 설정 확인"
echo "  3. Vercel 배포"
echo ""
echo "자세한 내용은 PRODUCTION_SETUP.md를 참고하세요."
echo ""
