'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import type { Category } from '@/types';

export default function NewCasePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<{ id: number; url: string; file: File }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/cases/new');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => {
        if (data.success) setCategories(data.data);
      });
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过 5MB');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      toast.error('仅支持 jpg/png/gif/webp 格式');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setImages(prev => [...prev, { id: data.data.id, url: data.data.url, file }]);
        toast.success('上传成功');
      } else {
        toast.error(data.error || '上传失败');
      }
    } catch {
      toast.error('上传失败');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (id: number) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || title.length < 5) { toast.error('标题至少 5 个字符'); return; }
    if (!content || content.length < 20) { toast.error('内容至少 20 个字符'); return; }
    if (!categoryId) { toast.error('请选择分类'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          categoryId: parseInt(categoryId),
          imageIds: images.map(img => img.id),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('发布成功！');
        router.push(`/cases/${data.data.id}`);
      } else {
        toast.error(data.error || '发布失败');
      }
    } catch {
      toast.error('发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return <div className="text-center py-20 text-gray-400">加载中...</div>;
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">发布诈骗案例</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">标题</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="简明扼要地描述诈骗方式"
            maxLength={100}
          />
          <p className="text-xs text-gray-400 mt-1">{title.length}/100</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">分类</label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">请选择分类</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">详细描述</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-40"
            placeholder="请详细描述诈骗经过：时间、地点、诈骗手段、损失情况等"
          />
          <p className="text-xs text-gray-400 mt-1">{content.length} 字</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">相关图片（可选，最多 5 张）</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />
          <div className="flex gap-3 flex-wrap">
            {images.map(img => (
              <div key={img.id} className="relative w-24 h-24">
                <img src={img.url} alt="" className="w-full h-full object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full text-xs"
                >
                  ×
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-gray-400 disabled:opacity-50"
              >
                {uploading ? '上传中...' : '+ 添加'}
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
        >
          {submitting ? '发布中...' : '发布案例'}
        </button>
      </form>
    </div>
  );
}
