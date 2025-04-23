'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';
import WritePostPage from './post/write/page';
import VerificationWritePage from './verification/write/page';
import Post from '@/components/Post';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

export interface Post {
  postId: number;
  userId: number;
  userNickname: string;
  title: string;
  content: string;
  imageUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  verificationImageUrl: string;
  detoxTime: number;
  createdAt: string;
  updatedAt: string;
  likedByCurrentUser?: boolean;
}

interface PostsResponse {
  content: Post[];
  pageable: {
    pageNumber: number;
  };
  last: boolean;
  number: number;
}

export default function Home() {
  const { user, loading } = useUser();
  const [selectedBoard, setSelectedBoard] = useState('0');
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [writeCategory, setWriteCategory] = useState('2');
  const [searchType, setSearchType] = useState('title');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortType, setSortType] = useState<'latest' | 'popular'>('latest');

  // QueryClient 인스턴스 -> 캐시 조작용
  const queryClient = useQueryClient();

  // 마지막 요소 참조용
  const observerRef = useRef<IntersectionObserver | null>(null);

  const boardOptions = [
    { value: '0', label: '전체게시판' },
    { value: '1', label: '인증게시판' },
    { value: '2', label: '정보공유게시판' },
    { value: '3', label: '자유게시판' },
  ];

  const fetchPosts = async ({ pageParam = 0 }): Promise<PostsResponse> => {
    const categoryParam =
      selectedBoard === '0' ? '' : `&categoryId=${selectedBoard}`;
    const sortParam =
      sortType === 'popular' ? '&sort=likeCount,desc' : '&sort=createdAt,desc';

    let url = `http://localhost:8090/api/v1/posts/pageable?page=${pageParam}&size=10${categoryParam}${sortParam}`;

    // 검색어가 있으면 검색 API 사용
    if (searchKeyword.trim()) {
      url = `http://localhost:8090/api/v1/posts/search?type=${searchType}&keyword=${encodeURIComponent(
        searchKeyword.trim()
      )}&page=${pageParam}&size=10${sortParam}`;
    }

    console.log('요청 URL:', url);

    const response = await fetch(url, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`게시글 로드 실패: ${response.status}`);
    }

    const data = await response.json();
    console.log('=== 게시글 API 응답 데이터 ===');
    console.log('전체 데이터:', data);

    if (Array.isArray(data)) {
      // 검색 결과가 배열인 경우 페이지네이션 객체 형태로 변환
      return {
        content: data,
        pageable: {
          pageNumber: pageParam,
        },
        last: true, // 검색 결과는 한 번에 다 가져오므로 마지막 페이지로 설정
        number: pageParam,
      };
    }

    return data;
  };

  // useInfiniteQuery 훅 사용
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['posts', selectedBoard, sortType, searchType, searchKeyword],
    queryFn: fetchPosts,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.last ? undefined : lastPage.number + 1;
    },
  });

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      refetch();
      return;
    }

    console.log('검색 요청:', {
      type: searchType,
      keyword: searchKeyword,
    });

    // 검색어를 변경하면 자동으로 refetch가 호출됨
    refetch();
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
    refetch();
  };

  // 마지막 요소 관찰을 위한 콜백 함수
  const lastPostRef = useCallback(
    (node: HTMLDivElement) => {
      if (isFetchingNextPage) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          console.log('마지막 게시글 감지, 다음 페이지 로드');
          fetchNextPage();
        }
      });

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  // 컴포넌트 언마운트 시 옵저버 정리
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const handleBoardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('선택된 카테고리:', e.target.value); // 카테고리 변경 확인용 로그
    setSelectedBoard(e.target.value);
  };

  const openWriteModal = () => {
    setShowWriteModal(true);
    setWriteCategory('2'); // 기본값으로 정보공유게시판 설정
  };

  const closeWriteModal = () => {
    setShowWriteModal(false);
    refetch();
  };

  const handleWriteCategoryChange = (category: string) => {
    setWriteCategory(category);
  };

  const handleLike = async (postId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8090/api/v1/posts/${postId}/like`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('좋아요 응답:', data);

        // React Query 캐시 직접 업데이트
        queryClient.setQueryData<{ pages: PostsResponse[] }>(
          ['posts', selectedBoard, sortType, searchType, searchKeyword],
          (oldData) => {
            if (!oldData) return oldData;

            // 페이지별로 게시글 업데이트
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                content: page.content.map((post) => {
                  if (post.postId === postId) {
                    return {
                      ...post,
                      likeCount: data.likeCount,
                      likedByCurrentUser: data.likedByCurrentUser,
                    };
                  }
                  return post;
                }),
              })),
            };
          }
        );
      }
    } catch (error) {
      console.error('좋아요 처리 중 오류:', error);
    }
  };

  const handleUnlike = async (postId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8090/api/v1/posts/${postId}/like`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (response.status === 204) {
        // DELETE 요청은 보통 204 No Content를 반환

        // React Query 캐시 직접 업데이트
        queryClient.setQueryData<{ pages: PostsResponse[] }>(
          ['posts', selectedBoard, sortType, searchType, searchKeyword],
          (oldData) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                content: page.content.map((post) => {
                  if (post.postId === postId) {
                    console.log('좋아요 취소:', {
                      이전: {
                        likeCount: post.likeCount,
                        likedByCurrentUser: post.likedByCurrentUser,
                      },
                      이후: {
                        likeCount: Math.max(0, post.likeCount - 1),
                        likedByCurrentUser: false,
                      },
                    });

                    return {
                      ...post,
                      likeCount: Math.max(0, post.likeCount - 1),
                      likedByCurrentUser: false,
                    };
                  }
                  return post;
                }),
              })),
            };
          }
        );
      } else {
        console.error('좋아요 취소 실패:', response.status);
        const errorText = await response.text();
        console.error('에러 내용:', errorText);
      }
    } catch (error) {
      console.error('좋아요 취소 중 오류:', error);
    }
  };

  // 게시글 삭제 핸들러 추가
  const handleDelete = async (postId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8090/api/v1/posts/${postId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (response.ok) {
        // React Query 캐시 업데이트
        queryClient.setQueryData<{ pages: PostsResponse[] }>(
          ['posts', selectedBoard, sortType, searchType, searchKeyword],
          (oldData) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                content: page.content.filter((post) => post.postId !== postId),
              })),
            };
          }
        );
      } else {
        console.error('게시글 삭제 실패:', response.status);
        alert('게시글 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('게시글 삭제 중 오류:', error);
      alert('게시글 삭제 중 오류가 발생했습니다.');
    }
  };

  const posts = data?.pages.flatMap((page) => page.content) || [];

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
                  onSuccess={() => refetch()}
                  onCategoryChange={handleWriteCategoryChange}
                />
              ) : (
                <WritePostPage
                  onClose={closeWriteModal}
                  onSuccess={() => refetch()}
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
            <div className="bg-white rounded-lg shadow mb-6 flex flex-col h-[calc(100vh-2rem)]">
              {/* 게시판 헤더 */}
              <div className="bg-white sticky top-0 z-10">
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
              <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
                {/* 초기 로딩 중 */}
                {isFetching && !isFetchingNextPage && posts.length === 0 && (
                  <div className="p-8 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                  </div>
                )}

                {/* 데이터가 없을 때 */}
                {!isFetching && posts.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    게시글이 없습니다.
                  </div>
                )}

                {/* 게시글 목록 */}
                {posts.map((post, index) => {
                  // post가 undefined인 경우를 체크
                  if (!post || post.postId === undefined) return null;

                  return (
                    <div
                      key={post.postId}
                      ref={index === posts.length - 1 ? lastPostRef : undefined}
                    >
                      <Post
                        postId={post.postId}
                        userId={post.userId}
                        userNickname={post.userNickname}
                        title={post.title || ''}
                        content={post.content || ''}
                        imageUrl={post.imageUrl || ''}
                        viewCount={post.viewCount || 0}
                        likeCount={post.likeCount || 0}
                        commentCount={post.commentCount}
                        verificationImageUrl={post.verificationImageUrl || ''}
                        detoxTime={post.detoxTime || 0}
                        createdAt={post.createdAt || ''}
                        updatedAt={post.updatedAt || ''}
                        onUpdate={() => refetch()}
                        onLike={() => handleLike(post.postId)}
                        onUnlike={() => handleUnlike(post.postId)}
                        isLiked={post.likedByCurrentUser}
                        onDelete={handleDelete}
                      />
                    </div>
                  );
                })}

                {/* 추가 로딩 인디케이터 */}
                {isFetchingNextPage && (
                  <div className="p-5 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                  </div>
                )}

                {/* 더 이상 로드할 데이터가 없을 때 메시지 */}
                {!hasNextPage && posts.length > 0 && !isFetching && (
                  <div className="p-5 text-center text-gray-500">
                    더 이상 게시글이 없습니다.
                  </div>
                )}
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
