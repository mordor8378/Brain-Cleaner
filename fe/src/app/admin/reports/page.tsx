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
import Link from "next/link";

// PATCH 요청 본문 타입 정의
interface VerificationStatusUpdateData {
  status: "APPROVED" | "REJECTED";
}

const AdminReportPage: React.FC = () => {
  // 가상의 인증 요청 데이터

  // 인증 요청 처리 함수 (내용은 나중에 채움)
  const handleApprove = (reportId: number) => {
    approveMutation.mutate(reportId);
  };
  const handleReject = (reportId: number) => {
    rejectMutation.mutate(reportId);
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

  // 백엔드 API 응답 타입 정의 (예상)
  interface Report {
    reportId: number; // 신고 ID
    reason: string; // 신고 사유
    status: "PENDING" | "APPROVED" | "REJECTED"; // 신고 상태
    createdAt: string; // 신고 생성 시간
    reporterId: number; // 신고자 ID
    reporterNickname: string; // 신고자 닉네임
    reportedPostId: number; // 신고된 게시글 ID
    reportedPostTitle: string; // 신고된 게시글 제목
    reportedPostContent: string; // 신고된 게시글 내용
    reportedPostAuthorId: number; // 신고된 게시글 작성자 ID
    reportedPostAuthorNickname: string; // 신고된 게시글 작성자 닉네임
    reportedPostCategoryName: string; // 신고된 게시글 카테고리 이름
    reportedPostImageUrl: string | null; // 신고된 게시글 이미지 URL
  }

  interface ReportPage {
    content: Report[]; // Report 타입의 배열
    last: boolean; // 마지막 페이지 여부
    number: number; // 현재 페이지 번호
    totalElements: number; // 총 신고 개수
  }

  // 백엔드 API 호출 함수
  const fetchReports = async (context: {
    pageParam?: number;
  }): Promise<ReportPage> => {
    const pageParam = context.pageParam ?? 0;
    const apiUrl =
      `${process.env.NEXT_PUBLIC_API_BASE_URL}` +
      `/api/admin/reports?page=${pageParam}&size=10&sort=createdAt,asc`;
    console.log("Requesting Admin Reports API:", apiUrl);

    try {
      const response = await fetch(apiUrl, {
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.text().catch(() => "No error body");
        console.error(
          `Admin Reports API 호출 실패: ${response.status}`,
          errorData
        );
        throw new Error(`API 호출 실패: ${response.status}`);
      }

      const data: ReportPage = await response.json();
      console.log("Fetched page:", pageParam, data);
      if (!data || !Array.isArray(data.content)) {
        console.error("API 응답 형식이 ReportPage와 다릅니다:", data);
        throw new Error("API 응답 형식이 올바르지 않습니다.");
      }
      return data;
    } catch (error) {
      console.error("데이터 fetching 중 에러 발생:", error);
      throw error;
    }
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
    queryKey: ["adminReports"],
    queryFn: fetchReports,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.last ? undefined : lastPage.number + 1;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (reportId: number) => {
      const apiUrl =
        `${process.env.NEXT_PUBLIC_API_BASE_URL}` +
        `/api/admin/reports/${reportId}/status`;

      console.log("Requesting Approve API:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 필요시 사용
        body: JSON.stringify({ reportStatus: "APPROVED" }), // 요청 본문
      });

      if (!response.ok) {
        // 에러 처리 강화 (실제 에러 메시지 활용 등)
        const errorData = await response.text().catch(() => "No error body");
        console.error("신고 처리 실패:", response.status, errorData);
        throw new Error(`신고 처리 실패: ${response.status}`);
      }
      // 성공 시 별도 데이터 반환 안 함 (백엔드 API가 void 반환)
    },
    onSuccess: (data, reportId) => {
      console.log(
        `신고 처리(승인) 성공 (Report ID: ${reportId}), 목록 새로고침`
      );
      queryClient.invalidateQueries({ queryKey: ["adminReports"] });
    },
    onError: (error, reportId) => {
      console.error(`신고 처리(승인) 중 에러 (Report ID: ${reportId}):`, error);
      alert(`신고 처리(승인) 중 오류가 발생했습니다: ${error.message}`);
    },
  });

  const rejectMutation = useMutation({
    // mutationFn: 신고 반려 API 호출 로직으로 변경
    mutationFn: async (reportId: number) => {
      // 파라미터 이름 reportId로 명확화
      // API 주소 확인! (프록시 사용 시 상대 경로, 아니면 전체 주소)
      const apiUrl =
        `${process.env.NEXT_PUBLIC_API_BASE_URL}` +
        `/api/admin/reports/${reportId}/status`;

      console.log("Requesting Reject API:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "PATCH", // <-- 메소드 변경!
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ reportStatus: "REJECTED" }), // <-- 요청 본문 변경!
      });

      if (!response.ok) {
        const errorData = await response.text().catch(() => "No error body");
        console.error("신고 반려 실패:", response.status, errorData);
        throw new Error(`신고 반려 실패: ${response.status}`);
      }
    },
    onSuccess: (data, reportId) => {
      // 파라미터 이름 reportId로 명확화
      console.log(`신고 반려 성공 (Report ID: ${reportId}), 목록 새로고침`);
      // 성공 시 'adminReports' 쿼리 무효화 -> 목록 자동 새로고침!
      queryClient.invalidateQueries({ queryKey: ["adminReports"] }); // <--- queryKey 수정!
    },
    onError: (error, reportId) => {
      // 파라미터 이름 reportId로 명확화
      console.error(`신고 반려 중 에러 (Report ID: ${reportId}):`, error);
      alert(`신고 반려 중 오류가 발생했습니다: ${error.message}`);
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}` +
        `/api/admin/posts/${postId}`;

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
      queryClient.invalidateQueries({ queryKey: ["adminReports"] });
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
            게시글 신고 관리
          </h2>
        </header>

        {/* 메인 콘텐츠 영역 */}
        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                처리 대기 중인 신고
              </h2>
              <p className="text-sm text-gray-500">
                총 {data?.pages[0]?.totalElements ?? requests.length}개의 신고가
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
                처리 중인 요청이 없습니다.
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
                return (
                  <div
                    key={request.reportId}
                    ref={isLastElement ? lastItemRef : null}
                    className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-4"
                  >
                    {/* 게시글 정보 섹션 */}
                    <div className="p-4 border-b border-gray-200">
                      {/* 카테고리, 제목, 작성자 정보 */}
                      <div className="flex justify-between items-start mb-2">
                        {" "}
                        {/* items-center -> items-start */}
                        <div className="flex-1 mr-4">
                          {" "}
                          {/* 제목 + 카테고리 묶기 */}
                          <span className="text-xs font-semibold text-pink-600 bg-pink-100 px-2 py-0.5 rounded mr-2">
                            {" "}
                            {/* 카테고리 표시 */}
                            {request.reportedPostCategoryName || "미분류"}{" "}
                            {/* 카테고리 없으면 '미분류' */}
                          </span>
                          <h3
                            className={`inline text-lg font-semibold break-words ${
                              !request.reportedPostId
                                ? "text-gray-500 italic"
                                : "text-gray-800"
                            }`}
                          >
                            {" "}
                            {/* 제목 */}
                            {request.reportedPostTitle}
                          </h3>
                        </div>
                        {/* ★★★ 작성자 정보 링크는 항상 표시! ★★★ */}
                        <Link
                          href={`/admin/users/${request.reportedPostAuthorId}`}
                          // authorId가 없을 경우 (백엔드 문제 등) 링크 비활성화 스타일 추가 가능
                          className={`text-sm ${
                            request.reportedPostAuthorId
                              ? "text-blue-600 hover:underline"
                              : "text-gray-500"
                          } flex-shrink-0 whitespace-nowrap`}
                          // authorId가 없으면 클릭 안 되게 막기 (옵션)
                          onClick={(e) =>
                            !request.reportedPostAuthorId && e.preventDefault()
                          }
                          aria-disabled={!request.reportedPostAuthorId}
                          tabIndex={
                            !request.reportedPostAuthorId ? -1 : undefined
                          }
                          style={
                            !request.reportedPostAuthorId
                              ? { pointerEvents: "none" }
                              : {}
                          }
                        >
                          작성자: {request.reportedPostAuthorNickname} (ID:{" "}
                          {request.reportedPostAuthorId ?? "N/A"}){" "}
                          {/* ID 없으면 N/A 표시 */}
                        </Link>
                      </div>

                      {/* 게시글 내용 */}
                      {request.reportedPostId && ( // 게시글 있을 때만 내용 표시
                        <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded mb-3">
                          {request.reportedPostContent}
                        </p>
                      )}

                      {/* 게시글 이미지 */}
                      {request.reportedPostId &&
                        request.reportedPostImageUrl && ( // 게시글 있고 이미지 URL도 있을 때만 표시
                          <div className="w-full max-w-sm h-auto rounded overflow-hidden border border-gray-200">
                            {" "}
                            {/* 이미지 크기 제한 */}
                            <img
                              src={request.reportedPostImageUrl}
                              alt="신고된 게시글 이미지"
                              className="w-full h-full object-contain" // contain으로 변경하여 이미지 비율 유지
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }} // 이미지 로드 실패 시 숨김
                            />
                          </div>
                        )}

                      {/* 게시글 삭제 완료 표시 */}
                      {!request.reportedPostId && (
                        <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded">
                          (삭제 완료된 게시글입니다)
                        </p>
                      )}
                    </div>

                    {/* 신고 정보 섹션 */}
                    <div className="p-4 bg-red-50 border-b border-red-200">
                      {/* 신고 제목, 신고자 정보 */}
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-md font-semibold text-red-700 flex-1 mr-4">
                          🚨 게시글 신고 사유
                        </h4>
                        <Link
                          href={`/admin/users/${request.reporterId}`} // <--- 프로필 주소 형식 확인 필요!
                          className="text-sm text-blue-600 hover:underline flex-shrink-0 whitespace-nowrap"
                        >
                          {" "}
                          {/* 링크 + 스타일 */}
                          신고자: {request.reporterNickname} (ID:{" "}
                          {request.reporterId})
                        </Link>
                      </div>
                      {/* 신고 사유 내용 */}
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {request.reason}
                      </p>
                    </div>

                    {/* 액션 버튼 섹션 */}
                    <div className="p-4 flex justify-end items-center space-x-3 bg-gray-50">
                      <span className="text-xs text-gray-500 mr-auto">
                        신고 시각: {formatTime(request.createdAt)}
                      </span>
                      {/* 버튼들 */}
                      <button
                        onClick={() => handleApprove(request.reportId)}
                        disabled={request.status !== "PENDING"}
                        className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                          request.status === "PENDING"
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <FontAwesomeIcon icon={faCheck} className="mr-1" /> 신고
                        처리
                      </button>
                      <button
                        onClick={() => handleReject(request.reportId)}
                        disabled={request.status !== "PENDING"}
                        className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                          request.status === "PENDING"
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <FontAwesomeIcon icon={faTimes} className="mr-1" /> 신고
                        반려
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(request.reportedPostId, request.reportId)
                        }
                        disabled={!request.reportedPostId} // 게시글 없으면 삭제 버튼 비활성화
                        className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                          !request.reportedPostId
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-gray-500 text-white hover:bg-gray-600"
                        }`}
                      >
                        <FontAwesomeIcon icon={faTrashAlt} className="mr-1" />{" "}
                        게시글 삭제
                      </button>
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

export default AdminReportPage;
