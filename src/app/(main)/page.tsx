'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { CaseItem, Category } from '@/types';

export default function HomePage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 只加载一次分类
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => { if (data.success) setCategories(data.data); });
  }, []);

  // 分类/搜索/排序/页码变化时请求案例
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('categorySlug', selectedCategory);
    if (search) params.set('search', search);
    if (sortBy === 'popular') params.set('sortBy', 'popular');
    params.set('page', String(page));

    if (page === 1) setLoading(true);

    fetch(`/api/cases?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setCases(prev => page === 1 ? data.data : [...prev, ...data.data]);
          setHasMore(page < (data.pagination?.totalPages || 1));
        }
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }, [selectedCategory, search, sortBy, page]);

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(slug);
    setSearch('');
    setSearchInput('');
    setPage(1);
    setCases([]);
  };

  const handleSortChange = (sort: string) => {
    if (sort === sortBy) return;
    setSortBy(sort);
    setPage(1);
    setCases([]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
    setCases([]);
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    setPage(p => p + 1);
  };

  return (
    <div>
      {/* Hero 区域 */}
      <div className="text-center py-12 mb-8">
        <h1 className="text-3xl font-bold mb-3">诈骗案例曝光平台</h1>
        <p className="text-gray-500">分享你遇到的诈骗案例，帮助更多人识别骗局</p>
      </div>

      {/* 搜索框 */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="搜索案例标题..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
          >
            搜索
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setSearchInput(''); setPage(1); setCases([]); }}
              className="px-4 py-2 text-gray-400 hover:text-gray-600"
            >
              清除
            </button>
          )}
        </div>
      </form>

      {/* 分类筛选 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => handleCategoryClick('')}
          className={`px-3 py-1.5 rounded-full text-sm ${!selectedCategory ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          全部
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.slug)}
            className={`px-3 py-1.5 rounded-full text-sm ${selectedCategory === cat.slug ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 排序切换 */}
      <div className="flex gap-4 mb-6 text-sm border-b border-gray-200 pb-3">
        <button
          onClick={() => handleSortChange('latest')}
          className={`${sortBy === 'latest' ? 'text-red-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
        >
          最新
        </button>
        <button
          onClick={() => handleSortChange('popular')}
          className={`${sortBy === 'popular' ? 'text-red-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
        >
          最热
        </button>
      </div>

      {/* 搜索/筛选提示 */}
      {(search || selectedCategory) && !loading && (
        <p className="text-sm text-gray-400 mb-4">
          {search && <>搜索 &ldquo;{search}&rdquo;</>}
          {search && selectedCategory && <> · </>}
          {selectedCategory && <>分类：{categories.find(c => c.slug === selectedCategory)?.name}</>}
          {cases.length > 0 && <> — 共 {cases.length} 条结果</>}
        </p>
      )}

      {/* 案例列表 */}
      {loading && cases.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">
            {search ? '没有找到匹配的案例' : selectedCategory ? '该分类暂无案例' : '还没有案例'}
          </p>
          {!search && (
            <p className="mt-2">成为第一个分享者，帮助更多人识别骗局</p>
          )}
        </div>
      ) : (
        <div>
          <div className="space-y-4">
            {cases.map(caseItem => (
              <Link key={caseItem.id} href={`/cases/${caseItem.id}`} className="block bg-white rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded">
                    {caseItem.category.name}
                  </span>
                </div>
                <h2 className="text-lg font-semibold mb-2">{caseItem.title}</h2>
                <p className="text-gray-500 text-sm line-clamp-2">{caseItem.content}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  <span>{caseItem.author.username}</span>
                  <span>{new Date(caseItem.createdAt).toLocaleDateString('zh-CN')}</span>
                  <span>{caseItem._count.comments} 条评论</span>
                  <span>{caseItem.viewCount} 次浏览</span>
                </div>
              </Link>
            ))}
          </div>

          {/* 加载更多 */}
          {hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                {loadingMore ? '加载中...' : '加载更多'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
