import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { errorResponse } from '@/lib/apiResponse';
import { sendEmail, buildVerificationEmailHtml } from '@/lib/email';

export async function POST(request: NextRequest) {
  const { username, email, password } = await request.json();

  if (!username || username.length < 2) return errorResponse('用户名至少 2 个字符');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return errorResponse('请输入有效的邮箱');
  if (!password || password.length < 8) return errorResponse('密码至少 8 个字符');
  if (!/[a-z]/.test(password)) return errorResponse('密码必须包含小写字母');
  if (!/[A-Z]/.test(password)) return errorResponse('密码必须包含大写字母');
  if (!/[0-9]/.test(password)) return errorResponse('密码必须包含数字');

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existingUser) {
    if (existingUser.email === email) return errorResponse('该邮箱已被注册');
    return errorResponse('该用户名已被使用');
  }

  const passwordHash = await hashPassword(password);
  const emailVerificationToken = randomUUID();

  const user = await prisma.user.create({
    data: { username, email, passwordHash, emailVerificationToken },
    select: { id: true, username: true, email: true, avatar: true, bio: true, createdAt: true },
  });

  // 异步发送验证邮件，不阻塞注册流程
  sendEmail({
    to: email,
    subject: '验证您的邮箱 - 诈骗案例曝光平台',
    html: buildVerificationEmailHtml(emailVerificationToken),
  }).catch(err => console.error('发送验证邮件失败:', err));

  const token = signToken({ userId: user.id, username: user.username });

  const response = NextResponse.json({ success: true, data: user });
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return response;
}
