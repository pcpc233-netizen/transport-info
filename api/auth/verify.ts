/**
 * 관리자 세션 검증 API
 *
 * admin.bustime.site에서만 사용
 * - Authorization 헤더에서 Bearer 토큰 추출
 * - 공통 verifyAdminSession 유틸로 검증
 * - 서버 전용 환경변수만 사용 (VITE_ 금지)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminSession } from '../lib/verifyAdminSession.js';

const ALLOWED_ORIGINS = [
  'https://admin.bustime.site',
  'http://localhost:5173',
  'http://localhost:3000'
];

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
      return res.status(200).json({
        success: true,
        valid: false,
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(200).json({
        success: true,
        valid: false,
      });
    }

    const sessionToken = authHeader.replace('Bearer ', '').trim();

    if (!sessionToken) {
      return res.status(200).json({
        success: true,
        valid: false,
      });
    }

    const session = await verifyAdminSession(sessionToken);

    if (!session) {
      return res.status(200).json({
        success: true,
        valid: false,
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      admin: {
        id: session.adminId,
        username: session.username,
        email: session.email,
      },
    });

  } catch (error: any) {
    console.error('[/api/auth/verify] Error:', error);

    return res.status(200).json({
      success: true,
      valid: false,
    });
  }
}
