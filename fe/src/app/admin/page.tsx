// fe/src/app/admin/page.tsx
'use client'; // 새로고침 버튼 onClick 사용 위해 추가

import React from 'react';
import Link from 'next/link'; // Next.js 링크 사용

export default function AdminDashboardPage() {

  const handleRefresh = () => {
    // window.location.reload(); // 간단한 페이지 새로고침
    console.log('페이지 새로고침 (나중에 구현)');
  };

  return (
    // layout.tsx의 {children} 위치에 이 내용이 들어감
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">대시보드</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 text-gray-600 hover:text-primary"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-refresh-line" />
          </div>
          <span>새로고침</span>
        </button>
      </div>

      {/* 주요 현황 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded shadow p-6">
          <p className="text-gray-500 mb-2">총 회원 수</p>
          <p className="text-3xl font-bold text-gray-800">1,234</p> {/* 나중에 데이터 연동 */}
        </div>
        <div className="bg-white rounded shadow p-6">
          <p className="text-gray-500 mb-2">승인 대기 인증</p>
          <p className="text-3xl font-bold text-gray-800">15</p> {/* 나중에 데이터 연동 */}
        </div>
        <div className="bg-white rounded shadow p-6">
          <p className="text-gray-500 mb-2">오늘 가입자</p>
          <p className="text-3xl font-bold text-gray-800">5</p> {/* 나중에 데이터 연동 */}
        </div>
        <div className="bg-white rounded shadow p-6">
          <p className="text-gray-500 mb-2">새 게시글</p>
          <p className="text-3xl font-bold text-gray-800">28</p> {/* 나중에 데이터 연동 */}
        </div>
      </div>

      {/* 빠른 실행 버튼 */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4">빠른 실행</h2>
        <div className="flex flex-wrap gap-4">
          {/* Link 컴포넌트로 변경 */}
          <Link href="/admin/users" className="bg-primary text-white py-3 px-6 !rounded-button whitespace-nowrap">
            회원 목록 관리
          </Link>
          <Link href="/admin/approvals" className="bg-primary text-white py-3 px-6 !rounded-button whitespace-nowrap">
            인증 승인 관리
          </Link>
          <Link href="/admin/posts" className="bg-primary text-white py-3 px-6 !rounded-button whitespace-nowrap">
            게시글 관리
          </Link>
        </div>
      </div>

      {/* 주요 관리 메뉴 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 회원 관리 카드 */}
        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">회원 관리</h3>
            <div className="w-10 h-10 flex items-center justify-center text-primary">
              <i className="ri-user-line text-2xl" /> {/* 크기 조정 */}
            </div>
          </div>
          <p className="text-gray-600 mb-4">전체 회원 수: 1,234명</p> {/* 나중에 데이터 연동 */}
          <p className="text-gray-600 mb-6">오늘 가입: 5명</p> {/* 나중에 데이터 연동 */}
          <Link href="/admin/users" className="block w-full bg-primary text-white text-center py-3 !rounded-button hover:bg-opacity-90 transition-colors">
            회원 목록 관리
          </Link>
        </div>
        {/* 인증 관리 카드 */}
        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">인증 관리</h3>
            <div className="w-10 h-10 flex items-center justify-center text-primary">
              <i className="ri-check-double-line text-2xl" /> {/* 크기 조정 */}
            </div>
          </div>
          <p className="text-gray-600 mb-4">대기 중: 15건</p> {/* 나중에 데이터 연동 */}
          <p className="text-gray-600 mb-6">오늘 처리: 8건</p> {/* 나중에 데이터 연동 */}
          <Link href="/admin/approvals" className="block w-full bg-primary text-white text-center py-3 !rounded-button hover:bg-opacity-90 transition-colors">
            인증 승인 관리
          </Link>
        </div>
        {/* 게시글 관리 카드 */}
        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">게시글 관리</h3>
            <div className="w-10 h-10 flex items-center justify-center text-primary">
              <i className="ri-file-list-line text-2xl" /> {/* 크기 조정 */}
            </div>
          </div>
          <p className="text-gray-600 mb-4">전체 게시글: 283개</p> {/* 나중에 데이터 연동 */}
          <p className="text-gray-600 mb-6">오늘 등록: 28개</p> {/* 나중에 데이터 연동 */}
          <Link href="/admin/posts" className="block w-full bg-primary text-white text-center py-3 !rounded-button hover:bg-opacity-90 transition-colors">
            게시글 관리
          </Link>
        </div>
      </div>
    </div>
  );
}