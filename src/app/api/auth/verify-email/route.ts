import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  if (!token) return errorResponse('缺少验证令牌');

  const user = await prisma.user.findFirst({
    where: { emailVerificationToken: token, emailVerified: false },
  });

  if (!user) return errorResponse('验证链接无效或已过期', 400);

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerificationToken: null },
  });

  return successResponse({ message: '邮箱验证成功' });
}
