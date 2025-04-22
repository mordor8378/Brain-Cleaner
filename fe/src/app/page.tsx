'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';
import WritePostPage from './post/write/page';
import VerificationWritePage from './verification/write/page';
import Post from '@/components/Post';

export interface Post {
  postId: number;
  userId: number;
  userNickname: string;
  title: string;
  content: string;
  imageUrl: string;
  viewCount: number;
  likeCount: number;
  verificationImageUrl: string;
  detoxTime: number;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const { user, loading } = useUser();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [selectedBoard, setSelectedBoard] = useState('전체게시판');
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [writeCategory, setWriteCategory] = useState('2');
  const [searchType, setSearchType] = useState('title');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortType, setSortType] = useState<'latest' | 'popular'>('latest');

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:8090/api/v1/posts', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        console.log('게시글 데이터:', data);

        // 최신순으로 정렬 (createdAt 기준 내림차순)
        const sortedData = [...data].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setPosts(sortedData);
      } else {
        console.error('게시글 로드 실패:', response.status);
      }
    } catch (error) {
      console.error('게시글 요청 오류:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      fetchPosts();
      return;
    }

    try {
      console.log('검색 요청:', {
        type: searchType,
        keyword: searchKeyword,
      });

      const response = await fetch(
        `http://localhost:8090/api/v1/posts/search?type=${searchType}&keyword=${encodeURIComponent(
          searchKeyword.trim()
        )}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`검색 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('검색 결과:', data);

      // 최신순으로 정렬
      const sortedData = [...data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPosts(sortedData);
    } catch (error) {
      console.error('검색 요청 오류:', error);
    }
  };

  // Enter 키 입력 시 검색 실행
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // 검색창 초기화
  const handleSearchReset = () => {
    setSearchType('title');
    setSearchKeyword('');
    fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const boardOptions = [
    { value: '전체게시판', label: '전체게시판' },
    { value: '인증게시판', label: '인증게시판' },
    { value: '정보공유게시판', label: '정보공유게시판' },
    { value: '자유게시판', label: '자유게시판' },
  ];

  const handleBoardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBoard(e.target.value);
  };

  const openWriteModal = () => {
    setShowWriteModal(true);
    setWriteCategory('2'); // 기본값으로 정보공유게시판 설정
  };

  const closeWriteModal = () => {
    setShowWriteModal(false);
    fetchPosts();
  };

  const handleWriteCategoryChange = (category: string) => {
    setWriteCategory(category);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showWriteModal && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeWriteModal}
          ></div>
          <div
            className="relative h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg">
              {writeCategory === '1' ? (
                <VerificationWritePage
                  onClose={closeWriteModal}
                  onSuccess={fetchPosts}
                  onCategoryChange={handleWriteCategoryChange}
                />
              ) : (
                <WritePostPage
                  onClose={closeWriteModal}
                  onSuccess={fetchPosts}
                  onCategoryChange={handleWriteCategoryChange}
                  initialCategory={writeCategory}
                />
              )}
            </div>
          </div>
        </div>
      )}

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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-gray-700"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <Link
                    href="/profile/me"
                    className="hover:text-pink-500 transition-colors"
                  >
                    <h3 className="text-lg font-bold text-gray-900">
                      @{user.nickname}
                    </h3>
                  </Link>
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

                  <button
                    onClick={openWriteModal}
                    className="mt-3 w-full bg-pink-500 text-white py-3 px-4 rounded-full hover:bg-pink-600 transition font-medium"
                  >
                    오늘 인증하기
                  </button>

                  <div className="mt-4 w-full">
                    <p className="text-sm font-medium text-gray-800 mb-3">
                      이번 주 인증 현황
                    </p>
                    <div className="flex justify-between mb-4">
                      <span className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-medium">
                        월
                      </span>
                      <span className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-medium">
                        화
                      </span>
                      <span className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-medium">
                        수
                      </span>
                      <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-medium">
                        목
                      </span>
                      <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-medium">
                        금
                      </span>
                      <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-medium">
                        토
                      </span>
                      <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-medium">
                        일
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">보유 포인트</span>
                        <span className="font-bold text-pink-500">
                          {user.remainingPoint || 0} P
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-4">
                        <span className="text-gray-600">연속 인증</span>
                        <span className="font-bold text-pink-500">5일째</span>
                      </div>

                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">현재 포인트</span>
                        <span className="font-bold text-gray-900">
                          {user.totalPoint || 0}
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                        <div
                          className="bg-pink-500 h-2.5 rounded-full"
                          style={{ width: '60%' }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 text-left">
                        도파민 파괴자까지 1,550 포인트
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6">
                  <div className="rounded-full bg-gray-100 p-4 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    로그인 후 이용해보세요
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 text-center">
                    도파민 디톡스 인증하고 <br /> 포인트를 쌓아보세요!
                  </p>

                  <Link href="/login" className="w-full">
                    <button className="w-full bg-pink-500 text-white py-2 px-4 rounded-full hover:bg-pink-600 transition">
                      로그인하기
                    </button>
                  </Link>

                  <div className="mt-2 w-full text-center">
                    <Link
                      href="/signup"
                      className="text-sm text-pink-500 hover:text-pink-700"
                    >
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
                  <div className="relative">
                    <select
                      value={selectedBoard}
                      onChange={handleBoardChange}
                      className="appearance-none bg-transparent pr-8 text-gray-900 py-2 pl-2 focus:outline-none font-bold text-lg"
                    >
                      {boardOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <button
                    onClick={openWriteModal}
                    className="bg-pink-500 text-white py-2 px-6 rounded-full text-sm font-medium hover:bg-pink-600 transition"
                  >
                    글쓰기
                  </button>
                </div>

                {/* 정렬 옵션 */}
                <div className="border-t border-gray-200 px-5 py-3">
                  <div className="flex items-center gap-2">
                    {/* 정렬 토글 버튼 */}
                    <button
                      onClick={() =>
                        setSortType(
                          sortType === 'latest' ? 'popular' : 'latest'
                        )
                      }
                      className="px-4 py-1.5 text-sm text-gray-600 rounded-full hover:bg-gray-100/50 transition-all duration-200 whitespace-nowrap flex items-center"
                    >
                      <span className="text-base leading-none">
                        {sortType === 'latest' ? '✨' : '💖'}
                      </span>
                      <span className="leading-none">
                        {sortType === 'latest' ? '최신순' : '인기순'}
                      </span>
                    </button>
                    {/* 통합 검색창 */}
                    <div className="flex-1 relative flex items-center group">
                      <div className="flex absolute left-2 z-10">
                        <button
                          onClick={() =>
                            setSearchType(
                              searchType === 'title' ? 'writer' : 'title'
                            )
                          }
                          className="px-3 py-1.5 text-sm text-gray-600 rounded-full hover:bg-gray-100/50 transition-all duration-200 whitespace-nowrap flex items-center min-w-[72px]"
                        >
                          <span className="text-base leading-none">
                            {searchType === 'title' ? '🧠' : '👦🏻'}
                          </span>
                          <span className="leading-none">
                            {searchType === 'title' ? '제목' : '작성자'}
                          </span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`${
                          searchType === 'title' ? '제목' : '작성자'
                        } 검색`}
                        className="w-full py-1.5 pl-[100px] pr-20 text-sm text-gray-900 bg-transparent hover:bg-gray-100/50 focus:bg-gray-100/50 transition-all duration-200 outline-none focus:outline-none focus:ring-0 border-none focus:border-none rounded-full placeholder-gray-400 caret-pink-500 appearance-none select-none"
                      />
                      <div className="absolute right-2 flex items-center gap-1">
                        {searchKeyword && (
                          <button
                            onClick={handleSearchReset}
                            className="text-gray-400 hover:text-pink-500 transition-colors p-1"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={handleSearch}
                          className="text-gray-400 hover:text-pink-500 transition-colors p-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 분리선 */}
                <div className="border-t border-gray-200"></div>
              </div>

              {/* 게시글 목록 */}
              <div className="divide-y divide-gray-100">
                {posts &&
                  posts.map((post) => (
                    <Post
                      key={post.postId}
                      postId={post.postId}
                      userId={post.userId}
                      userNickname={post.userNickname}
                      title={post.title}
                      content={post.content}
                      imageUrl={post.imageUrl}
                      viewCount={post.viewCount}
                      likeCount={post.likeCount}
                      verificationImageUrl={post.verificationImageUrl}
                      detoxTime={post.detoxTime}
                      createdAt={post.createdAt}
                      updatedAt={post.updatedAt}
                      onUpdate={fetchPosts}
                    />
                  ))}
              </div>
            </div>
          </div>

          {/* 오른쪽 사이드바 - Weekly Best */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-5 mb-4">
              <h3 className="text-lg text-black font-medium mb-4">
                Weekly Best 5
              </h3>
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
          </div>
        </div>
      </main>
    </div>
  );
}
