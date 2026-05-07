import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';
import { errorResponse } from '@/lib/apiResponse';
import { checkRateLimit } from '@/lib/rateLimit';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000; // 5 分钟

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) return errorResponse('请填写邮箱和密码');

  // 频率限制：按 IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  const limitKey = `login:${ip}`;
  const limit = checkRateLimit(limitKey, MAX_ATTEMPTS, WINDOW_MS);

  if (!limit.allowed) {
    const minutes = Math.ceil((limit.resetAt - Date.now()) / 60000);
    return errorResponse(`登录尝试过于频繁，请 ${minutes} 分钟后再试`, 429);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return errorResponse('邮箱或密码错误', 401);

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) return errorResponse('邮箱或密码错误', 401);

  const token = signToken({ userId: user.id, username: user.username });

  const response = NextResponse.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    },
  });
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return response;
}
