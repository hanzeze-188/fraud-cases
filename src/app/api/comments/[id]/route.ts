import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getCurrentUser } from '@/lib/getCurrentUser';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('请先登录', 401);

  const { id } = await params;
  const commentId = parseInt(id);
  if (isNaN(commentId)) return errorResponse('无效的评论 ID', 400);

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return errorResponse('评论不存在', 404);
  if (comment.userId !== user.id) return errorResponse('无权删除此评论', 403);

  // 删除评论及其所有回复
  await prisma.comment.deleteMany({
    where: { OR: [{ id: commentId }, { parentId: commentId }] },
  });

  return successResponse({ message: '已删除' });
}
