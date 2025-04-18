// fe/src/app/admin/layout.tsx
'use client';

import React from 'react';
import AdminAuthGuard from '@/components/AdminAuthGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen bg-gray-100">
        {/* 사이드바 - 프로필만 유지 */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-6 flex flex-col items-center border-b border-gray-200">
            {/* 로고나 프로필 이미지 등 */}
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-3">
              <i className="ri-user-line text-gray-400 text-3xl" />
            </div>
            <p className="text-gray-800 font-medium">관리자님</p>
            <p className="text-gray-500 text-sm">최근 접속: 2025-04-18 14:30</p>
          </div>
        </aside>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex flex-col flex-1">
          {/* 헤더 */}
          <header className="bg-white border-b border-gray-200 flex justify-between items-center px-6 py-3 sticky top-0 z-10">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-700">관리자 페이지</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm">관리자님 환영합니다</span>
            </div>
          </header>

          {/* 각 페이지 내용이 들어올 곳 */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}