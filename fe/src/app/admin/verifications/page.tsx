"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  useInfiniteQuery,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

// PATCH 요청 본문 타입 정의
interface VerificationStatusUpdateData {
  status: "APPROVED" | "REJECTED";
}

const AdminVerificationPage: React.FC = () => {
  // 가상의 인증 요청 데이터

  // 인증 요청 처리 함수 (내용은 나중에 채움)
  const handleApprove = (verificationId: number) => {
    approveMutation.mutate(verificationId);
  };
  const handleReject = (verificationId: number) => {
    rejectMutation.mutate(verificationId);
  };

  // 시간 포맷팅 함수
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );
    if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else {
      return date.toLocaleDateString("ko-KR");
    }
  };

  const queryClient = useQueryClient(); // QueryClient 인스턴스
  const observerRef = useRef<IntersectionObserver | null>(null); // IntersectionObserver 참조

  const ADMIN_VERIFICATIONS_API_URL =
    `${process.env.NEXT_PUBLIC_API_BASE_URL}` + "/api/admin/verifications";

  // 백엔드 API 응답 타입 정의 (Page<Verification> 구조에 맞춰야 함)
  interface VerificationPage {
    content: Verification[]; // Verification 타입 배열
    last: boolean;
    number: number;
    totalElements: number; // 총 인증 요청 개수
  }

  interface Verification {
    verificationId: number; // <-- 'Id' -> 'verificationId' 로 수정!
    postId: number; // <-- 'postId?' -> 'postId' 로 수정! (Optional 제거, 타입 number)
    userId: number; // <-- DTO에 userId도 있으니 추가 (타입 number)
    status: string; // <-- DTO에 status도 있으니 추가 (타입 string - Enum 이름)
    userNickname: string;
    verificationImageUrl: string | null; // <-- 이미지 URL은 null일 수도 있으니 | null 추가
    detoxTime: number; // <-- DTO 타입이 Integer/int 이므로 number
    createdAt: string; // <-- DTO 타입이 LocalDateTime/String이므로 string
  }

  // 백엔드 API 호출 함수
  const fetchPendingVerifications = async ({
    pageParam = 0,
  }): Promise<VerificationPage> => {
    const apiUrl = `${ADMIN_VERIFICATIONS_API_URL}?page=${pageParam}&size=10&sort=createdAt,asc`;
    console.log("Requesting API:", apiUrl);

    // API URL 수정: '/api/admin/verifications' 사용, PENDING 상태는 기본으로 가져오도록 백엔드에서 처리하거나 파라미터 추가
    const response = await fetch(apiUrl, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }
    const data = await response.json();
    // 실제 응답 구조 확인 후 data 반환 방식 조정 필요!
    console.log("Fetched page:", pageParam, data); // 데이터 확인용 로그
    return data;
  };

  // useInfiniteQuery 훅 사용
  const {
    data, // 실제 데이터 (pages 배열 형태)
    fetchNextPage, // 다음 페이지 로드 함수
    hasNextPage, // 다음 페이지 존재 여부
    isFetchingNextPage, // 다음 페이지 로딩 중 여부
    isFetching, // 초기 데이터 로딩 중 여부 (isFetchingNextPage 포함)
    refetch, // 데이터 새로고침 함수
  } = useInfiniteQuery({
    queryKey: ["adminVerifications"], // 쿼리 키
    queryFn: fetchPendingVerifications, // API 호출 함수
    initialPageParam: 0, // 초기 페이지 파라미터
    getNextPageParam: (lastPage) => {
      // 마지막 페이지면 undefined 반환, 아니면 다음 페이지 번호 반환
      return lastPage.last ? undefined : lastPage.number + 1;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (verificationId: number) => {
      const response = await fetch(
        `${ADMIN_VERIFICATIONS_API_URL}/${verificationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // 필요시 사용
          body: JSON.stringify({
            status: "APPROVED",
          } as VerificationStatusUpdateData), // 요청 본문
        }
      );

      if (!response.ok) {
        // 에러 처리 강화 (실제 에러 메시지 활용 등)
        const errorData = await response.text();
        console.error("승인 실패:", response.status, errorData);
        throw new Error(`승인 처리 실패: ${response.status}`);
      }
      // 성공 시 별도 데이터 반환 안 함 (백엔드 API가 void 반환)
    },
    onSuccess: () => {
      // 성공 시 캐시된 'adminVerifications' 쿼리를 무효화시켜서 목록을 새로고침
      console.log("승인 성공, 목록 새로고침");
      queryClient.invalidateQueries({ queryKey: ["adminVerifications"] });
    },
    onError: (error) => {
      // 에러 발생 시 사용자에게 알림 등 추가 처리 가능
      console.error("승인 처리 중 에러:", error);
      alert(`승인 처리 중 오류가 발생했습니다: ${error.message}`);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (verificationId: number) => {
      const response = await fetch(
        `${ADMIN_VERIFICATIONS_API_URL}/${verificationId}`,
        {
          method: "PATCH", // 백엔드 AdminVerificationV1Controller의 @PatchMapping 사용
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            status: "REJECTED",
          } as VerificationStatusUpdateData), // 상태를 REJECTED로 보냄
        }
      );
      if (!response.ok) {
        const errorData = await response.text();
        console.error("거절 실패:", response.status, errorData);
        throw new Error(`거절 처리 실패: ${response.status}`);
      }
    },
    onSuccess: () => {
      console.log("거절 성공, 목록 새로고침");
      // 성공 시 똑같이 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ["adminVerifications"] });
    },
    onError: (error) => {
      console.error("거절 처리 중 에러:", error);
      alert(`거절 처리 중 오류가 발생했습니다: ${error.message}`);
    },
  });

  // 실제 데이터 배열로 변환
  const requests = data?.pages.flatMap((page) => page.content) || [];

  // 마지막 요소 관찰 콜백 (무한 스크롤 트리거)
  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return; // 로딩 중이면 아무것도 안 함

      if (observerRef.current) {
        observerRef.current.disconnect(); // 기존 옵저버 연결 해제
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          console.log("마지막 요소 감지, 다음 페이지 로드");
          fetchNextPage();
        }
      });

      if (node) {
        observerRef.current.observe(node); // 새 노드에 옵저버 연결
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

  const deleteMutation = useMutation({
    // mutationFn은 postId를 인자로 받음
    mutationFn: async (postId: number) => {
      // 확인된 실제 백엔드 게시글 삭제 API 주소 사용
      const postDeleteApiUrl =
        `${process.env.NEXT_PUBLIC_API_BASE_URL}` + `/api/v1/posts/${postId}`;

      console.log("Requesting Post Delete API:", postDeleteApiUrl);

      const response = await fetch(postDeleteApiUrl, {
        method: "DELETE", // DELETE 메소드 사용
        credentials: "include", // 필요시 사용
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("게시글 삭제 실패:", response.status, errorData);
        // 실제 에러 메시지를 포함하여 throw 하는 것이 더 좋음
        throw new Error(
          `게시글 삭제 처리 실패: ${response.status} - ${errorData}`
        );
      }
      // DELETE 성공 시 보통 응답 본문이 없으므로 (204 No Content), 별도 파싱 불필요
      console.log(`Post (ID: ${postId}) deleted successfully.`);
    },
    onSuccess: (data, postId) => {
      // 성공 시 삭제된 postId도 받을 수 있음
      console.log(`삭제 성공 (Post ID: ${postId}), 목록 새로고침`);
      // 삭제 성공 후 관리자 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ["adminVerifications"] });
    },
    onError: (error, postId) => {
      // 실패 시 postId도 받을 수 있음
      console.error(`삭제 처리 중 에러 (Post ID: ${postId}):`, error);
      alert(`삭제 처리 중 오류가 발생했습니다: ${error.message}`);
    },
  });

  // 삭제 버튼 클릭 핸들러 - postId를 받도록 수정
  const handleDelete = (
    postId: number | undefined | null,
    verificationId: number
  ) => {
    if (!postId) {
      console.error("게시글 ID가 없습니다.");
      return;
    }
    deleteMutation.mutate(postId);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 헤더 */}
        <header className="bg-white shadow-sm px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            도파민 디톡스 인증 관리
          </h2>
        </header>

        {/* 메인 콘텐츠 영역 */}
        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                승인 대기 중인 요청
              </h2>
              <p className="text-sm text-gray-500">
                총 {data?.pages[0]?.totalElements ?? requests.length}개의 요청이
                있습니다.
              </p>
            </div>
          </div>

          {/* 인증 요청 목록 */}
          {/* 초기 로딩 중 표시 */}
          {isFetching && !isFetchingNextPage && requests.length === 0 && (
            <div className="flex justify-center items-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F742CD]"></div>
            </div>
          )}

          {/* 데이터 없을 때 표시 */}
          {!isFetching && requests.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-sm p-6">
              {/* ... (기존 '요청 없음' UI) ... */}
              <h3 className="text-lg font-medium text-gray-800">
                승인 대기 중인 요청이 없습니다.
              </h3>
            </div>
          )}

          {/* 목록 표시 */}
          {requests.length > 0 && (
            <div className="space-y-6">
              {requests.map((request, index) => {
                // request 객체 타입 확인 및 안전한 접근 필요
                if (!request) return null;

                // 마지막 요소에 ref 연결
                const isLastElement = index === requests.length - 1;

                if (request.verificationImageUrl) {
                  console.log(
                    ">> 인증 이미지 URL:",
                    request.verificationImageUrl
                  );
                } else {
                  // URL이 없을 때도 로그를 남겨서 확인!
                  console.log(
                    ">> 인증 이미지 URL for request ID " +
                      request.verificationId +
                      " is NULL or EMPTY"
                  );
                }
                return (
                  <div
                    key={request.verificationId}
                    ref={isLastElement ? lastItemRef : null} // <<--- 이 부분 추가!
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-600">
                          요청 ID: {request.verificationId}
                        </span>
                        <span className="text-gray-600">
                          {/* user 객체가 중첩되어 있다면 request.user?.nickname */}
                          닉네임: {request.userNickname}
                        </span>
                        <span className="text-gray-600">
                          디톡스 시간: {request.detoxTime}시간
                        </span>
                      </div>
                      <span className="text-gray-500">
                        {formatTime(request.createdAt)}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="w-full max-w-sm h-auto rounded overflow-hidden border border-gray-200">
                        <img
                          // post 객체가 중첩되어 있다면 request.post?.verificationImageUrl
                          src={
                            request.verificationImageUrl || "/placeholder.png"
                          } // 이미지가 없을 경우 대비
                          alt="인증 이미지"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleApprove(request.verificationId)}
                          className="px-6 py-3 bg-green-500 text-white text-base font-medium rounded hover:bg-green-600 transition-colors cursor-pointer !rounded-button whitespace-nowrap"
                        >
                          <FontAwesomeIcon icon={faCheck} className="mr-2" />{" "}
                          승인
                        </button>
                        <button
                          onClick={() => handleReject(request.verificationId)}
                          className="px-6 py-3 bg-red-500 text-white text-base font-medium rounded hover:bg-red-600 transition-colors cursor-pointer !rounded-button whitespace-nowrap"
                        >
                          <FontAwesomeIcon icon={faTimes} className="mr-2" />
                          거절
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(request.postId, request.verificationId)
                          }
                          className="px-6 py-3 bg-gray-500 text-white text-base font-medium rounded hover:bg-gray-600 transition-colors cursor-pointer !rounded-button whitespace-nowrap"
                        >
                          <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />{" "}
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 로딩 상태 및 더 이상 데이터 없음 표시 */}
          {/* 다음 페이지 로딩 중 */}
          {isFetchingNextPage && (
            <div className="flex justify-center items-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F742CD]"></div>
              <span className="ml-2 text-gray-600">로딩 중...</span>
            </div>
          )}

          {/* 더 이상 데이터 없음 */}
          {!isFetchingNextPage && !hasNextPage && requests.length > 0 && (
            <div className="text-center py-6 text-gray-500 text-sm">
              더 이상 요청이 없습니다.
            </div>
          )}
          {/* "더 보기" 버튼은 IntersectionObserver 사용 시 필요 없음 (삭제) */}
        </main>
      </div>
    </div>
  );
};

export default AdminVerificationPage;
