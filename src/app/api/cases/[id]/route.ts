import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getCurrentUser } from '@/lib/getCurrentUser';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseId = parseInt(id);
  if (isNaN(caseId)) return errorResponse('无效的案例 ID', 400);

  const caseItem = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      category: { select: { id: true, name: true, slug: true } },
      images: { select: { id: true, url: true, alt: true } },
      _count: { select: { comments: true } },
    },
  });

  if (!caseItem) return errorResponse('案例不存在', 404);

  return successResponse(caseItem);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('请先登录', 401);

  const { id } = await params;
  const caseId = parseInt(id);
  if (isNaN(caseId)) return errorResponse('无效的案例 ID', 400);

  const existing = await prisma.case.findUnique({ where: { id: caseId } });
  if (!existing) return errorResponse('案例不存在', 404);
  if (existing.userId !== user.id) return errorResponse('无权编辑此案例', 403);

  const { title, content, categoryId, imageIds } = await request.json();
  if (!title || title.length < 5) return errorResponse('标题至少 5 个字符');
  if (!content || content.length < 20) return errorResponse('内容至少 20 个字符');
  if (!categoryId) return errorResponse('请选择分类');

  await prisma.case.update({
    where: { id: caseId },
    data: { title, content, categoryId: parseInt(categoryId) },
  });

  // 更新图片关联：先解除所有旧图片，再关联新图片
  if (imageIds) {
    await prisma.caseImage.updateMany({
      where: { caseId },
      data: { caseId: null },
    });
    if (imageIds.length > 0) {
      await prisma.caseImage.updateMany({
        where: { id: { in: imageIds.map((i: string | number) => parseInt(i.toString())) } },
        data: { caseId },
      });
    }
  }

  const result = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      category: true,
      images: true,
      author: { select: { id: true, username: true } },
    },
  });

  return successResponse(result);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('请先登录', 401);

  const { id } = await params;
  const caseId = parseInt(id);
  if (isNaN(caseId)) return errorResponse('无效的案例 ID', 400);

  const existing = await prisma.case.findUnique({ where: { id: caseId } });
  if (!existing) return errorResponse('案例不存在', 404);
  if (existing.userId !== user.id) return errorResponse('无权删除此案例', 403);

  await prisma.case.delete({ where: { id: caseId } });

  return successResponse({ message: '已删除' });
}
