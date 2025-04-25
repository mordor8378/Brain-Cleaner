'use client';

import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';

export default function Navbar() {
  const { user, logout } = useUser();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          {/* TODO: 아이콘 경로 수정 필요 */}
          <img
            src="/brain-icon.png"
            alt="Brain Cleaner"
            className="h-8 w-auto"
          />
        </Link>
        <div className="flex space-x-4">
          {user ? (
            <>
              <Link
                href="/profile/me"
                className="text-gray-700 hover:text-pink-500 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </Link>
              <button
                onClick={logout}
                style={{ color: '#F742CD' }}
                className="hover:opacity-80"
                aria-label="로그아웃"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-pink-500 hover:text-pink-700">
                로그인
              </Link>
              <Link
                href="/signup"
                className="text-pink-500 hover:text-pink-700"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
