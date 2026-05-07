'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function EditProfilePage() {
  const { user, isLoading: authLoading, refresh } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    setUsername(user.username);
    setBio(user.bio || '');
    setAvatar(user.avatar || '');
  }, [user, authLoading, router]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('图片大小不能超过 2MB'); return; }
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
        setAvatar(data.data.url);
        toast.success('头像上传成功');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || username.length < 2) { toast.error('用户名至少 2 个字符'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          bio: bio.trim(),
          avatar: avatar || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await refresh();
        toast.success('已保存');
        router.push('/profile');
      } else {
        toast.error(data.error || '保存失败');
      }
    } catch {
      toast.error('保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return <div className="text-center py-20 text-gray-400">加载中...</div>;
  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">编辑个人资料</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 头像 */}
        <div>
          <label className="block text-sm font-medium mb-2">头像</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
              {avatar ? (
                <img src={avatar} alt="头像" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-2xl">{user.username[0]}</span>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                {uploading ? '上传中...' : '更换头像'}
              </button>
            </div>
          </div>
        </div>

        {/* 用户名 */}
        <div>
          <label className="block text-sm font-medium mb-1">用户名</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            maxLength={30}
            required
          />
        </div>

        {/* 个人简介 */}
        <div>
          <label className="block text-sm font-medium mb-1">个人简介</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-24"
            placeholder="介绍一下自己..."
            maxLength={200}
          />
          <p className="text-xs text-gray-400 mt-1">{bio.length}/200</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
        >
          {submitting ? '保存中...' : '保存修改'}
        </button>
      </form>
    </div>
  );
}
