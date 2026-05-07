'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { CaseItem } from '@/types';

export default function UserProfilePage() {
  const params = useParams();
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const userId = params.id;
    if (!userId) return;

    fetch(`/api/cases?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setCases(data.data);
        } else {
          setError('加载失败');
        }
      })
      .catch(() => setError('加载失败'))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>;
  if (error) return <div className="text-center py-20 text-gray-400">{error}</div>;

  const username = cases.length > 0 ? cases[0].author.username : '该用户';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg p-6 mb-6">
        <h1 className="text-xl font-bold mb-2">{username}</h1>
        <p className="text-sm text-gray-400">共 {cases.length} 个案例</p>
      </div>

      <h2 className="text-lg font-semibold mb-4">发布的案例</h2>
      {cases.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>该用户还没有发布过案例</p>
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
    </div>
  );
}
