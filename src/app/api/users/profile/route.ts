import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getCurrentUser } from '@/lib/getCurrentUser';

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('请先登录', 401);

  const { username, bio, avatar } = await request.json();

  if (username !== undefined) {
    if (!username || username.length < 2) return errorResponse('用户名至少 2 个字符');
    const existing = await prisma.user.findFirst({
      where: { username, id: { not: user.id } },
    });
    if (existing) return errorResponse('该用户名已被使用');
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(username !== undefined && { username }),
      ...(bio !== undefined && { bio }),
      ...(avatar !== undefined && { avatar }),
    },
    select: { id: true, username: true, email: true, avatar: true, bio: true, createdAt: true },
  });

  return successResponse(updated);
}
