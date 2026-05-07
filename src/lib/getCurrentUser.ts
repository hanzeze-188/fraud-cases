import { cookies } from 'next/headers';
import { verifyToken } from './auth';
import { prisma } from './prisma';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, username: true, email: true, avatar: true, bio: true, emailVerified: true, createdAt: true },
  });

  return user;
}
