/**
 * 관리자 자동화 수동 실행 API
 *
 * admin.bustime.site에서만 호출
 * - Authorization 헤더에서 Bearer 토큰 추출
 * - 공통 verifyAdminSession 유틸로 검증
 * - 서버 전용 환경변수만 사용 (VITE_ 금지)
 * - auto-content-orchestrator Edge Function 실행
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminSession } from '../lib/verifyAdminSession.js';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_ORIGINS = [
  'https://admin.bustime.site',
  'http://localhost:5173',
  'http://localhost:3000'
];

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminEmail = 'pcpc233@gmail.com';

async function sendErrorEmail(error: any, context: any) {
  try {
    const subject = `🚨 [bustime.site] 자동화 실행 실패`;
    const body = `
자동화 실행 중 오류가 발생했습니다.

시간: ${new Date().toLocaleString('ko-KR')}
환경: Production
함수: auto-content-orchestrator

오류 내용:
${error.message || JSON.stringify(error)}

컨텍스트:
${JSON.stringify(context, null, 2)}

스택:
${error.stack || 'N/A'}
    `.trim();

    await fetch(`${supabaseUrl}/functions/v1/send-alert-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: adminEmail,
        subject,
        body,
      }),
    });
  } catch (emailError) {
    console.error('[sendErrorEmail] Failed to send error email:', emailError);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin || '';

  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || typeof authHeader !== 'string') {
      console.log('[/api/automation/run] No authorization header');
      return res.status(401).json({ error: 'Unauthorized: No session token' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.log('[/api/automation/run] Invalid authorization format');
      return res.status(401).json({ error: 'Unauthorized: Invalid token format' });
    }

    const sessionToken = authHeader.replace('Bearer ', '').trim();

    if (!sessionToken) {
      console.log('[/api/automation/run] Empty session token');
      return res.status(401).json({ error: 'Unauthorized: Empty session token' });
    }

    // ============================================
    // 디버그 로깅: 환경변수와 DB 직접 조회 확인
    // ============================================
    console.log('[automation/run] ========== DEBUG START ==========');
    console.log('[automation/run] Incoming token:', sessionToken);
    console.log('[automation/run] SUPABASE_URL (server):', process.env.SUPABASE_URL);
    console.log('[automation/run] Service role key prefix:', (process.env.SUPABASE_SERVICE_ROLE_KEY || '').substring(0, 20) + '...');

    // 디버그용 직접 DB 조회
    const debugSupabaseUrl = process.env.SUPABASE_URL!;
    const debugServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const debugClient = createClient(debugSupabaseUrl, debugServiceKey, {
      auth: { persistSession: false },
    });

    const { data: debugSession, error: debugError } = await debugClient
      .from('admin_sessions')
      .select('id, admin_id, session_token, expires_at, created_at')
      .eq('session_token', sessionToken)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log('[automation/run] Debug select error:', debugError);
    console.log('[automation/run] Debug select result:', JSON.stringify(debugSession, null, 2));

    if (debugSession) {
      console.log('[automation/run] Token match: ✓');
      console.log('[automation/run] Expires at:', debugSession.expires_at);
      console.log('[automation/run] Current time:', new Date().toISOString());
      console.log('[automation/run] Is expired?', new Date(debugSession.expires_at) < new Date());
    } else {
      console.log('[automation/run] Token match: ✗ (no session found)');
    }
    console.log('[automation/run] ========== DEBUG END ==========');
    // ============================================

    console.log('[/api/automation/run] Verifying session token via utility...');
    const session = await verifyAdminSession(sessionToken);

    if (!session) {
      console.log('[/api/automation/run] Session verification failed');
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
    }

    console.log(`[/api/automation/run] Admin ${session.username} triggered automation`);

    const edgeFunctionResponse = await fetch(
      `${supabaseUrl}/functions/v1/auto-content-orchestrator`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          triggeredBy: session.username,
          adminId: session.adminId,
        }),
      }
    );

    if (!edgeFunctionResponse.ok) {
      const errorText = await edgeFunctionResponse.text();
      console.error('[/api/automation/run] Edge Function error:', {
        status: edgeFunctionResponse.status,
        statusText: edgeFunctionResponse.statusText,
        body: errorText
      });

      await sendErrorEmail(
        new Error(`Edge Function returned ${edgeFunctionResponse.status}`),
        { admin: session.username, errorText }
      );

      return res.status(500).json({
        success: false,
        error: `Edge Function error: ${edgeFunctionResponse.status}`,
      });
    }

    const result = await edgeFunctionResponse.json();

    if (!result.success) {
      await sendErrorEmail(
        new Error(result.error || 'Automation failed'),
        { admin: session.username, result }
      );
    }

    if (result.summary?.content_published === 0) {
      await sendErrorEmail(
        new Error('No content published'),
        { admin: session.username, result }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    await supabase
      .from('admin_activity_logs')
      .insert({
        admin_id: session.adminId,
        action: 'TRIGGER_AUTOMATION',
        resource_type: 'automation',
        details: {
          result: result.summary,
          success: result.success,
        },
        ip_address: (req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown') as string,
      });

    return res.status(200).json(result);

  } catch (error: any) {
    console.error('[/api/automation/run] Error:', error);

    await sendErrorEmail(error, {
      endpoint: '/api/automation/run',
      method: req.method,
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
