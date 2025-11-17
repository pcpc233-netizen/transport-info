# Edge Functions 수동 배포 체크리스트

## 🎯 목표
`admin-login`과 `admin-verify-session` Edge Functions를 Supabase Dashboard에서 수동 배포

---

## ✅ 단계별 체크리스트

### 1단계: Supabase Dashboard 접속
- [ ] 브라우저에서 https://supabase.com/dashboard/project/rqtphxshonrktuhhmudh/functions 접속
- [ ] Supabase 계정으로 로그인되어 있는지 확인

### 2단계: Edge Functions 페이지 확인
- [ ] 왼쪽 메뉴에서 "Edge Functions" 클릭
- [ ] 현재 배포된 함수 목록 확인
- [ ] `admin-login` 함수가 목록에 있는지 확인
- [ ] `admin-verify-session` 함수가 목록에 있는지 확인

### 3단계: admin-login 함수 배포

#### 3-1. 함수가 목록에 있는 경우:
- [ ] `admin-login` 함수 클릭
- [ ] 우측 상단의 "Deploy" 또는 "Redeploy" 버튼 클릭
- [ ] 배포 완료 대기 (보통 10-30초)
- [ ] Status가 "Active" 또는 "Deployed"로 변경되는지 확인

#### 3-2. 함수가 목록에 없는 경우:
- [ ] "Create a new function" 또는 "+ New Function" 버튼 클릭
- [ ] Function name: `admin-login` 입력
- [ ] 아래 코드를 복사해서 붙여넣기:

```typescript
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'bustime-salt-2025');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { username, password, ipAddress, userAgent } = await req.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ success: false, error: '아이디와 비밀번호를 입력하세요' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !admin) {
      await supabase.from('admin_activity_logs').insert({
        admin_id: null,
        action: 'LOGIN_FAILED',
        resource_type: 'auth',
        details: { username, reason: 'user_not_found' },
        ip_address: ipAddress,
      });

      return new Response(
        JSON.stringify({ success: false, error: '아이디 또는 비밀번호가 틀렸습니다' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const passwordHash = await hashPassword(password);
    const passwordMatch = passwordHash === admin.password_hash;

    if (!passwordMatch) {
      await supabase.from('admin_activity_logs').insert({
        admin_id: admin.id,
        action: 'LOGIN_FAILED',
        resource_type: 'auth',
        details: { reason: 'wrong_password' },
        ip_address: ipAddress,
      });

      return new Response(
        JSON.stringify({ success: false, error: '아이디 또는 비밀번호가 틀렸습니다' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { error: sessionInsertError } = await supabase.from('admin_sessions').insert({
      admin_id: admin.id,
      session_token: sessionToken,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: expiresAt.toISOString(),
    });

    if (sessionInsertError) {
      console.error('[admin-login] Session insert error:', sessionInsertError);
      return new Response(
        JSON.stringify({ success: false, error: '세션 생성 실패' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    await supabase.from('admin_users').update({
      last_login_at: new Date().toISOString(),
    }).eq('id', admin.id);

    await supabase.from('admin_activity_logs').insert({
      admin_id: admin.id,
      action: 'LOGIN_SUCCESS',
      resource_type: 'auth',
      details: { username },
      ip_address: ipAddress,
    });

    return new Response(
      JSON.stringify({
        success: true,
        sessionToken,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
```

- [ ] "Verify JWT" 옵션을 **OFF** (체크 해제)
- [ ] "Deploy" 버튼 클릭
- [ ] 배포 완료 대기

### 4단계: admin-verify-session 함수 배포

#### 4-1. 함수가 목록에 있는 경우:
- [ ] `admin-verify-session` 함수 클릭
- [ ] 우측 상단의 "Deploy" 또는 "Redeploy" 버튼 클릭
- [ ] 배포 완료 대기
- [ ] Status가 "Active"로 변경되는지 확인

#### 4-2. 함수가 목록에 없는 경우:
- [ ] "Create a new function" 버튼 클릭
- [ ] Function name: `admin-verify-session` 입력
- [ ] 아래 코드를 복사해서 붙여넣기:

```typescript
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { sessionToken } = await req.json();

    if (!sessionToken) {
      return new Response(
        JSON.stringify({ success: false, valid: false }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: session, error } = await supabase
      .from('admin_sessions')
      .select('admin_id, expires_at')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error || !session) {
      return new Response(
        JSON.stringify({ success: true, valid: false }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: admin, error: adminError } = await supabase
      .from('admin_users')
      .select('id, username, email, is_active')
      .eq('id', session.admin_id)
      .eq('is_active', true)
      .maybeSingle();

    if (adminError || !admin) {
      return new Response(
        JSON.stringify({ success: true, valid: false }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        valid: true,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
```

- [ ] "Verify JWT" 옵션을 **OFF** (체크 해제)
- [ ] "Deploy" 버튼 클릭
- [ ] 배포 완료 대기

### 5단계: 배포 확인

#### 5-1. Dashboard에서 확인:
- [ ] Edge Functions 목록으로 돌아가기
- [ ] `admin-login` 함수 Status: "Active" 확인
- [ ] `admin-verify-session` 함수 Status: "Active" 확인
- [ ] 각 함수의 URL 확인:
  - `https://rqtphxshonrktuhhmudh.supabase.co/functions/v1/admin-login`
  - `https://rqtphxshonrktuhhmudh.supabase.co/functions/v1/admin-verify-session`

#### 5-2. 브라우저 Console에서 테스트:
- [ ] https://admin.bustime.site 접속
- [ ] F12 키를 눌러 개발자 도구 열기
- [ ] Console 탭 선택
- [ ] 아래 코드를 붙여넣고 Enter:

```javascript
fetch('https://rqtphxshonrktuhhmudh.supabase.co/functions/v1/admin-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'dhsfkdls!1',
    ipAddress: '127.0.0.1',
    userAgent: 'Test'
  })
})
.then(r => r.json())
.then(console.log)
```

- [ ] 응답이 `{success: true, sessionToken: "...", admin: {...}}` 형태인지 확인

### 6단계: 실제 로그인 테스트
- [ ] https://admin.bustime.site 접속
- [ ] 아이디: `admin` 입력
- [ ] 비밀번호: `dhsfkdls!1` 입력
- [ ] "로그인" 버튼 클릭
- [ ] 관리자 대시보드로 이동되는지 확인

---

## 🔧 문제 해결

### 함수가 배포되지 않는 경우:
1. Supabase 프로젝트가 일시 중지되었는지 확인
2. 프로젝트 billing 상태 확인 (Free tier 제한 초과 여부)
3. Supabase CLI로 재배포 시도

### 404 에러가 계속 발생하는 경우:
1. 함수 이름 철자 확인 (대소문자 구분)
2. Supabase URL이 `rqtphxshonrktuhhmudh`인지 확인
3. 캐시 삭제: Ctrl+Shift+Delete → 캐시 삭제

### 401/403 에러가 발생하는 경우:
1. "Verify JWT" 옵션이 **OFF**인지 확인
2. CORS 헤더가 올바르게 설정되었는지 확인
3. Supabase Service Role Key가 올바른지 확인

---

## 📝 현재 로그인 정보

```
URL: https://admin.bustime.site
아이디: admin
비밀번호: dhsfkdls!1
이메일: pcpc233@gmail.com
```

---

## ✅ 완료 확인

모든 체크박스를 완료했다면:
- [ ] Edge Functions 배포 완료
- [ ] 로그인 테스트 성공
- [ ] 관리자 대시보드 접근 가능

축하합니다! 🎉
