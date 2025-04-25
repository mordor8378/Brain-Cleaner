import { useState, useEffect, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import { Comment, CommentRequestDto } from "@/types/comment";
import Image from "next/image";

interface CommentModalProps {
  postId: number;
  onClose: () => void;
  postImage?: string;
  postContent?: string;
  userNickname?: string;
  createdAt?: string;
  isOwnPost?: boolean;
  onUpdate?: (count: number) => void;
  onImageUpdate?: (newImage: File) => void;
  detoxTime?: number;
  userProfileImage?: string | null;
  userId?: number;
}

export default function CommentModal({
  postId,
  onClose,
  postImage,
  postContent,
  userNickname,
  createdAt,
  isOwnPost,
  onUpdate,
  onImageUpdate,
  detoxTime,
  userProfileImage,
  userId,
}: CommentModalProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedContent, setEditedContent] = useState(postContent || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(
    userProfileImage || null
  );

  // 댓글 작성자의 프로필 이미지 저장 객체
  const [userProfileImages, setUserProfileImages] = useState<
    Record<number, string | null>
  >({});

  // 이미지 캐러셀을 위한 상태
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [parsedImageUrls, setParsedImageUrls] = useState<string[]>([]);

  // 원글 작성자의 프로필 이미지 가져오기
  useEffect(() => {
    if (!userProfileImage && userId) {
      fetchUserProfile(userId, setProfileImage);
    }
  }, [userId, userProfileImage]);

  // 사용자 프로필 이미지를 가져오는 함수
  const fetchUserProfile = async (
    userId: number,
    setterFn: (url: string | null) => void
  ) => {
    try {
      const response = await fetch(
        `http://localhost:8090/api/v1/users/${userId}`,
        { credentials: "include" }
      );

      if (response.ok) {
        const userData = await response.json();
        if (userData.profileImageUrl) {
          setterFn(userData.profileImageUrl);
        }
      }
    } catch (error) {
      console.error("프로필 이미지를 가져오는 중 오류 발생:", error);
    }
  };

  // 댓글 목록 불러오기
  const fetchComments = async () => {
    try {
      const response = await fetch(
        `http://localhost:8090/api/v1/comments/${postId}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setComments(data);
        if (onUpdate) onUpdate(data.length);

        console.log("댓글 데이터:", data);

        // 댓글 작성자들의 프로필 이미지 가져오기
        if (data && data.length > 0) {
          // 각 댓글의 userId를 먼저 확인해서 로깅합니다
          console.log(
            "댓글 작성자 ID 목록:",
            data.map((c: Comment) => ({ id: c.userId, type: typeof c.userId }))
          );

          const uniqueUserIds = Array.from(
            new Set(
              data
                .filter(
                  (comment: Comment) =>
                    comment.userId !== undefined && comment.userId !== null
                )
                .map((comment: Comment) => Number(comment.userId))
            )
          ) as number[];

          console.log("필터링된 유니크 유저 IDs:", uniqueUserIds);

          if (uniqueUserIds.length > 0) {
            await fetchCommenterProfiles(uniqueUserIds);
          } else {
            console.log("프로필 이미지를 가져올 유저 ID가 없습니다");
          }
        } else {
          console.log("댓글 데이터가 비어있습니다");
        }

        return data;
      }
      return [];
    } catch (error) {
      console.error("댓글 로드 중 오류:", error);
      return [];
    }
  };

  // 댓글 작성자들의 프로필 이미지 가져오기
  const fetchCommenterProfiles = async (userIds: number[]) => {
    console.log("프로필 이미지 가져오기 요청된 사용자 ID들:", userIds);

    try {
      const promises = userIds.map((id) =>
        fetch(`http://localhost:8090/api/v1/users/${id}`, {
          credentials: "include",
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((userData) => {
            if (userData && userData.profileImageUrl) {
              console.log(
                `사용자 ID ${id}의 프로필 이미지 로드 성공:`,
                userData.profileImageUrl
              );
              return { id, profileImageUrl: userData.profileImageUrl };
            } else {
              console.log(`사용자 ID ${id}에 대한 프로필 이미지 없음`);
              return { id, profileImageUrl: null };
            }
          })
          .catch((err) => {
            console.error(`사용자 ID ${id} 프로필 정보 가져오기 실패:`, err);
            return { id, profileImageUrl: null };
          })
      );

      const userDataResults = await Promise.all(promises);
      const newProfileImages: Record<number, string | null> = {};

      userDataResults.forEach((result) => {
        if (result && result.id) {
          newProfileImages[result.id] = result.profileImageUrl;
        }
      });

      console.log("업데이트할 프로필 이미지:", newProfileImages);

      if (Object.keys(newProfileImages).length > 0) {
        setUserProfileImages((prev) => {
          const updatedImages = { ...prev, ...newProfileImages };
          console.log("최종 프로필 이미지 상태:", updatedImages);
          return updatedImages;
        });
      }
    } catch (error) {
      console.error("댓글 작성자 프로필 이미지 가져오기 실패:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  // 문자열 또는 JSON 문자열로 전달된 imageUrl을 파싱
  useEffect(() => {
    if (!postImage) {
      console.log("CommentModal - 이미지 없음");
      setParsedImageUrls([]);
      return;
    }

    try {
      // JSON 형식으로 된 문자열인지 확인
      if (postImage.startsWith("[") && postImage.endsWith("]")) {
        const parsed = JSON.parse(postImage);
        console.log("CommentModal - JSON 파싱 결과:", parsed);
        if (Array.isArray(parsed)) {
          setParsedImageUrls(parsed);
          console.log("CommentModal - 이미지 배열 설정:", parsed);
          return;
        }
      }
      // 단일 URL 문자열인 경우
      console.log("CommentModal - 단일 이미지 URL:", postImage);
      setParsedImageUrls([postImage]);
    } catch (e) {
      console.error("이미지 URL 파싱 오류:", e);
      setParsedImageUrls([postImage]); // 파싱 실패 시 원본 URL을 사용
    }
  }, [postImage]);

  // 이미지 배열이 변경될 때 현재 이미지 인덱스 리셋
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [parsedImageUrls]);

  // 댓글 작성
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    const commentData: CommentRequestDto = {
      content: newComment.trim(),
      parentId: replyToId,
    };

    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:8090/api/v1/comments/${postId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(commentData),
        }
      );

      if (response.ok) {
        setNewComment("");
        setReplyToId(null);

        // 현재 로그인한 사용자 정보를 미리 캐시에 추가
        if (user && user.id) {
          console.log(
            "댓글 작성 후 현재 사용자 프로필 이미지 캐싱:",
            user.id,
            user.profileImage
          );
          setUserProfileImages((prev) => ({
            ...prev,
            [user.id]: user.profileImage || null,
          }));
        }

        // 댓글을 바로 가져와서 화면 업데이트
        await fetchComments();

        // 0.5초 후 다시 한번 댓글과 프로필 이미지 로드
        setTimeout(async () => {
          const data = await fetchComments();
          if (data && data.length > 0) {
            // 댓글 작성자의 유저 ID 추출
            const commentUserIds = data
              .filter(
                (comment: Comment) =>
                  comment.userId !== undefined && comment.userId !== null
              )
              .map((comment: Comment) => Number(comment.userId));

            // 누락된 프로필 이미지만 다시 가져오기
            const missingUserIds = commentUserIds.filter(
              (id: number) => !userProfileImages[id] && id !== user?.id
            );

            if (missingUserIds.length > 0) {
              console.log("누락된 프로필 이미지 재요청:", missingUserIds);
              await fetchCommenterProfiles(missingUserIds);
            }
          }
        }, 500);
      }
    } catch (error) {
      console.error("댓글 작성 중 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8090/api/v1/comments/${commentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        // 댓글을 다시 가져와서 목록 및 프로필 이미지 갱신
        await fetchComments();

        // 0.5초 후 다시 한번 프로필 이미지 로드 (비동기 처리를 위한 추가 호출)
        setTimeout(() => {
          fetchComments();
        }, 500);
      }
    } catch (error) {
      console.error("댓글 삭제 중 오류:", error);
    }
  };

  // 시간 경과 표시 함수 수정
  const getTimeAgo = (dateString: string | undefined) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일`;
    if (hours > 0) return `${hours}시간`;
    if (minutes > 0) return `${minutes}분`;
    return "방금";
  };

  // 게시글 수정 함수
  const handleSaveContent = async () => {
    if (!postId) {
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
        onUpdate(comments.length);
      }
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  // 이미지 업데이트 핸들러
  const handleImageClick = () => {
    if (isOwnPost && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpdate) {
      onImageUpdate(file);
    }
  };

  // 이미지 캐러셀 이전 이미지로 이동
  const handlePrevImage = (e: React.MouseEvent) => {
    console.log("이전 이미지 클릭");
    e.stopPropagation(); // 이벤트 버블링 방지
    const newIndex =
      currentImageIndex === 0
        ? parsedImageUrls.length - 1
        : currentImageIndex - 1;
    console.log(`이미지 인덱스 변경: ${currentImageIndex} → ${newIndex}`);
    setCurrentImageIndex(newIndex);
  };

  // 이미지 캐러셀 다음 이미지로 이동
  const handleNextImage = (e: React.MouseEvent) => {
    console.log("다음 이미지 클릭");
    e.stopPropagation(); // 이벤트 버블링 방지
    const newIndex =
      currentImageIndex === parsedImageUrls.length - 1
        ? 0
        : currentImageIndex + 1;
    console.log(`이미지 인덱스 변경: ${currentImageIndex} → ${newIndex}`);
    setCurrentImageIndex(newIndex);
  };

  // 특정 이미지로 직접 이동
  const goToImage = (index: number) => {
    console.log(`이미지 ${index}번으로 이동`);
    setCurrentImageIndex(index);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-3xl h-[80vh] max-h-[600px] flex rounded-md overflow-hidden">
        {/* 왼쪽: 게시글 이미지 */}
        {parsedImageUrls.length > 0 && (
          <div className="w-[50%] bg-black flex items-center justify-center relative group">
            <Image
              src={parsedImageUrls[currentImageIndex]}
              alt="게시글 이미지"
              width={600}
              height={450}
              className="max-h-full max-w-full object-contain"
            />

            {/* 이미지 내부 좌/우 화살표 - 여러 이미지일 때만 표시 */}
            {parsedImageUrls.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 z-20"
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
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 z-20"
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

            {/* 이미지 인디케이터 (이미지가 여러 장일 때만 표시) */}
            {parsedImageUrls.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1 z-20">
                {parsedImageUrls.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToImage(index);
                    }}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}

            {isOwnPost && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                <button
                  onClick={handleImageClick}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-gray-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        )}

        {/* 오른쪽: 댓글 영역 */}
        <div
          className={`${
            parsedImageUrls.length > 0 ? "w-[50%]" : "w-full"
          } flex flex-col bg-white`}
        >
          {/* 헤더 */}
          <div className="flex items-center p-3 border-b">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt={`${userNickname || "사용자"}의 프로필`}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  unoptimized={true}
                />
              ) : (
                <svg
                  className="w-4 h-4 text-gray-500"
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
            <span className="ml-3 font-bold text-[14px] text-black hover:text-gray-900">
              {userNickname}
            </span>
          </div>

          {/* 댓글 목록 */}
          <div className="flex-1 overflow-y-auto">
            {/* 원글 내용 */}
            <div className="p-3 border-b">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <Image
                        src={profileImage}
                        alt={`${userNickname || "사용자"}의 프로필`}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        unoptimized={true}
                      />
                    ) : (
                      <svg
                        className="w-4 h-4 text-gray-500"
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
                </div>
                <div className="flex-1 group">
                  <div className="flex items-baseline">
                    <span className="font-bold text-[14px] text-black hover:text-gray-900">
                      {userNickname}
                    </span>
                    {isOwnPost && !isEditingContent ? (
                      <div className="relative flex-1">
                        <p className="ml-2 text-[14px] text-gray-900">
                          {detoxTime && detoxTime > 0
                            ? `detoxed for ${detoxTime} hours`
                            : postContent}
                        </p>
                        <button
                          onClick={() => setIsEditingContent(true)}
                          className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-700"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : isEditingContent ? (
                      <div className="flex-1 ml-2">
                        <textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="w-full text-[14px] text-black border-none focus:ring-0 focus:outline-none resize-none bg-transparent [caret-color:#F742CD]"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            onClick={() => {
                              setIsEditingContent(false);
                              setEditedContent(postContent || "");
                            }}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            취소
                          </button>
                          <button
                            onClick={handleSaveContent}
                            className="text-sm text-[#F742CD] hover:text-pink-600"
                          >
                            완료
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="ml-2 text-[14px] text-gray-900">
                        {detoxTime && detoxTime > 0
                          ? `detoxed for ${detoxTime} hours`
                          : postContent}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    {getTimeAgo(createdAt)} 전
                  </div>
                </div>
              </div>
            </div>

            {/* 댓글 목록 */}
            <div className="px-3 py-2 space-y-4">
              {comments.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm">아직 댓글이 없습니다.</p>
                  <p className="text-xs mt-1">첫 댓글을 작성해보세요!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`flex space-x-3 ${
                      comment.parentId ? "ml-8" : ""
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {userProfileImages[comment.userId] ? (
                          <Image
                            src={userProfileImages[comment.userId]!}
                            alt={`${comment.userNickname}의 프로필`}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            unoptimized={true}
                          />
                        ) : (
                          <svg
                            className="w-4 h-4 text-gray-500"
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
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="font-bold text-[14px] text-black hover:text-gray-900">
                            {comment.userNickname}
                          </span>
                          <span className="ml-2 text-[14px] text-gray-900">
                            {(() => {
                              if (
                                typeof comment.detoxTime === "number" &&
                                !isNaN(comment.detoxTime) &&
                                comment.detoxTime > 0
                              ) {
                                return `detoxed for ${comment.detoxTime} hours`;
                              }

                              if (!comment.content) {
                                return "";
                              }

                              return comment.content;
                            })()}
                          </span>
                        </div>
                        {user?.id === comment.userId && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-xs text-gray-400 hover:text-red-500 ml-2"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                      <div className="flex items-center mt-1 space-x-3">
                        <span className="text-xs text-gray-400">
                          {getTimeAgo(comment.createdAt)} 전
                        </span>
                        <button
                          onClick={() => setReplyToId(comment.id)}
                          className="text-xs font-semibold text-gray-400 hover:text-gray-600"
                        >
                          답글 달기
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 댓글 입력 영역 */}
          <div className="border-t px-3 py-2">
            {replyToId && (
              <div className="flex items-center justify-between mb-2 bg-gray-50 p-2 rounded-sm text-xs">
                <span className="text-gray-600">답글 작성 중</span>
                <button
                  onClick={() => setReplyToId(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  취소
                </button>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글 달기..."
                className="flex-1 text-sm text-black border-none focus:ring-0 focus:outline-none min-h-[36px] py-1 placeholder-gray-400 [caret-color:#F742CD] rounded-sm"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
              />
              <button
                onClick={handleSubmitComment}
                disabled={isLoading || !newComment.trim()}
                className={`text-sm font-semibold px-2 rounded-sm ${
                  isLoading || !newComment.trim()
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-[#F742CD] hover:text-pink-600"
                }`}
              >
                게시
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
