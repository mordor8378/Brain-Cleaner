import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";
import CommentModal from "./CommentModal";
import ReportPage from "@/app/report/write/page";
import {
  convertEmojiCodesToImages,
  fetchPurchasedEmojis,
  useGlobalEmojis,
  Emoji,
} from "@/utils/emojiUtils";
import { getProfilePath } from "@/utils/profileHelpers";

export interface PostProps {
  postId: number;
  userId: number;
  userNickname: string;
  title: string;
  content: string;
  imageUrl: string[] | string;
  likeCount: number;
  commentCount: number;
  verificationImageUrl: string;
  detoxTime: number;
  createdAt: string;
  updatedAt: string;
  onUpdate?: () => void;
  onLike: (postId: number) => void;
  onUnlike: (postId: number) => void;
  likedByCurrentUser: boolean;
  onDelete?: (postId: number) => void;
  onCommentUpdate?: (count: number) => void;
  userProfileImage?: string | null;
  userRole: string;
  viewCount?: number;
}

export default function Post({
  postId,
  userId,
  userNickname,
  title,
  content,
  imageUrl,
  likeCount,
  commentCount,
  verificationImageUrl,
  detoxTime,
  createdAt,
  updatedAt,
  onUpdate,
  onLike,
  onUnlike,
  likedByCurrentUser,
  onDelete,
  onCommentUpdate,
  userProfileImage,
  userRole,
  viewCount,
}: PostProps) {
  const router = useRouter();
  const { user } = useUser();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedContent, setEditedContent] = useState(content);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [isEmojiLoaded, setIsEmojiLoaded] = useState(false);
  const { globalEmojis, isLoading: isGlobalEmojisLoading } = useGlobalEmojis();
  const postRef = useRef<HTMLDivElement>(null);

  // 이미지 캐러셀을 위한 상태
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [parsedImageUrls, setParsedImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null); // 파일 입력을 위한 ref 추가

  // 이모티콘 로딩
  useEffect(() => {
    if (!isGlobalEmojisLoading) {
      setIsEmojiLoaded(true);
    }
  }, [isGlobalEmojisLoading]);

  // 문자열 또는 JSON 문자열로 전달된 imageUrl을 파싱
  useEffect(() => {
    if (!imageUrl) {
      setParsedImageUrls([]);
      return;
    }

    try {
      console.log("Post - 원본 이미지 URL 데이터:", imageUrl, typeof imageUrl);

      // 이미 배열인 경우
      if (Array.isArray(imageUrl)) {
        console.log("Post - 배열 형태의 이미지 URL:", imageUrl);

        // 배열 내 중복 URL 제거 (Set 사용)
        const uniqueUrls = [...new Set(imageUrl)];
        console.log("Post - 중복 제거 후 URL:", uniqueUrls);

        const validUrls = uniqueUrls.filter(
          (url) => url && typeof url === "string" && url.trim() !== ""
        );

        console.log("Post - 필터링된 유효한 URL 배열:", validUrls);
        setParsedImageUrls(validUrls);
        return;
      }

      // 문자열인 경우 추가 처리
      if (typeof imageUrl === "string") {
        console.log("Post - 문자열 이미지 URL 처리:", imageUrl);

        // JSON 배열 문자열인지 확인 (예: "[\"url1\", \"url2\"]")
        if (imageUrl.trim().startsWith("[") && imageUrl.trim().endsWith("]")) {
          try {
            const parsed = JSON.parse(imageUrl);
            console.log("Post - JSON 파싱 결과:", parsed);

            if (Array.isArray(parsed)) {
              // 배열 내 중복 URL 제거 (Set 사용)
              const uniqueUrls = [...new Set(parsed)];
              console.log("Post - JSON 중복 제거 후 URL:", uniqueUrls);

              const validUrls = uniqueUrls.filter(
                (url) => url && typeof url === "string" && url.trim() !== ""
              );

              console.log("Post - JSON에서 파싱된 유효한 URL 배열:", validUrls);
              setParsedImageUrls(validUrls);
              return;
            }
          } catch (error) {
            console.error("Post - JSON 파싱 오류:", error);
          }
        }

        // 일반 문자열 URL인 경우
        if (imageUrl.trim() !== "") {
          console.log("Post - 일반 문자열 URL 추가:", imageUrl);
          setParsedImageUrls([imageUrl]);
          return;
        }
      }

      // 위 조건 모두 충족하지 않으면 빈 배열로 설정
      console.log("Post - 지원되지 않는 이미지 URL 형식, 빈 배열 설정");
      setParsedImageUrls([]);
    } catch (error) {
      console.error("Post - 이미지 URL 파싱 중 오류:", error);
      setParsedImageUrls([]);
    }
  }, [imageUrl]);

  // 프로필 이미지 URL 가져오기
  const [profileImage, setProfileImage] = useState<string | null>(
    userProfileImage || null
  );

  // 프로필 이미지가 props로 전달되지 않았을 경우 API에서 가져오기
  useEffect(() => {
    if (user?.id) {
      if (!userProfileImage && userId) {
        const fetchUserProfile = async () => {
          try {
            const response = await fetch(
              `http://localhost:8090/api/v1/users/${userId}`,
              {
                credentials: "include",
              }
            );

            if (response.ok) {
              const userData = await response.json();
              if (userData.profileImageUrl) {
                setProfileImage(userData.profileImageUrl);
              }
            }
          } catch (error) {
            console.error("프로필 이미지를 가져오는 중 오류 발생:", error);
          }
        };

        fetchUserProfile();
      }
    }
  }, [userId, userProfileImage]);

  useEffect(() => {
    console.log("Post component rendered with id:", postId);
  }, [postId]);

  useEffect(() => {
    console.log("Post verification data:", {
      verificationImageUrl,
      detoxTime,
      content,
    });
  }, [verificationImageUrl, detoxTime, content]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (postRef.current && !postRef.current.contains(event.target as Node)) {
        if (isEditingTitle) {
          setIsEditingTitle(false);
          setEditedTitle(title);
        }
        if (isEditingContent) {
          setIsEditingContent(false);
          setEditedContent(content);
        }
        setError(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditingTitle, isEditingContent, title, content]);

  const handleEditTitle = () => {
    if (user?.id !== userId) {
      alert("자신의 게시글만 수정할 수 있습니다.");
      return;
    }
    setIsEditingTitle(true);
    setEditedTitle(title);
  };

  const handleEditContent = () => {
    if (user?.id !== userId) {
      alert("자신의 게시글만 수정할 수 있습니다.");
      return;
    }
    setIsEditingContent(true);
    setEditedContent(content);
  };

  const handleSaveTitle = async () => {
    if (!postId) {
      console.error("Post ID is undefined");
      setError("게시글 ID가 없습니다.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8090/api/v1/posts/${postId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: editedTitle,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("게시글 수정에 실패했습니다.");
      }

      setIsEditingTitle(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating post:", error);
      setError(
        error instanceof Error
          ? error.message
          : "게시글 수정 중 오류가 발생했습니다."
      );
    }
  };

  const handleSaveContent = async () => {
    if (!postId) {
      console.error("Post ID is undefined");
      setError("게시글 ID가 없습니다.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8090/api/v1/posts/${postId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            content: editedContent,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("게시글 수정에 실패했습니다.");
      }

      setIsEditingContent(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating post:", error);
      setError(
        error instanceof Error
          ? error.message
          : "게시글 수정 중 오류가 발생했습니다."
      );
    }
  };

  // 시간 경과 표시 함수
  const getTimeAgo = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return "방금 전";
  };

  // 댓글 모달이 닫힐 때 댓글 수 업데이트
  const handleCommentModalClose = () => {
    setShowCommentModal(false);
  };

  const openReportModal = () => {
    console.log("신고 팝업 열기 postId: ", postId);
    setShowReportModal(true);
  };

  const handleCommentCountUpdate = (count: number) => {
    if (onCommentUpdate) {
      onCommentUpdate(count);
    }
  };

  // 이미지 캐러셀 이전 이미지로 이동
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    setCurrentImageIndex((prev) =>
      prev === 0 ? parsedImageUrls.length - 1 : prev - 1
    );
  };

  // 이미지 캐러셀 다음 이미지로 이동
  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    setCurrentImageIndex((prev) =>
      prev === parsedImageUrls.length - 1 ? 0 : prev + 1
    );
  };

  // 특정 이미지로 직접 이동
  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // 이미지 업로드 핸들러 추가
  const handleImageClick = () => {
    if (user?.id === userId && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();

    // 모든 선택된 파일을 FormData에 추가
    for (let i = 0; i < files.length; i++) {
      formData.append("postImage", files[i]);
    }

    // 기존 이미지 URL 배열을 유지하기 위해 imageUrl을 PostPatchRequestDto에 포함
    const currentImageUrls = parsedImageUrls.length > 0 ? parsedImageUrls : [];

    // 중복 이미지 URL 제거
    const uniqueImageUrls = [...new Set(currentImageUrls)];
    console.log("이미지 업데이트시 중복 제거된 URL:", uniqueImageUrls);

    formData.append(
      "postPatchRequestDto",
      new Blob([JSON.stringify({ imageUrl: uniqueImageUrls })], {
        type: "application/json",
      })
    );

    try {
      console.log(
        "이미지 업데이트 시작 - 기존 이미지:",
        uniqueImageUrls.length,
        "개"
      );

      const response = await fetch(
        `http://localhost:8090/api/v1/posts/${postId}`,
        {
          method: "PATCH",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("이미지 업데이트 응답 오류:", errorData);
        throw new Error(errorData.message || "이미지 업데이트 실패");
      }

      if (onUpdate) {
        onUpdate();
      }

      alert("이미지가 성공적으로 업로드되었습니다.");
    } catch (error) {
      console.error("이미지 업데이트 중 오류:", error);
      alert("이미지 업데이트에 실패했습니다.");
    }
  };

  return (
    <div className="p-5" ref={postRef}>
      <div className="flex items-start mb-3">
        <Link href={getProfilePath(user, userId)}>
          <div className="mr-3 cursor-pointer relative w-8 h-8">
            {profileImage ? (
              <Image
                src={profileImage}
                alt={`${userNickname}의 프로필`}
                width={32}
                height={32}
                className="rounded-full object-cover w-8 h-8"
                unoptimized={true}
              />
            ) : (
              <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
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
            )}
          </div>
        </Link>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-1.5">
              <Link href={getProfilePath(user, userId)}>
                <span className="font-bold text-[14px] text-gray-900 cursor-pointer hover:text-pink-500">
                  {userNickname}
                </span>
              </Link>
              <span className="text-xs text-gray-500">
                • {getTimeAgo(createdAt)}
                {updatedAt && updatedAt !== createdAt && (
                  <span className="ml-1">• 수정됨</span>
                )}
              </span>
              <span className="ml-1 text-xs text-green-500">
                <svg
                  className="w-3.5 h-3.5 inline"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </span>
            </div>
            <div className="group">
              {(user?.id === userId || user?.role === "ROLE_ADMIN") && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="group relative">
        {isEditingTitle ? (
          <div className="flex items-start">
            <h3 className="flex-1">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full text-lg font-semibold text-gray-900 focus:outline-none [caret-color:#F742CD] bg-transparent"
                style={{ minHeight: "inherit", height: "auto" }}
                autoFocus
              />
            </h3>
            <button
              onClick={handleSaveTitle}
              className="ml-2 text-sm text-pink-500 hover:text-pink-600"
            >
              완료
            </button>
          </div>
        ) : (
          <div className="flex items-start">
            <h3 className="text-lg font-semibold text-gray-900 flex-1">
              {title}
            </h3>
            {user?.id === userId && (
              <div className="group">
                <button
                  onClick={handleEditTitle}
                  className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="group relative mt-2">
        {isEditingContent ? (
          <div className="flex items-start">
            <div className="flex-1">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full text-sm text-gray-700 focus:outline-none [caret-color:#F742CD] resize-none bg-transparent overflow-hidden"
                style={{ minHeight: "inherit", height: "auto" }}
                rows={1}
                autoFocus
              />
            </div>
            <button
              onClick={handleSaveContent}
              className="ml-2 text-sm text-pink-500 hover:text-pink-600"
            >
              완료
            </button>
          </div>
        ) : (
          <div className="flex items-start">
            <div className="text-sm text-gray-700 flex-1">
              {isEmojiLoaded ? (
                <>
                  {(() => {
                    if (
                      typeof detoxTime === "number" &&
                      !isNaN(detoxTime) &&
                      detoxTime > 0
                    ) {
                      return `detoxed for ${detoxTime} hours`;
                    }

                    if (!content) {
                      return "";
                    }

                    // 이모티콘 변환 함수
                    return convertEmojiCodesToImages(content, globalEmojis);
                  })()}
                </>
              ) : (
                // 이모티콘 로딩 중에는 원본 텍스트 표시
                <p>
                  {(() => {
                    if (
                      typeof detoxTime === "number" &&
                      !isNaN(detoxTime) &&
                      detoxTime > 0
                    ) {
                      return `detoxed for ${detoxTime} hours`;
                    }
                    return content || "";
                  })()}
                </p>
              )}
            </div>
            {user?.id === userId && (
              <button
                onClick={handleEditContent}
                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {parsedImageUrls.length > 0 && (
        <div className="rounded-lg overflow-hidden mb-3 mt-3 relative group">
          <div className="relative">
            <Image
              src={parsedImageUrls[currentImageIndex] || ""}
              alt="게시글 이미지"
              width={500}
              height={300}
              className="w-full h-auto object-cover"
              unoptimized={true}
              onError={(e) => {
                console.error(
                  "이미지 로드 실패:",
                  parsedImageUrls[currentImageIndex]
                );
                console.log("전체 이미지 URL 배열:", parsedImageUrls);
                // 이미지 로드 실패 시 오류 메시지 표시
                const container = (e.target as HTMLImageElement).parentElement;
                if (container) {
                  const errorMsg = document.createElement("div");
                  errorMsg.className = "text-red-500 text-sm p-4 text-center";
                  errorMsg.textContent = "이미지를 불러올 수 없습니다";
                  container.appendChild(errorMsg);
                }
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />

            {/* 이미지 내부 좌/우 화살표 - 여러 이미지일 때만 표시 */}
            {parsedImageUrls.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white rounded-full p-2 hover:bg-opacity-80"
                  aria-label="이전 이미지"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white rounded-full p-2 hover:bg-opacity-80"
                  aria-label="다음 이미지"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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

            {user?.id === userId && (
              <button
                onClick={handleImageClick}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-gray-200 bg-black bg-opacity-50 rounded-full p-1.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* 이미지 인디케이터 (이미지가 여러 장일 때만 표시) */}
          {parsedImageUrls.length > 1 && (
            <div className="flex justify-center mt-2 space-x-2 mb-2">
              {parsedImageUrls.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`w-3 h-3 rounded-full ${
                    index === currentImageIndex ? "bg-pink-500" : "bg-gray-300"
                  } transition-colors hover:bg-pink-400`}
                  aria-label={`이미지 ${index + 1}로 이동`}
                />
              ))}
            </div>
          )}

          {/* 파일 입력 추가 */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />

          {/* 디버깅용: 이미지 URL 정보 표시 */}
          <div className="text-xs text-gray-600 mt-1 text-center">
            이미지 {currentImageIndex + 1}/{parsedImageUrls.length}
          </div>
        </div>
      )}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              likedByCurrentUser ? onUnlike(postId) : onLike(postId)
            }
            className={`flex items-center gap-1 group ${
              likedByCurrentUser
                ? "text-pink-500"
                : "text-gray-400 hover:text-pink-500"
            } transition-colors`}
          >
            {likedByCurrentUser ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            )}
            <span className="text-sm">{likeCount}</span>
          </button>

          <button
            onClick={() => setShowCommentModal(true)}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M8 12h.01M12 12h.01M16 12h.01M3 12c0 4.97 4.03 9 9 9a9.863 9.863 0 004.255-.949L21 21l-1.395-4.72C20.488 15.042 21 13.574 21 12c0-4.97-4.03-9-9-9s-9 4.03-9 9z" />
            </svg>
            <span className="text-sm">{commentCount}</span>
          </button>
        </div>

        {user?.id !== userId && userRole !== "ROLE_ADMIN" && (
          <button
            onClick={openReportModal}
            className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors text-sm cursor-pointer"
          >
            <span className="flex items-center justify-center h-5 w-5">🚨</span>
            <span className="text-sm">신고</span>
          </button>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowDeleteConfirm(false)}
          ></div>
          <div className="relative bg-white rounded-2xl w-[320px] overflow-hidden">
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold text-black mb-2">
                게시글을 삭제하시겠어요?
              </h3>
              <p className="text-sm text-gray-500">
                계정 설정에서 30일 이내에 이 게시물을 복원할 수 있으며, 이후에는
                게시물이 영구적으로 삭제됩니다. 게시물을 복원하면 해당 콘텐츠도
                복원됩니다.
              </p>
            </div>
            <div className="border-t divide-y">
              <button
                onClick={() => {
                  if (onDelete) {
                    onDelete(postId);
                  }
                  setShowDeleteConfirm(false);
                }}
                className="w-full py-3 text-sm font-semibold text-red-500 hover:bg-gray-50"
              >
                삭제
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-3 text-sm text-black hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 신고 모달 */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <ReportPage
            postId={postId}
            onClose={() => setShowReportModal(false)}
            onSuccess={() => {
              alert("신고가 접수되었습니다.");
              setShowReportModal(false);
            }}
          />
        </div>
      )}

      {/* 댓글 모달 */}
      {showCommentModal && (
        <CommentModal
          postId={postId}
          onClose={handleCommentModalClose}
          postImage={(() => {
            // 단일 이미지 URL도 배열 형태로 변환하여 전달
            console.log(
              "Post에서 CommentModal로 전달되는 imageUrl 원본:",
              imageUrl
            );
            if (!imageUrl) return "";

            // 이미 배열인 경우
            if (Array.isArray(imageUrl)) {
              // 빈 값 필터링
              const filteredUrls = imageUrl.filter(
                (url) => url && url.trim() !== ""
              );
              return filteredUrls.length > 0
                ? JSON.stringify(filteredUrls)
                : "";
            }

            // 이미 JSON 배열 형태인지 확인
            if (
              typeof imageUrl === "string" &&
              imageUrl.startsWith("[") &&
              imageUrl.endsWith("]")
            ) {
              try {
                // JSON 파싱이 가능한지 확인
                const parsed = JSON.parse(imageUrl);
                if (Array.isArray(parsed)) {
                  // 배열 내 중복 제거
                  const uniqueUrls = [...new Set(parsed)];
                  const filteredUrls = uniqueUrls.filter(
                    (url) => url && url.trim() !== ""
                  );
                  return filteredUrls.length > 0
                    ? JSON.stringify(filteredUrls)
                    : "";
                }
              } catch (e) {
                console.error("JSON 파싱 오류:", e);
              }
            }

            // 단일 URL인 경우 배열로 변환 - 실제 URL만 사용
            if (typeof imageUrl === "string" && imageUrl.trim() !== "") {
              const arrayFormat = JSON.stringify([imageUrl]);
              console.log(
                "Post에서 CommentModal로 전달되는 변환된 이미지 배열:",
                arrayFormat
              );
              return arrayFormat;
            }

            return "";
          })()}
          postContent={content}
          userNickname={userNickname}
          createdAt={createdAt}
          isOwnPost={user?.id === userId}
          onUpdate={handleCommentCountUpdate}
          detoxTime={detoxTime}
          onImageUpdate={async (files) => {
            const formData = new FormData();

            if (Array.isArray(files)) {
              // 배열로 전달된 경우 각 파일 추가
              for (let i = 0; i < files.length; i++) {
                formData.append("postImage", files[i]);
              }
            } else if (files) {
              // 단일 파일로 전달된 경우
              formData.append("postImage", files);
            }

            // 빈 객체라도 PostPatchRequestDto 필요
            formData.append(
              "postPatchRequestDto",
              new Blob([JSON.stringify({})], {
                type: "application/json",
              })
            );

            try {
              const response = await fetch(
                `http://localhost:8090/api/v1/posts/${postId}`,
                {
                  method: "PATCH",
                  credentials: "include",
                  body: formData,
                }
              );

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("이미지 업데이트 응답 오류:", errorData);
                throw new Error(errorData.message || "이미지 업데이트 실패");
              }

              if (onUpdate) {
                onUpdate();
              }
            } catch (error) {
              console.error("이미지 업데이트 중 오류:", error);
              alert("이미지 업데이트에 실패했습니다.");
            }
          }}
          userProfileImage={userProfileImage}
          userId={userId}
        />
      )}
    </div>
  );
}
