import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: '诈骗案例分享平台',
  description: '分享你遇到的诈骗案例，帮助更多人远离骗局',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <AuthProvider>
          {children}
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
