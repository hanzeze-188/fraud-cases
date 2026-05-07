import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { getStorage } from '@/lib/storage';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('请先登录', 401);

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) return errorResponse('请选择文件');
  if (!ALLOWED_TYPES.includes(file.type)) return errorResponse('仅支持 jpg/png/gif/webp 格式');
  if (file.size > MAX_SIZE) return errorResponse('文件大小不能超过 5MB');

  const storage = getStorage();
  const stored = await storage.save(file, 'images');

  const image = await prisma.caseImage.create({
    data: { url: stored.url },
  });

  return successResponse({ id: image.id, url: image.url });
}
