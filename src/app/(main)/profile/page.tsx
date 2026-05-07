'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { CaseItem, BookmarkItem } from '@/types';

export default function MyProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'cases' | 'bookmarks'>('cases');
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingVerification, setSendingVerification] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }

    Promise.all([
      fetch(`/api/cases?userId=${user.id}`).then(r => r.json()),
      fetch('/api/bookmarks').then(r => r.json()),
    ]).then(([casesData, bookmarkData]) => {
      if (casesData.success) setCases(casesData.data);
      if (bookmarkData.success) setBookmarks(bookmarkData.data);
    }).finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || loading) return <div className="text-center py-20 text-gray-400">加载中...</div>;
  if (!user) return null;

  const handleResendVerification = async () => {
    setSendingVerification(true);
    try {
      const res = await fetch('/api/auth/resend-verification', { method: 'POST' });
      const data = await res.json();
      if (data.success) toast.success('验证邮件已发送，请查收');
      else toast.error(data.error || '发送失败');
    } catch {
      toast.error('发送失败');
    } finally {
      setSendingVerification(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold mb-1">{user.username}</h1>
            <p className="text-sm text-gray-400">{user.email}</p>
            {user.bio && <p className="text-sm text-gray-500 mt-2">{user.bio}</p>}
            <p className="text-sm text-gray-400 mt-1">共 {cases.length} 个案例 · {bookmarks.length} 个收藏</p>
          </div>
          <div className="flex items-center gap-3">
            {!user.emailVerified && (
              <button
                onClick={handleResendVerification}
                disabled={sendingVerification}
                className="text-sm text-yellow-600 hover:text-yellow-700 disabled:opacity-50"
              >
                {sendingVerification ? '发送中...' : '未验证，重新发送'}
              </button>
            )}
            <Link href="/profile/edit" className="text-sm text-gray-500 hover:text-gray-700">
              编辑资料
            </Link>
          </div>
        </div>
      </div>
      {!user.emailVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm text-yellow-700">
          邮箱尚未验证。验证后即可发布案例和评论。
          <button
            onClick={handleResendVerification}
            disabled={sendingVerification}
            className="ml-2 text-yellow-800 underline hover:no-underline disabled:opacity-50"
          >
            {sendingVerification ? '发送中...' : '重新发送验证邮件'}
          </button>
        </div>
      )}

      {/* Tab 切换 */}
      <div className="flex gap-4 mb-6 text-sm border-b border-gray-200 pb-3">
        <button
          onClick={() => setTab('cases')}
          className={`${tab === 'cases' ? 'text-red-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
        >
          我的案例
        </button>
        <button
          onClick={() => setTab('bookmarks')}
          className={`${tab === 'bookmarks' ? 'text-red-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
        >
          我的收藏
        </button>
      </div>

      {tab === 'cases' ? (
        <>
          {cases.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>还没有发布过案例</p>
              <Link href="/cases/new" className="text-red-600 hover:underline mt-2 inline-block">发布第一个案例</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cases.map(caseItem => (
                <Link key={caseItem.id} href={`/cases/${caseItem.id}`} className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded">{caseItem.category.name}</span>
                  </div>
                  <h3 className="font-medium">{caseItem.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{caseItem._count.comments} 条评论</span>
                    <span>{caseItem.viewCount} 次浏览</span>
                    <span>{new Date(caseItem.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {bookmarks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>还没有收藏过案例</p>
              <Link href="/" className="text-red-600 hover:underline mt-2 inline-block">去首页看看</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarks.map(bm => (
                <Link key={bm.id} href={`/cases/${bm.caseId}`} className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded">{bm.case.category.name}</span>
                  </div>
                  <h3 className="font-medium">{bm.case.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{bm.case.author.username}</span>
                    <span>{bm.case._count.comments} 条评论</span>
                    <span>{bm.case.viewCount} 次浏览</span>
                    <span>收藏于 {new Date(bm.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
