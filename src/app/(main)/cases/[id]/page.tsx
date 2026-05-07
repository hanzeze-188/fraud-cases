'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import type { CaseDetail, CommentData, CaseItem } from '@/types';
import { CaseShareButton } from '@/components/cases/CaseShareButton';

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [caseItem, setCaseItem] = useState<CaseDetail | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [relatedCases, setRelatedCases] = useState<CaseItem[]>([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: number; username: string } | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const id = params.id;
    if (!id) return;

    // 增加阅读数
    fetch(`/api/cases/${id}/view`, { method: 'POST' }).catch(() => {});

    Promise.all([
      fetch(`/api/cases/${id}`).then(r => r.json()),
      fetch(`/api/cases/${id}/comments`).then(r => r.json()),
      fetch(`/api/cases/${id}/related`).then(r => r.json()),
      fetch(`/api/bookmarks?caseId=${id}`).then(r => r.json()),
    ]).then(([caseData, commentData, relatedData, bookmarkData]) => {
      if (caseData.success) setCaseItem(caseData.data);
      else setError(caseData.error || '案例不存在');
      if (commentData.success) setComments(commentData.data);
      if (relatedData.success) setRelatedCases(relatedData.data);
      if (bookmarkData.success) setBookmarked(bookmarkData.data.bookmarked);
    }).catch(() => setError('加载失败')).finally(() => setLoading(false));
  }, [params.id]);

  const handleComment = async () => {
    if (!user) { toast.error('请先登录'); return; }
    if (!commentText.trim()) { toast.error('请输入评论内容'); return; }

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/cases/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentText.trim(),
          parentId: replyTo?.id || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCommentText('');
        setReplyTo(null);
        // 重新加载评论
        const commentRes = await fetch(`/api/cases/${params.id}/comments`);
        const commentData = await commentRes.json();
        if (commentData.success) setComments(commentData.data);
        toast.success('评论成功');
      } else {
        toast.error(data.error || '评论失败');
      }
    } catch {
      toast.error('评论失败');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('确定删除这条评论？')) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        const commentRes = await fetch(`/api/cases/${params.id}/comments`);
        const commentData = await commentRes.json();
        if (commentData.success) setComments(commentData.data);
        toast.success('已删除');
      }
    } catch {
      toast.error('删除失败');
    }
  };

  const handleToggleBookmark = async () => {
    if (!user) { toast.error('请先登录'); return; }
    setBookmarking(true);
    try {
      if (bookmarked) {
        const res = await fetch(`/api/bookmarks?caseId=${params.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) setBookmarked(false);
      } else {
        const res = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caseId: parseInt(params.id as string) }),
        });
        const data = await res.json();
        if (data.success) setBookmarked(true);
      }
    } catch {
      toast.error('操作失败');
    } finally {
      setBookmarking(false);
    }
  };

  const handleDeleteCase = async () => {
    if (!confirm('确定删除此案例？此操作不可撤销。')) return;
    try {
      const res = await fetch(`/api/cases/${params.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('已删除');
        router.push('/');
      } else {
        toast.error(data.error || '删除失败');
      }
    } catch {
      toast.error('删除失败');
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>;
  if (error) return (
    <div className="text-center py-20">
      <p className="text-gray-400 text-lg">{error}</p>
      <Link href="/" className="text-red-600 hover:underline mt-4 inline-block">返回首页</Link>
    </div>
  );
  if (!caseItem) return null;

  const isAuthor = user?.id === caseItem.author.id;

  return (
    <div className="max-w-2xl mx-auto">
      {/* 标题区 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded">
            {caseItem.category.name}
          </span>
          {isAuthor && (
            <div className="flex gap-2 ml-auto">
              <Link href={`/cases/${caseItem.id}/edit`} className="text-sm text-gray-500 hover:text-gray-700">
                编辑
              </Link>
              <button onClick={handleDeleteCase} className="text-sm text-red-500 hover:text-red-700">
                删除
              </button>
            </div>
          )}
        </div>
        <h1 className="text-2xl font-bold mb-3">{caseItem.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <Link href={`/profile/${caseItem.author.id}`} className="hover:text-gray-600">{caseItem.author.username}</Link>
          <span>{new Date(caseItem.createdAt).toLocaleDateString('zh-CN')}</span>
          <span>{caseItem.viewCount} 次浏览</span>
          <span>{caseItem._count.comments} 条评论</span>
        </div>
      </div>

      {/* 正文 */}
      <div className="bg-white rounded-lg p-6 mb-6">
        <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{caseItem.content}</div>
      </div>

      {/* 图片 */}
      {caseItem.images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {caseItem.images.map(img => (
            <img key={img.id} src={img.url} alt={img.alt || ''} className="w-full rounded-lg object-cover max-h-80" />
          ))}
        </div>
      )}

      {/* 分享 & 收藏 */}
      <div className="mb-8 flex gap-4">
        <CaseShareButton caseId={caseItem.id} />
        <button
          onClick={handleToggleBookmark}
          disabled={bookmarking}
          className="flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          {bookmarked ? '已收藏' : '收藏'}
        </button>
      </div>

      {/* 相关案例 */}
      {relatedCases.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">相关案例</h2>
          <div className="space-y-3">
            {relatedCases.map(rel => (
              <Link key={rel.id} href={`/cases/${rel.id}`} className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded">{rel.category.name}</span>
                </div>
                <h3 className="font-medium text-sm">{rel.title}</h3>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>{rel.author.username}</span>
                  <span>{rel._count.comments} 条评论</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 评论区 */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-semibold mb-4">评论 ({caseItem._count.comments})</h2>

        {/* 评论输入 */}
        {user ? (
          <div className="mb-6">
            {replyTo && (
              <div className="text-sm text-gray-500 mb-2">
                回复 @{replyTo.username}
                <button onClick={() => setReplyTo(null)} className="ml-2 text-red-600 hover:underline">取消</button>
              </div>
            )}
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="写下你的评论..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-24"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleComment}
                disabled={submittingComment || !commentText.trim()}
                className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {submittingComment ? '发送中...' : '发表评论'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-400 text-sm mb-6">
            <Link href="/login" className="text-red-600 hover:underline">登录</Link> 后可以评论
          </div>
        )}

        {/* 评论列表 */}
        {comments.length === 0 ? (
          <p className="text-center text-gray-400 py-8">还没有评论，来说两句吧</p>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{comment.author.username}</span>
                    <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {user?.id === comment.author.id && (
                    <button onClick={() => handleDeleteComment(comment.id)} className="text-xs text-gray-400 hover:text-red-500">
                      删除
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-700">{comment.content}</p>
                {user && (
                  <button
                    onClick={() => setReplyTo({ id: comment.id, username: comment.author.username })}
                    className="text-xs text-gray-400 hover:text-gray-600 mt-1"
                  >
                    回复
                  </button>
                )}

                {/* 回复列表 */}
                {comment.replies?.length > 0 && (
                  <div className="ml-4 mt-3 space-y-3 border-l-2 border-gray-200 pl-3">
                    {comment.replies.map(reply => (
                      <div key={reply.id}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{reply.author.username}</span>
                            <span className="text-xs text-gray-400">{new Date(reply.createdAt).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          {user?.id === reply.author.id && (
                            <button onClick={() => handleDeleteComment(reply.id)} className="text-xs text-gray-400 hover:text-red-500">
                              删除
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
