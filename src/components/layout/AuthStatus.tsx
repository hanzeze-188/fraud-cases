'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export function AuthStatus() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) return <span className="text-gray-400 text-sm">加载中...</span>;

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/profile" className="text-gray-600 hover:text-gray-900">
          {user.username}
        </Link>
        <button onClick={logout} className="text-gray-400 hover:text-gray-600 text-sm">
          退出
        </button>
      </div>
    );
  }

  return (
    <Link href="/login" className="text-gray-600 hover:text-gray-900">
      登录
    </Link>
  );
}
