import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { sendEmail, buildVerificationEmailHtml } from '@/lib/email';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('请先登录', 401);

  if (user.emailVerified) return errorResponse('邮箱已验证，无需重复验证');

  const token = randomUUID();
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerificationToken: token },
  });

  sendEmail({
    to: user.email,
    subject: '请验证您的邮箱 - 诈骗案例曝光平台',
    html: buildVerificationEmailHtml(token),
  }).catch(err => console.error('重新发送验证邮件失败:', err));

  return successResponse({ message: '验证邮件已发送' });
}
