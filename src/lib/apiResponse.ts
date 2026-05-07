import { NextResponse } from 'next/server';

export function successResponse<T>(data: T, pagination?: { page: number; pageSize: number; total: number; totalPages: number }) {
  return NextResponse.json({ success: true, data, ...(pagination ? { pagination } : {}) });
}

export function errorResponse(error: string, status: number = 400) {
  return NextResponse.json({ success: false, error }, { status });
}
