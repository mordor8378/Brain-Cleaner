'use client';

import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useUser();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 왼쪽 사이드바 - 프로필 */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-5">
              {loading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
                </div>
              ) : user ? (
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-pink-100 border-4 border-pink-200 p-4 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">@{user.nickname}</h3>
                  <div className="px-2 py-0.5 bg-yellow-100 rounded-full text-sm text-yellow-800 font-medium mb-3 mt-1">
                    절제 수련생
                  </div>
                  
                  <div className="w-full flex justify-center space-x-12 text-center border-t border-b py-3 my-2">
                    <div>
                      <p className="text-lg text-black font-bold">245</p>
                      <p className="text-xs text-gray-500">팔로워</p>
                    </div>
                    <div>
                      <p className="text-lg text-black font-bold">180</p>
                      <p className="text-xs text-gray-500">팔로잉</p>
                    </div>
                  </div>
                  
                  <button className="mt-3 w-full bg-pink-500 text-white py-3 px-4 rounded-full hover:bg-pink-600 transition font-medium">
                    오늘 인증하기
                  </button>
                  
                  <div className="mt-4 w-full">
                    <p className="text-sm font-medium text-gray-800 mb-3">이번 주 인증 현황</p>
                    <div className="flex justify-between mb-4">
                      <span className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-medium">월</span>
                      <span className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-medium">화</span>
                      <span className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-medium">수</span>
                      <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-medium">목</span>
                      <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-medium">금</span>
                      <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-medium">토</span>
                      <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-medium">일</span>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className='text-gray-600'>보유 포인트</span>
                        <span className="font-bold text-pink-500">1,250 P</span>
                      </div>
                      <div className="flex justify-between text-sm mb-4">
                        <span className='text-gray-600'>연속 인증</span>
                        <span className="font-bold text-pink-500">5일째</span>
                      </div>
                      
                      <div className="flex justify-between text-sm mb-1">
                        <span className='text-gray-600'>현재 포인트</span>
                        <span className="font-bold text-gray-900">{user.remainingPoint || 0}</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                        <div className="bg-pink-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 text-left">도파민 파괴자까지 1,550 포인트</p>
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
                  <p className="text-sm text-gray-500 mb-4 text-center">도파민 디톡스 인증하고 <br /> 포인트를 쌓아보세요!</p>
                  
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
              {/* 게시판 헤더 */}
              <div className="bg-white">
                {/* 전체 게시판 헤더 */}
                <div className="flex justify-between items-center px-5 py-4">
                  <div className="flex items-center">
                    <h2 className="text-lg font-bold text-gray-900 mr-2">전체 게시판</h2>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <button className="bg-pink-500 text-white py-2 px-6 rounded-full text-sm font-medium hover:bg-pink-600 transition">
                    글쓰기
                  </button>
                </div>
                
                {/* 정렬 옵션 */}
                <div className="border-t border-gray-200 px-5 py-3">
                  <div className="flex">
                    <button className="px-4 py-1.5 text-sm bg-pink-100 text-pink-500 rounded-full font-medium mr-2 hover:bg-pink-200 transition">최신순</button>
                    <button className="px-4 py-1.5 text-sm text-gray-500 rounded-full hover:bg-gray-100 transition">인기순</button>
                  </div>
                </div>
                
                {/* 분리선 */}
                <div className="border-t border-gray-200"></div>
              </div>

              {/* 게시글 목록 */}
              <div className="divide-y divide-gray-100">
                {[1, 2, 3].map((post) => (
                  <div key={post} className="p-5">
                    <div className="flex items-start mb-3">
                      <div className="mr-3">
                        <img src="https://via.placeholder.com/40" alt="프로필" className="w-10 h-10 rounded-full" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">@닉네임</span>
                            <span className="ml-1 text-xs text-green-500">
                              <svg className="w-3.5 h-3.5 inline" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                              </svg>
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">3h</span>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3">게시글 내용</p>
                        
                        <div className="rounded-lg overflow-hidden mb-3">
                          <img src="https://via.placeholder.com/500x300" alt="게시글 이미지" className="w-full h-auto object-cover" />
                        </div>
                        
                        <div className="flex items-center text-gray-500 text-sm pt-1">
                          <button className="flex items-center mr-5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                            <span>5</span>
                          </button>
                          <button className="flex items-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                            </svg>
                            <span>5</span>
                          </button>
                          <span className="mx-1 text-gray-400">·</span>
                          <span className="text-pink-500 font-medium">+50 포인트</span>
                        </div>
                      </div>
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