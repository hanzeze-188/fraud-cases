'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('无效的验证链接');
      return;
    }

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setMessage(data.error || '验证失败');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('网络错误，请重试');
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow p-8 text-center">
        {status === 'verifying' && (
          <div>
            <div className="animate-spin w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">正在验证邮箱...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold mb-2">邮箱验证成功</h1>
            <p className="text-gray-500 mb-6">您现在可以发布案例和参与讨论了</p>
            <Link href="/" className="text-red-600 hover:underline">返回首页</Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold mb-2">验证失败</h1>
            <p className="text-gray-500 mb-6">{message || '验证链接无效或已过期'}</p>
            <Link href="/" className="text-red-600 hover:underline">返回首页</Link>
          </div>
        )}
      </div>
    </div>
  );
}
