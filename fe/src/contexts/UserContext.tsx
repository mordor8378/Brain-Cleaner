'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export interface User {
  id: number;
  email: string;
  nickname: string;
  remainingPoint?: number;
  totalPoint?: number;
  role?: string;
  isSocialUser?: boolean;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshUserInfo: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      console.log('사용자 정보 가져오기 시작');
      
      // 사용자 정보 API 호출
      const response = await fetch('http://localhost:8090/api/v1/users/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('사용자 정보 로드 성공:', data);
        
        // 사용자 상태 업데이트
        setUser(data);
        
        // 추가 정보도 로컬 스토리지에 저장
        localStorage.setItem('userId', data.id.toString());
        localStorage.setItem('nickname', data.nickname);
        localStorage.setItem('email', data.email);
        localStorage.setItem('isLoggedIn', 'true');
        
        setError(null);
      } else {
        console.log('사용자 정보 로드 실패:', response.status);
        setUser(null);
        localStorage.removeItem('isLoggedIn');
        setError('사용자 정보를 가져오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('인증 확인 중 오류:', error);
      setUser(null);
      setError('인증 과정에서 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const refreshUserInfo = async () => {
    await fetchUserInfo();
  };

  const logout = async () => {
    try {
      console.log('로그아웃 시작');
      
      // 로그아웃 API 호출
      const response = await fetch('http://localhost:8090/api/v1/users/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      console.log('로그아웃 응답 상태:', response.status);
      
      // 로컬 스토리지 초기화
      localStorage.clear();
      sessionStorage.clear();
      
      // 사용자 상태 초기화
      setUser(null);
      
      // 홈 페이지로 리다이렉트
      router.push('/');
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      setError('로그아웃 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      // 로그인, 회원가입 페이지에서는 확인하지 않음
      const authPages = ['/login', '/signup'];
      if (authPages.includes(pathname)) {
        setLoading(false);
        return;
      }
  
      try {
        setLoading(true);
        console.log('인증 상태 확인 시작');
        
        // URL에서 social 체크
        const urlParams = new URLSearchParams(window.location.search);
        const isSocialLogin = urlParams.get('social') === 'true';

        if (isSocialLogin) {
            console.log('소셜 로그인 감지');
            // 파라미터 제거
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        // 소셜 로그인이거나 기존 로그인 상태가 있으면 사용자 정보 가져오기
        if (isSocialLogin || isLoggedIn) {
          // 사용자 정보 API 호출
          const response = await fetch('http://localhost:8090/api/v1/users/me', {
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('사용자 정보 로드 성공:', data);
            
            // 사용자 상태 업데이트
            setUser(data);
            
            // 로컬 스토리지에 정보 저장
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userId', data.id.toString());
            localStorage.setItem('nickname', data.nickname);
            localStorage.setItem('email', data.email);
            
            setError(null);
          } else {
            console.log('사용자 정보 로드 실패:', response.status);
            setUser(null);
            localStorage.removeItem('isLoggedIn');
            setError('사용자 정보를 가져오는데 실패했습니다.');
          }
        } else {
          // 토큰도 없고 로그인 상태도 없으면 비로그인 상태로 처리
          setUser(null);
        }
      } catch (error) {
        console.error('인증 확인 중 오류:', error);
        setUser(null);
        localStorage.removeItem('isLoggedIn');
        setError('인증 과정에서 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [pathname]); // pathname이 변경될 때마다 실행

  return (
    <UserContext.Provider value={{ user, loading, error, logout, refreshUserInfo }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}