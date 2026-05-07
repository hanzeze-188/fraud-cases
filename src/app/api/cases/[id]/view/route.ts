import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseId = parseInt(id);
  if (isNaN(caseId)) return errorResponse('无效的案例 ID', 400);

  await prisma.case.update({
    where: { id: caseId },
    data: { viewCount: { increment: 1 } },
  });

  return successResponse({ message: 'ok' });
}
