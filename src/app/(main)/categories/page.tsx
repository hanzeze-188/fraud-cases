'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Category } from '@/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => {
        if (data.success) setCategories(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">案例分类</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(cat => (
          <Link key={cat.id} href={`/categories/${cat.slug}`} className="bg-white rounded-lg p-6 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold mb-2">{cat.name}</h2>
            {cat.description && <p className="text-sm text-gray-500 mb-3">{cat.description}</p>}
            <span className="text-xs text-gray-400">{cat._count?.cases || 0} 个案例</span>
          </Link>
        ))}
      </div>
      {categories.length === 0 && (
        <div className="text-center py-20 text-gray-400">暂无分类</div>
      )}
    </div>
  );
}
