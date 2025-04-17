'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface User {
  id: number;
  email: string;
  nickname: string;
  role: string;
}

export default function Callback() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('소셜 로그인 콜백 처리 시작');
        
        // 인증 상태 확인 API 호출
        const response = await fetch('http://localhost:8090/api/v1/users/me', {
          credentials: 'include' // 쿠키 포함
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('소셜 로그인 사용자 정보:', data);
          
          // 사용자 정보를 로컬 스토리지에 저장
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userId', data.id.toString());
          localStorage.setItem('nickname', data.nickname);
          localStorage.setItem('email', data.email);
          
          // accessToken이 쿠키에 있을 경우 로컬 스토리지에도 저장
          const cookies = document.cookie.split(';');
          for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'accessToken') {
              localStorage.setItem('accessToken', value);
              console.log('쿠키의 accessToken을 로컬 스토리지에 저장:', value);
              break;
            }
          }
          
          setUser(data);
          
          // 소셜 로그인 성공 후 3초 후 홈페이지로 리다이렉트
          setTimeout(() => {
            // 메인 페이지로 이동할 때 window.location 사용
            window.location.href = '/';
          }, 3000);
        } else {
          console.error('사용자 정보 가져오기 실패:', response.status);
          setError('소셜 로그인 처리 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('인증 확인 중 오류:', error);
        setError('인증 확인 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);


  if (loading) return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">소셜 로그인 처리</h1>
        
        {user ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-xl font-medium">안녕하세요, {user.nickname}님!</p>
              <p className="text-gray-500">{user.email}</p>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-lg font-medium mb-2">소셜 로그인 성공</h2>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-700">소셜 로그인이 성공적으로 처리되었습니다.</p>
              </div>
            </div>
            
            <div className="text-center text-gray-500 mt-4">
              <p>3초 후 홈페이지로 이동합니다...</p>
            </div>
            
            <div className="flex justify-center pt-4">
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition"
              >
                지금 바로 홈으로
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || '로그인에 실패했습니다.'}</p>
            <p className="text-gray-600 text-sm mb-4">소셜 로그인 과정에서 문제가 발생했습니다.</p>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition"
            >
              로그인 페이지로
            </button>
          </div>
        )}
      </div>
    </div>
  );
}