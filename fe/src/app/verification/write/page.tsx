"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { toast } from "react-hot-toast";
import Image from "next/image";

interface VerificationWritePageProps {
  onClose?: () => void;
  onSuccess?: () => void;
  onCategoryChange?: (category: string) => void;
}

interface VerificationPost {
  userId: number;
  title: string;
  content: string;
  imageUrl: string;
  detoxTime: number;
}

interface VerificationRequest {
  postId: number;
  userId: number;
  detoxTime: number;
  status: string;
}

export default function VerificationWritePage({
  onClose,
  onSuccess,
  onCategoryChange,
}: VerificationWritePageProps = {}) {
  const router = useRouter();
  const { user, mutate } = useUser();
  const [category, setCategory] = useState("1"); // 인증=1, 정보공유=2, 자유=3
  const [detoxTime, setDetoxTime] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Verification post data:", {
        imageUrl,
        detoxTime,
      });
    }
  }, [imageUrl, detoxTime]);

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      router.push("/");
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    if (onCategoryChange) {
      onCategoryChange(newCategory);
    }
  };

  const handleDetoxTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 빈 문자열이거나 음수인 경우 0으로 설정
    const numValue = Math.max(0, Number(value));
    if (!isNaN(numValue)) {
      setDetoxTime(numValue);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("파일 크기는 10MB를 초과할 수 없습니다.");
        return;
      }

      // 이미지 파일 타입 체크
      if (!file.type.startsWith("image/")) {
        toast.error("이미지 파일만 업로드 가능합니다.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      // S3 업로드 엔드포인트 사용
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}` + "/api/v1/s3/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      })
        .then((response) => {
          if (response.ok) {
            return response.text(); // 백엔드에서 문자열로 URL만 반환
          }
          throw new Error("이미지 업로드에 실패했습니다.");
        })
        .then((url) => {
          console.log("Uploaded image URL:", url);
          setImageUrl(url);
        })
        .catch((error) => {
          console.error("Error uploading image:", error);
          toast.error("이미지 업로드에 실패했습니다.");
        });
    }
  };

  const handleSubmit = async () => {
    if (!imageUrl || detoxTime <= 0) {
      toast.error("휴대폰 이용시간 캡쳐와 디톡스 시간을 모두 입력해야 합니다.");
      return;
    }

    const userId = user?.id || 1;

    try {
      // FormData 객체 생성
      const formData = new FormData();

      // VerificationPost 객체 생성
      const verificationPost = {
        userId,
        title: "도파민 디톡스 인증",
        content: detoxTime.toString(),
        imageUrl: [imageUrl], // 문자열 배열로 변환
        detoxTime: detoxTime,
        categoryId: parseInt(category),
      };

      // Blob으로 변환하여 추가
      const postRequestDtoBlob = new Blob([JSON.stringify(verificationPost)], {
        type: "application/json",
      });
      formData.append("postRequestDto", postRequestDtoBlob);

      // 이미지 파일이 있으면 추가 (선택 사항)
      if (
        fileInputRef.current?.files &&
        fileInputRef.current.files.length > 0
      ) {
        formData.append("postImage", fileInputRef.current.files[0]);
      }

      const postResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}` + `/api/v1/posts`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (postResponse.ok) {
        toast.success("인증이 완료되었습니다!");
        await mutate(); // 유저 정보 갱신

        if (onSuccess) {
          onSuccess();
        }
        if (onClose) {
          onClose();
        } else {
          router.push("/");
        }
      } else {
        // 에러 응답 처리
        const errorData = await postResponse.json();
        toast.error(
          `등록 실패: ${
            errorData.message || "오늘은 더 이상 인증글을 작성할 수 없습니다."
          }`
        );
      }
    } catch (error) {
      console.error("인증 게시글 등록 중 오류:", error);
      toast.error(
        "등록 실패: " + (error instanceof Error ? error.message : String(error))
      );
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
        <div className="relative">
          <select
            value={category}
            onChange={handleCategoryChange}
            className="appearance-none bg-transparent text-center text-gray-700 py-2 px-4 pr-8 focus:outline-none font-bold"
          >
            <option value="1">인증게시판</option>
            <option value="2">정보공유게시판</option>
            <option value="3">자유게시판</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="text-pink-500 hover:text-pink-600 font-medium w-20"
        >
          등록
        </button>
      </div>

      <div className="flex flex-1">
        {/* 프로필 영역 */}
        <div className="p-4 relative">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {user?.profileImage ? (
              <Image
                src={user.profileImage}
                alt={`${user?.nickname || "사용자"}의 프로필`}
                width={40}
                height={40}
                className="w-full h-full object-cover"
                unoptimized={true}
              />
            ) : (
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
            )}
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
            <div className="flex items-center">
              <input
                type="number"
                value={detoxTime}
                onChange={handleDetoxTimeChange}
                placeholder="0"
                min="0"
                className="w-16 text-right focus:outline-none text-black [caret-color:#F742CD]"
              />
              <span className="text-gray-900 ml-1">시간</span>
            </div>
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            {imageUrl && (
              <div className="relative mt-4">
                <img
                  src={imageUrl}
                  alt="스크린타임"
                  className="w-full rounded-lg"
                />
                <button
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
