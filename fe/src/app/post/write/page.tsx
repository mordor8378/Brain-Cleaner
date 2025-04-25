"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import Image from "next/image";

interface WritePostPageProps {
  onClose?: () => void;
  onSuccess?: () => void;
  onCategoryChange?: (category: string) => void;
  initialCategory?: string;
}

export default function WritePostPage({
  onClose,
  onSuccess,
  onCategoryChange,
  initialCategory = "2",
}: WritePostPageProps) {
  const router = useRouter();
  const { user } = useUser();
  const isAdmin = user?.role === "ROLE_ADMIN";
  const [category, setCategory] = useState(initialCategory);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    if (!textarea) return;
    textarea.style.height = "24px";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    if (titleTextareaRef.current) {
      autoResizeTextarea(titleTextareaRef.current);
    }
    if (contentTextareaRef.current) {
      autoResizeTextarea(contentTextareaRef.current);
    }
  }, [title, content]);

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // 다중 파일 업로드 처리
      Array.from(files).forEach((file) => {
        // 파일 크기 제한 (10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert("파일 크기는 10MB를 초과할 수 없습니다.");
          return;
        }

        // 이미지 파일 타입 체크
        if (!file.type.startsWith("image/")) {
          alert("이미지 파일만 업로드 가능합니다.");
          return;
        }

        const formData = new FormData();
        formData.append("file", file);

        // S3 업로드 엔드포인트 사용
        fetch("http://localhost:8090/api/v1/s3/upload", {
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
          .then((imageUrl) => {
            console.log("Uploaded image URL:", imageUrl);
            setImageUrls((prev) => [...prev, imageUrl]);
          })
          .catch((error) => {
            console.error("Error uploading image:", error);
            alert("이미지 업로드에 실패했습니다.");
          });
      });
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    if (onCategoryChange) {
      onCategoryChange(newCategory);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!title || !content) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      // FormData 객체 생성
      const formData = new FormData();

      // PostRequestDto 객체를 JSON 문자열로 변환 후 Blob으로 변환하여 추가
      const postRequestDto = {
        title,
        content,
        imageUrl: imageUrls.length > 0 ? JSON.stringify(imageUrls) : "",
      };

      // RequestPart로 전송하기 위해 JSON 문자열을 Blob으로 변환 후 첨부
      const postRequestDtoBlob = new Blob([JSON.stringify(postRequestDto)], {
        type: "application/json",
      });
      formData.append("postRequestDto", postRequestDtoBlob);

      // 이미지가 있을 경우 파일 입력에서 직접 파일을 가져와 추가
      if (
        fileInputRef.current?.files &&
        fileInputRef.current.files.length > 0
      ) {
        formData.append("postImage", fileInputRef.current.files[0]);
      }

      const res = await fetch(
        `http://localhost:8090/api/v1/posts/category/${category}`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (res.ok) {
        alert("게시글 등록 완료!");
        if (onSuccess) {
          onSuccess();
        }
        if (onClose) {
          onClose();
        } else {
          router.push("/");
        }
      } else {
        const errorText = await res.text();
        console.error("게시글 등록 실패:", errorText);
        alert(`등록 실패: ${res.status}`);
      }
    } catch (error) {
      console.error("게시글 등록 중 오류 발생:", error);
      alert("게시글 등록 중 오류가 발생했습니다");
    }
  };

  // 이미지 캐러셀 이전 이미지로 이동
  const handlePrevImage = () => {
    setCurrentPreviewIndex((prev) =>
      prev === 0 ? imageUrls.length - 1 : prev - 1
    );
  };

  // 이미지 캐러셀 다음 이미지로 이동
  const handleNextImage = () => {
    setCurrentPreviewIndex((prev) =>
      prev === imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  // 특정 이미지 제거
  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, index) => index !== indexToRemove));
    if (currentPreviewIndex >= indexToRemove && currentPreviewIndex > 0) {
      setCurrentPreviewIndex((prev) => prev - 1);
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
            {isAdmin && <option value="4">공지사항</option>}
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
            <textarea
              ref={titleTextareaRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className={`w-full border-0 resize-none focus:outline-none placeholder:text-gray-500 py-1 text-black [caret-color:#F742CD] ${
                title ? "font-semibold" : "font-normal"
              }`}
            />
            <div className="space-y-1">
              <textarea
                ref={contentTextareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  category === "2"
                    ? "도파민 디톡스와 관련된 유용한 정보를 공유해주세요."
                    : "자유롭게 작성해주세요."
                }
                className="w-full border-0 resize-none focus:outline-none placeholder:text-gray-500 py-1 text-black [caret-color:#F742CD]"
              />
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
                multiple
              />
            </div>
            {imageUrls.length > 0 && (
              <div className="relative mt-4">
                <div className="overflow-hidden rounded-lg">
                  <div className="relative">
                    <img
                      src={imageUrls[currentPreviewIndex]}
                      alt="첨부 이미지"
                      className="w-full rounded-lg"
                    />
                    {/* 이미지 내부 좌/우 화살표 */}
                    {imageUrls.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleRemoveImage(currentPreviewIndex)}
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
                  {/* 이미지 인디케이터 */}
                  {imageUrls.length > 1 && (
                    <div className="flex justify-center mt-2 space-x-1">
                      {imageUrls.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPreviewIndex(index)}
                          className={`w-2 h-2 rounded-full ${
                            index === currentPreviewIndex
                              ? "bg-pink-500"
                              : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
