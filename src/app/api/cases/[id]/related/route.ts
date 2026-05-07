import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseId = parseInt(id);
  if (isNaN(caseId)) return errorResponse('无效的案例 ID', 400);

  const caseItem = await prisma.case.findUnique({ where: { id: caseId }, select: { categoryId: true } });
  if (!caseItem) return errorResponse('案例不存在', 404);

  const related = await prisma.case.findMany({
    where: { categoryId: caseItem.categoryId, id: { not: caseId } },
    orderBy: { createdAt: 'desc' },
    take: 4,
    include: {
      author: { select: { id: true, username: true } },
      category: { select: { id: true, name: true, slug: true } },
      _count: { select: { comments: true } },
    },
  });

  return successResponse(related);
}
