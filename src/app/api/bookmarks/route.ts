import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getCurrentUser } from '@/lib/getCurrentUser';

// 获取用户的收藏列表
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('请先登录', 401);

  const { searchParams } = new URL(request.url);
  const caseId = searchParams.get('caseId');

  // 检查单个案例是否已收藏
  if (caseId) {
    const bookmark = await prisma.bookmark.findUnique({
      where: { userId_caseId: { userId: user.id, caseId: parseInt(caseId) } },
    });
    return successResponse({ bookmarked: !!bookmark });
  }

  // 获取收藏列表
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      case: {
        include: {
          author: { select: { id: true, username: true } },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { comments: true } },
        },
      },
    },
  });

  return successResponse(bookmarks);
}

// 添加收藏（幂等，已收藏则直接返回成功）
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('请先登录', 401);

  const { caseId } = await request.json();
  if (!caseId) return errorResponse('缺少案例 ID');

  const bookmark = await prisma.bookmark.upsert({
    where: { userId_caseId: { userId: user.id, caseId } },
    update: {},
    create: { userId: user.id, caseId },
  });

  return successResponse(bookmark);
}

// 取消收藏
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('请先登录', 401);

  const { searchParams } = new URL(request.url);
  const caseId = searchParams.get('caseId');
  if (!caseId) return errorResponse('缺少案例 ID');

  await prisma.bookmark.deleteMany({
    where: { userId: user.id, caseId: parseInt(caseId) },
  });

  return successResponse({ message: '已取消收藏' });
}
