'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  nickname: string;
  remainingPoint?: number;
  totalPoint?: number;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('홈페이지 인증 상태 확인');
        
        // 로컬 스토리지에서 로그인 상태 확인
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const storedUserId = localStorage.getItem('userId');
        const storedNickname = localStorage.getItem('nickname');
        const storedEmail = localStorage.getItem('email');

        console.log('로컬 스토리지 로그인 상태:', isLoggedIn);
        console.log('쿠키:', document.cookie);
        
        // 쿠키에서 엑세스토큰 확인
        const getCookie = (name) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(';').shift();
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
  }, []);

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
      // window.location.href = '/login';
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            {/* TODO: 아이콘 경로 수정 필요 */}
            <img src="/brain-icon.png" alt="Brain Cleaner" className="h-8 w-auto" />
          </Link>
          <div className="flex space-x-4">
            {user ? (
              <button 
                onClick={handleLogout} 
                className="text-pink-500 hover:text-pink-700"
              >
                로그아웃
              </button>
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

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 왼쪽 사이드바 - 프로필 */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-5">
              {user ? (
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-pink-100 p-4 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">@{user.nickname}</h3>
                  <p className="text-sm text-gray-500 mb-3">{user.email}</p>
                  <div className="w-full flex justify-between text-center border-t border-b py-2 my-2">
                    <div>
                      <p className="text-lg text-black font-bold">0</p>
                      <p className="text-xs text-gray-500">팔로워</p>
                    </div>
                    <div>
                      <p className="text-lg text-black font-bold">0</p>
                      <p className="text-xs text-gray-500">팔로잉</p>
                    </div>
                  </div>
                  <button className="mt-3 w-full bg-pink-500 text-white py-2 px-4 rounded-full hover:bg-pink-600 transition">
                    오늘 인증하기
                  </button>
                  
                  <div className="mt-4 w-full">
                    <p className="text-sm text-gray-500 mb-1">이번 주 인증 현황</p>
                    <div className="flex justify-between">
                      <span className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center">월</span>
                      <span className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center">화</span>
                      <span className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center">수</span>
                      <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">목</span>
                      <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">금</span>
                      <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">토</span>
                      <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">일</span>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className='text-black'>현재 포인트</span>
                        <span className="font-bold text-pink-500">{user.totalPoint}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className='text-black'>다음 등급까지</span>
                        <span className="font-bold text-pink-500">5일째</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div className="bg-pink-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6">
                  <div className="rounded-full bg-gray-100 p-4 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">로그인 후 이용해보세요</h3>
                  <p className="text-sm text-gray-500 mb-4 text-center">도파민 디톡스 인증하고 포인트를 쌓아보세요!</p>
                  
                  <Link href="/login" className="w-full">
                    <button className="w-full bg-pink-500 text-white py-2 px-4 rounded-full hover:bg-pink-600 transition">
                      로그인하기
                    </button>
                  </Link>
                  
                  <div className="mt-2 w-full text-center">
                    <Link href="/signup" className="text-sm text-pink-500 hover:text-pink-700">
                      아직 계정이 없으신가요? 회원가입
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 중앙 콘텐츠 - 게시판 */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg text-black font-medium">전체 게시판</h2>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <button className="bg-pink-500 text-white py-1 px-3 rounded-md text-sm">글쓰기</button>
                </div>
              </div>

              {/* 게시글 목록 */}
              <div className="divide-y divide-gray-200">
                {[1, 2, 3].map((post) => (
                  <div key={post} className="p-4">
                    <div className="flex items-center mb-2">
                      <img src="https://via.placeholder.com/40" alt="프로필" className="w-10 h-10 rounded-full mr-3" />
                      <div>
                        <p className="text-black">@user</p>
                        <p className="text-xs text-black">글 내용</p>
                      </div>
                      <span className="ml-auto text-xs text-gray-500">3h</span>
                    </div>
                    <div className="mb-2">
                      <img src="https://via.placeholder.com/500x300" alt="게시글 이미지" className="w-full h-48 object-cover rounded-md" />
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <button className="flex items-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        좋아요 1
                      </button>
                      <button className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        댓글 1
                      </button>
                      <span className="ml-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽 사이드바 - Weekly Best */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-5 mb-4">
              <h3 className="text-lg text-black font-medium mb-4">Weekly Best 5</h3>
              <ul className="space-y-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <li key={item} className="flex items-center">
                    <div className="bg-pink-100 rounded-full w-8 h-8 flex items-center justify-center text-pink-500 mr-3">
                      {item}
                    </div>
                    <p className="text-sm text-gray-700 truncate">제목</p>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* 오른쪽 사이드바 하단의 검색창 */}
            <div className="relative">
              <input type="text" placeholder="검색" className="w-full py-2 px-4 text-black border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent" />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}