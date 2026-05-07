import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getCurrentUser } from '@/lib/getCurrentUser';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseId = parseInt(id);
  if (isNaN(caseId)) return errorResponse('无效的案例 ID', 400);

  const comments = await prisma.comment.findMany({
    where: { caseId },
    orderBy: { createdAt: 'asc' },
    include: {
      author: { select: { id: true, username: true } },
      replies: {
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { id: true, username: true } } },
      },
    },
  });

  // 只返回一级评论（parentId 为 null），replies 已在 include 中
  const topLevel = comments.filter(c => c.parentId === null);
  return successResponse(topLevel);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('请先登录', 401);
  if (!user.emailVerified) return errorResponse('请先验证邮箱后再评论', 403);

  const { id } = await params;
  const caseId = parseInt(id);
  if (isNaN(caseId)) return errorResponse('无效的案例 ID', 400);

  const { content, parentId } = await request.json();
  if (!content || !content.trim()) return errorResponse('评论内容不能为空');

  // 如果是回复，验证父评论是否存在
  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } });
    if (!parent || parent.caseId !== caseId) return errorResponse('要回复的评论不存在');
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      userId: user.id,
      caseId,
      parentId: parentId || null,
    },
    include: {
      author: { select: { id: true, username: true } },
    },
  });

  return successResponse(comment);
}
