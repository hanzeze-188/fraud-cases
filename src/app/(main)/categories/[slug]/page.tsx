'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { CaseItem, Category } from '@/types';

export default function CategoryCasesPage() {
  const params = useParams();
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slug = params.slug;
    if (!slug) return;

    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch(`/api/cases?categorySlug=${slug}`).then(r => r.json()),
    ]).then(([catData, casesData]) => {
      if (catData.success) {
        const found = catData.data.find((c: Category) => c.slug === slug);
        setCategory(found || null);
      }
      if (casesData.success) setCases(casesData.data);
    }).finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>;
  if (!category) return <div className="text-center py-20 text-gray-400">分类不存在</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{category.name}</h1>
        {category.description && <p className="text-gray-500">{category.description}</p>}
      </div>

      {cases.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>该分类暂无案例</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map(caseItem => (
            <Link key={caseItem.id} href={`/cases/${caseItem.id}`} className="block bg-white rounded-lg p-6 hover:shadow-md transition-shadow">
              <h2 className="text-lg font-semibold mb-2">{caseItem.title}</h2>
              <p className="text-gray-500 text-sm line-clamp-2">{caseItem.content}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span>{caseItem.author.username}</span>
                <span>{new Date(caseItem.createdAt).toLocaleDateString('zh-CN')}</span>
                <span>{caseItem._count.comments} 条评论</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
