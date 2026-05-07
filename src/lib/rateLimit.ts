/**
 * 简单的内存频率限制器
 *
 * 生产环境建议替换为 Redis 或数据库实现（例如 Vercel + Upstash Redis），
 * 内存实现在多实例部署下不共享状态。
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// 定期清理过期条目，防止内存泄露
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 60_000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetAt: now + windowMs };
  }

  entry.count++;
  if (entry.count > maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: maxAttempts - entry.count, resetAt: entry.resetAt };
}
