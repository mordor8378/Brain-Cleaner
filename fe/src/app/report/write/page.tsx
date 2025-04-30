"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { toast } from "react-hot-toast";

interface ReportPageProps {
  postId: number;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function ReportPage({
  postId,
  onClose,
  onSuccess,
}: ReportPageProps) {
  const router = useRouter();
  const { user } = useUser();
  const isAdmin = user?.role === "ROLE_ADMIN";
  const [reason, setReason] = useState("");
  const reasonTextareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    if (!textarea) return;
    textarea.style.height = "24px";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    if (reasonTextareaRef.current) {
      autoResizeTextarea(reasonTextareaRef.current);
    }
  }, [reason]);

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!reason || reason.length < 5) {
      // 백엔드 validation (5자 이상) 반영
      toast.error("신고 사유를 5자 이상 입력해주세요.");
      if (reasonTextareaRef.current) {
        reasonTextareaRef.current.focus();
      }
      return;
    }
    if (reason.length > 1000) {
      // 백엔드 validation (1000자 이하) 반영
      toast.error("신고 사유는 1000자 이하로 입력해주세요.");
      if (reasonTextareaRef.current) {
        reasonTextareaRef.current.focus();
      }
      return;
    }

    // 백엔드 API 호출
    try {
      // API 주소 - 필요시 http://localhost:8090 와 같이 전체 주소로 변경
      const apiUrl =
        `${process.env.NEXT_PUBLIC_API_BASE_URL}` + "/api/v1/reports";

      // 보낼 데이터 준비 (postId와 reason 사용)
      const reportData = {
        postId: postId, // 컴포넌트 prop으로 받아온 postId 사용
        reason: reason, // state 변수 reason 사용
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 다른 필요한 헤더가 있다면 여기에 추가 (예: CSRF 토큰)
        },
        credentials: "include", //
        body: JSON.stringify(reportData), // 데이터를 JSON 문자열로 변환
      });

      // 응답 처리
      if (response.ok || response.status === 201) {
        // 성공 (200 OK 또는 201 Created)
        const responseData = await response.json(); // 백엔드에서 createdReportId를 반환하므로 받을 수 있음
        console.log("신고 등록 성공, Report ID:", responseData);
        if (onSuccess) {
          onSuccess(); // 성공 콜백 호출
        }
        if (onClose) {
          onClose(); // 모달 닫기 콜백 호출
        } else {
          router.push("/"); // 페이지로 사용될 경우 홈으로 이동
        }
      } else {
        // 실패 처리 (백엔드에서 보낸 에러 메시지 활용 가능)
        const errorData = await response.json().catch(() => null); // 에러 응답 본문이 없을 수도 있음
        console.error("신고 등록 실패:", response.status, errorData);
        // 백엔드 ApiException에 따른 에러 메시지 분기
        let errorMessage = "신고 등록 중 오류가 발생했습니다.";
        if (errorData && errorData.message) {
          if (errorData.code === "CANNOT_REPORT_OWN_POST") {
            errorMessage = "자신의 게시글은 신고할 수 없습니다.";
          } else {
            errorMessage = errorData.message; // 백엔드에서 보내준 메시지 사용
          }
        } else if (response.status === 401) {
          errorMessage = "로그인이 필요합니다.";
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      // 네트워크 오류 등 fetch 자체의 에러 처리
      console.error("API 호출 중 에러 발생:", error);
      toast.error("신고 처리 중 네트워크 오류가 발생했습니다.");
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-md shadow-md min-h-[600px] max-h-[90vh] overflow-y-auto">
      {/* 상단 헤더 - 게시판 선택과 취소/등록 버튼 */}
      <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
        <button
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-700 font-medium w-20"
        >
          취소
        </button>
        <h1 className="font-bold text-lg text-gray-900">게시글 신고</h1>
        <button
          onClick={handleSubmit}
          className="text-pink-500 hover:text-pink-600 font-medium w-20"
        >
          신고
        </button>
      </div>

      <div className="flex flex-1">
        {/* 프로필 영역 */}
        <div className="p-4 relative">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-400"
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
          {/* 세로 구분선 - 프로필 사진 아래부터 시작 */}
          <div className="absolute left-1/2 top-16 h-full w-px bg-gray-200"></div>
        </div>

        {/* 게시글 작성 폼 */}
        <div className="flex-1 pt-4 pr-4 pb-4">
          <div className="space-y-3">
            <div>
              <p className="font-bold text-gray-900">
                {user?.nickname || "username"}
              </p>
            </div>
            <textarea
              ref={reasonTextareaRef}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="신고 사유를 입력해주세요 (5자 이상)"
              className="w-full border-0 resize-none focus:outline-none placeholder:text-gray-500 py-1 text-black [caret-color:#F742CD]  min-h-[150px]"
              rows={5}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
