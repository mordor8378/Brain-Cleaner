'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

interface User {
  id: number;
  email: string;
  nickname: string;
  remainingPoint?: number;
  totalPoint?: number;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // 로그인/회원가입 페이지에서는 navbar를 표시하지 않음
  const hideNavbar = pathname === '/login' || pathname === '/signup' || pathname === '/callback';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('인증 상태 확인');
        
        // 로컬 스토리지에서 로그인 상태 확인
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const storedUserId = localStorage.getItem('userId');
        const storedNickname = localStorage.getItem('nickname');
        const storedEmail = localStorage.getItem('email');

        console.log('로컬 스토리지 로그인 상태:', isLoggedIn);
        console.log('쿠키:', document.cookie);
        
        // 쿠키에서 엑세스토큰 확인
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) {
            const result = parts.pop()?.split(';').shift();
            return result || null;
          }
          return null;
        };
        
        const accessToken = localStorage.getItem('accessToken') || getCookie('accessToken');
        console.log('사용할 토큰:', accessToken ? '있음' : '없음');
        
        if (accessToken) {
          // 토큰이 있으면 API 호출
          const response = await fetch('http://localhost:8090/api/v1/users/me', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            },
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('사용자 정보 로드 성공:', data);
            setUser(data);
            
            // 로컬 스토리지에 최신 정보 저장
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userId', data.id.toString());
            localStorage.setItem('nickname', data.nickname);
            localStorage.setItem('email', data.email);
            if (!localStorage.getItem('accessToken') && accessToken) {
              localStorage.setItem('accessToken', accessToken);
            }
          } else {
            console.log('사용자 정보 로드 실패:', response.status);
            
            // 로컬 스토리지에 정보가 있으면 임시로 그걸 사용
            if (isLoggedIn && storedUserId && storedNickname) {
              setUser({
                id: parseInt(storedUserId),
                nickname: storedNickname,
                email: storedEmail || '이메일 정보 없음'
              });
            } else {
              setUser(null);
            }
          }
        } else if (isLoggedIn && storedUserId && storedNickname) {
          // 토큰은 없지만 로컬 스토리지에 로그인 정보가 있는 경우
          setUser({
            id: parseInt(storedUserId),
            nickname: storedNickname,
            email: storedEmail || '이메일 정보 없음'
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('인증 확인 중 오류:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      console.log('로그아웃 시작');
      
      // 로컬 스토리지에서 토큰 가져오기
      const token = localStorage.getItem('accessToken');
      
      console.log('로그아웃에 사용할 토큰:', token);
      
      // 헤더와 함께 요청
      const response = await fetch('http://localhost:8090/api/v1/users/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include'
      });
      
      console.log('로그아웃 응답 상태:', response.status);
      
      // 로컬 스토리지 초기화
      localStorage.clear();
      sessionStorage.clear();
      
      console.log('로그아웃 후 쿠키:', document.cookie);
      
      // 사용자 상태 초기화
      setUser(null);
      
      // 페이지 새로고침
      window.location.href = '/';
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    }
  };

  return (
    <>
      {!hideNavbar && <Navbar user={user} handleLogout={handleLogout} />}
      {children}
    </>
  );
} 