import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET 环境变量未设置');
  return secret;
}

const JWT_EXPIRES_IN = '7d';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: number; username: string }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { userId: number; username: string } | null {
  try {
    return jwt.verify(token, getJwtSecret()) as { userId: number; username: string };
  } catch {
    return null;
  }
}
