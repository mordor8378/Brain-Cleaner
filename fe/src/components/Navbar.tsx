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
          <img src="/brain-icon.png" alt="Brain Cleaner" className="h-8 w-auto" />
        </Link>
        <div className="flex space-x-4">
          {user ? (
            <>
              <span className="text-gray-700">안녕하세요, {user.nickname}님!</span>
              <button 
                onClick={logout} 
                className="text-pink-500 hover:text-pink-700"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-pink-500 hover:text-pink-700">
                로그인
              </Link>
              <Link href="/signup" className="text-pink-500 hover:text-pink-700">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}