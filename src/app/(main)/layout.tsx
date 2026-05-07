import Link from 'next/link';
import { AuthStatus } from '@/components/layout/AuthStatus';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-red-600">
            诈骗案例曝光
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/categories" className="text-gray-600 hover:text-gray-900">分类</Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">关于</Link>
            <AuthStatus />
            <Link href="/cases/new" className="bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700">
              发布案例
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        {children}
      </main>
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-400">
        <p>诈骗案例曝光平台 - 分享经历，警示他人</p>
      </footer>
    </div>
  );
}
