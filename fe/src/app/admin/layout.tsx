'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';

import localFont from 'next/font/local'
const pretendard = localFont({
  src: '../../font/PretendardVariable.woff2',
  display: 'swap',
  weight: '400 500 600 700',
  variable: '--font-pretendard',
});


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navigation = [
    { name: '관리자 대시보드', href: '/admin', icon: 'ri-dashboard-line' },
    { name: '회원 관리', href: '/admin/users', icon: 'ri-user-line' },
    { name: '인증 관리', href: '/admin/verifications', icon: 'ri-check-double-line' },
    { name: '신고 게시글 관리', href: '/admin/reports', icon: 'ri-file-list-line' },
    { name: '사이트 바로가기', href: '/', icon: 'ri-home-4-line'}
  ];

  return (
    <AdminAuthGuard>
      <div className={`flex min-h-screen bg-gray-100 ${pretendard.variable} font-pretendard font-medium`}>
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-6 flex flex-col items-center border-b border-gray-200">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-3">
              <i className="ri-user-line text-gray-400 text-3xl"></i> {/* ri-2x 대신 text-3xl 사용 (취향껏) */}
            </div>
            <p className="text-gray-800 font-medium">관리자님</p>
            <p className="text-gray-500 text-sm whitespace-nowrap">
              최근 접속: {new Date().toLocaleString()}
            </p>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-2 rounded ${
                        isActive
                          ? 'text-primary bg-pink-50 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="w-5 h-5 flex items-center justify-center mr-2">
                        <i className={item.icon}></i>
                      </span>
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <div className="flex flex-col flex-1">
          <header className="bg-white border-b border-gray-200 flex justify-between items-center px-6 py-3 sticky top-0 z-10">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-700">관리자 페이지</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm">관리자님 환영합니다</span>
            </div>
          </header>

          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}