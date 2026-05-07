export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  _count?: { cases: number };
}

export interface CaseItem {
  id: number;
  title: string;
  content: string;
  viewCount: number;
  createdAt: string;
  author: { id: number; username: string };
  category: { id: number; name: string; slug: string };
  images: { url: string }[];
  _count: { comments: number };
}

export interface CaseDetail extends CaseItem {
  content: string;
  updatedAt: string;
  author: { id: number; username: string; avatar: string | null };
  images: { id: number; url: string; alt: string | null }[];
}

export interface CommentData {
  id: number;
  content: string;
  parentId: number | null;
  createdAt: string;
  author: { id: number; username: string };
  replies: CommentData[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface BookmarkItem {
  id: number;
  caseId: number;
  createdAt: string;
  case: CaseItem;
}
