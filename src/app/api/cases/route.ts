import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getCurrentUser } from '@/lib/getCurrentUser';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const categorySlug = searchParams.get('categorySlug');
  const search = searchParams.get('search');
  const userId = searchParams.get('userId');
  const sortBy = searchParams.get('sortBy');

  const where: Prisma.CaseWhereInput = {};
  if (categorySlug) where.category = { slug: categorySlug };
  if (search) where.title = { contains: search };
  if (userId) where.userId = parseInt(userId);

  const orderBy: Prisma.CaseOrderByWithRelationInput =
    sortBy === 'popular' ? { viewCount: 'desc' } : { createdAt: 'desc' };

  const [cases, total] = await Promise.all([
    prisma.case.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        author: { select: { id: true, username: true } },
        category: { select: { id: true, name: true, slug: true } },
        images: { select: { url: true }, take: 1 },
        _count: { select: { comments: true } },
      },
    }),
    prisma.case.count({ where }),
  ]);

  return successResponse(cases, {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('请先登录', 401);
  if (!user.emailVerified) return errorResponse('请先验证邮箱后再发布案例', 403);

  const { title, content, categoryId, imageIds } = await request.json();

  if (!title || title.length < 5) return errorResponse('标题至少 5 个字符');
  if (!content || content.length < 20) return errorResponse('内容至少 20 个字符');
  if (!categoryId) return errorResponse('请选择分类');

  const caseItem = await prisma.case.create({
    data: {
      title,
      content,
      categoryId: parseInt(categoryId),
      userId: user.id,
    },
  });

  // 关联已上传的图片
  if (imageIds?.length) {
    await prisma.caseImage.updateMany({
      where: { id: { in: imageIds.map((i: string | number) => parseInt(i.toString())) } },
      data: { caseId: caseItem.id },
    });
  }

  const result = await prisma.case.findUnique({
    where: { id: caseItem.id },
    include: {
      category: true,
      images: true,
      author: { select: { id: true, username: true } },
    },
  });

  return successResponse(result);
}
