import { useState, useEffect, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import { Comment, CommentRequestDto } from "@/types/comment";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  convertEmojiCodesToImages,
  fetchPurchasedEmojis,
  useGlobalEmojis,
  Emoji,
} from "@/utils/emojiUtils";
import EmojiPicker from "./EmojiPicker";
import { toast } from "react-hot-toast";

interface CommentModalProps {
  postId: number;
  onClose: () => void;
  postImage?: string | string[];
  postContent?: string;
  userNickname?: string;
  createdAt?: string;
  isOwnPost?: boolean;
  onUpdate?: (count: number) => void;
  onImageUpdate?: (newImage: File | File[]) => void;
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
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [purchasedEmojis, setPurchasedEmojis] = useState<Emoji[]>([]);
  const [isEmojiLoaded, setIsEmojiLoaded] = useState(false);
  const { globalEmojis, isLoading: isGlobalEmojisLoading } = useGlobalEmojis();
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedContent, setEditedContent] = useState(postContent || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(
    userProfileImage || null
  );
  const [isFollowing, setIsFollowing] = useState<boolean>(() => {
    if (typeof window !== "undefined" && userId) {
      const storedFollowStatus = localStorage.getItem(`follow_${userId}`);
      return storedFollowStatus === "true";
    }
    return false;
  });
  const [followLoading, setFollowLoading] = useState(false);

  // 댓글 작성자의 프로필 이미지 저장 객체
  const [userProfileImages, setUserProfileImages] = useState<
    Record<number, string | null>
  >({});

  // 이미지 캐러셀을 위한 상태
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [parsedImageUrls, setParsedImageUrls] = useState<string[]>([]);

  // 이모티콘 로딩
  useEffect(() => {
    const loadEmojis = async () => {
      if (user?.id) {
        try {
          const emojis = await fetchPurchasedEmojis();
          setPurchasedEmojis(emojis);
          setIsEmojiLoaded(true);
        } catch (error) {
          console.error("이모티콘 로드 중 오류:", error);
          setIsEmojiLoaded(true); // 오류가 있어도 로딩은 완료됨
        }
      }
    };

    loadEmojis();
  }, []);

  useEffect(() => {
    if (!isGlobalEmojisLoading) {
      setIsEmojiLoaded(true);
    }
  }, [isGlobalEmojisLoading]);

  // 이모티콘 선택
  const handleEmojiSelect = (emojiCode: string) => {
    setNewComment((prev) => prev + emojiCode);
    setShowEmojiPicker(false);
  };

  // 원글 작성자의 프로필 이미지 가져오기
  useEffect(() => {
    if (!userProfileImage && userId) {
      fetchUserProfile(userId, setProfileImage);
    }
  }, [userId, userProfileImage]);

  // 팔로우 상태 확인
  useEffect(() => {
    if (userId && user && userId !== user.id) {
      checkFollowStatus();
    }
  }, [userId, user]);

  // 팔로우 상태 확인 함수
  const checkFollowStatus = async () => {
    if (!userId || !user) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}` +
          `/api/v1/follows/check?followingId=${userId}`,
        { credentials: "include" }
      );

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
        localStorage.setItem(`follow_${userId}`, data.isFollowing.toString());
      }
    } catch (error) {
      console.error("팔로우 상태 확인 중 오류 발생:", error);
    }
  };

  // 팔로우/언팔로우 토글 함수
  const toggleFollow = async () => {
    if (!userId || !user || userId === user.id) return;

    setFollowLoading(true);
    try {
      // 현재 로그인한 사용자 정보 가져오기
      const meResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}` + "/api/v1/users/me",
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!meResponse.ok) {
        throw new Error("사용자 정보를 가져오는데 실패했습니다.");
      }

      const meData = await meResponse.json();

      if (isFollowing) {
        // 언팔로우
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}` +
            `/api/v1/follows/${meData.id}/${userId}`,
          {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          setIsFollowing(false);
          localStorage.setItem(`follow_${userId}`, "false");
          toast.success("팔로우가 취소되었습니다.");
        } else {
          throw new Error("팔로우 취소에 실패했습니다.");
        }
      } else {
        // 팔로우
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}` + `/api/v1/follows`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              followerId: meData.id,
              followingId: userId,
            }),
          }
        );

        if (response.ok) {
          setIsFollowing(true);
          localStorage.setItem(`follow_${userId}`, "true");
          toast.success("팔로우가 완료되었습니다.");
        } else {
          throw new Error("팔로우에 실패했습니다.");
        }
      }
    } catch (error) {
      console.error("팔로우 상태 변경 중 오류 발생:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "팔로우 상태 변경에 실패했습니다."
      );
    } finally {
      setFollowLoading(false);
    }
  };

  // 사용자 프로필 이미지를 가져오는 함수
  const fetchUserProfile = async (
    userId: number,
    setterFn: (url: string | null) => void
  ) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}` + `/api/v1/users/${userId}`,
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}` +
          `/api/v1/comments/${postId}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("원본 댓글 데이터:", data);

        // 데이터 정제 및 타입 확인 - 모든 userId를 숫자로 변환
        const processedData = data.map((comment: any) => {
          // 백엔드에서 snake_case로 오는 필드를 처리 (user_id → userId)
          const userId =
            comment.user_id !== undefined
              ? Number(comment.user_id)
              : comment.userId !== undefined
              ? Number(comment.userId)
              : 0;

          console.log(
            `댓글 ID ${comment.id}의 userId 변환: ${
              comment.user_id || comment.userId
            } → ${userId}`
          );

          return {
            ...comment,
            userId: isNaN(userId) ? 0 : userId, // NaN 방지
            postId: comment.post_id || comment.postId, // post_id도 변환
            parentId: comment.parent_id || comment.parentId, // parent_id도 변환
            userNickname: comment.userNickname || "사용자",
          };
        });

        console.log("처리된 댓글 데이터:", processedData);
        setComments(processedData);
        if (onUpdate) onUpdate(processedData.length);

        // 댓글 작성자들의 프로필 이미지 가져오기
        if (processedData && processedData.length > 0) {
          // 유효한 userId만 필터링
          const uniqueUserIds = Array.from(
            new Set(
              processedData
                .filter(
                  (comment: Comment) =>
                    comment.userId !== undefined &&
                    comment.userId !== null &&
                    comment.userId !== 0 &&
                    !isNaN(Number(comment.userId))
                )
                .map((comment: Comment) => Number(comment.userId))
            )
          ) as number[];

          console.log("필터링된 유니크 유저 IDs:", uniqueUserIds);

          if (uniqueUserIds.length > 0) {
            // 이미 프로필 이미지가 있는 유저를 제외하고 필요한 것만 가져오기
            const userIdsToFetch = uniqueUserIds.filter(
              (id) =>
                !userProfileImages[id] ||
                userProfileImages[id] === "/profile.png"
            );

            if (userIdsToFetch.length > 0) {
              console.log(
                "프로필 이미지를 가져올 유저 ID 목록:",
                userIdsToFetch
              );
              await fetchCommenterProfiles(userIdsToFetch);
            } else {
              console.log("모든 유저의 프로필 이미지가 이미 캐시되어 있습니다");
            }
          } else {
            console.log("프로필 이미지를 가져올 유저 ID가 없습니다");
          }
        } else {
          console.log("댓글 데이터가 비어있습니다");
        }

        return processedData;
      }
      console.error("댓글 로드 응답 에러:", response.status);
      return [];
    } catch (error) {
      console.error("댓글 로드 중 오류:", error);
      return [];
    }
  };

  // 댓글 작성자 프로필 이미지 가져오기
  const fetchCommenterProfiles = async (userIds: number[]) => {
    try {
      console.log("프로필 이미지 로드 시작. userIds:", userIds);

      const profilePromises = userIds.map(async (userId) => {
        if (!userId || isNaN(userId) || userId === 0) {
          console.log(`유효하지 않은 userId 건너뜀: ${userId}`);
          return null;
        }

        try {
          console.log(`유저 ID ${userId}의 프로필 이미지 요청 중`);
          const profileResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}` +
              `/api/v1/users/${userId}`,
            {
              credentials: "include",
            }
          );

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log(
              `유저 ID ${userId}의 프로필 데이터 로드 성공:`,
              profileData
            );

            const profileImageUrl = profileData.profileImageUrl || null;
            console.log(
              `유저 ID ${userId}의 프로필 이미지 URL:`,
              profileImageUrl
            );

            return {
              userId,
              profileImage: profileImageUrl,
            };
          } else {
            console.error(
              `유저 ID ${userId}의 프로필 로드 실패:`,
              profileResponse.status
            );
            return { userId, profileImage: null };
          }
        } catch (error) {
          console.error(`유저 ID ${userId}의 프로필 로드 중 오류:`, error);
          return { userId, profileImage: null };
        }
      });

      const profiles = await Promise.all(profilePromises);
      const validProfiles = profiles.filter(
        (profile): profile is { userId: number; profileImage: string | null } =>
          profile !== null && typeof profile === "object"
      );

      console.log("로드된 프로필 이미지:", validProfiles);

      const newProfileImageMap = { ...userProfileImages };

      validProfiles.forEach((profile) => {
        newProfileImageMap[profile.userId] = profile.profileImage;
      });

      console.log("업데이트된 프로필 이미지 맵:", newProfileImageMap);
      setUserProfileImages(newProfileImageMap);
    } catch (error) {
      console.error("프로필 이미지 로드 중 오류:", error);
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
      console.log("CommentModal - 이미지 원본 데이터:", postImage);

      // 이미 배열인 경우 (백엔드에서 String[]으로 변경된 경우)
      if (Array.isArray(postImage)) {
        console.log("CommentModal - 배열 형태의 이미지:", postImage);

        // 단계별 파싱 및 디버깅
        const validUrls: string[] = [];

        for (let i = 0; i < postImage.length; i++) {
          const url = postImage[i];
          console.log(`CommentModal - 배열 항목 ${i}:`, url, typeof url);

          if (!url) continue;

          // 이미 문자열인 경우, JSON 문자열일 수 있음
          if (typeof url === "string") {
            // JSON 문자열인지 확인
            if (url.startsWith("[") && url.endsWith("]")) {
              try {
                const innerParsed = JSON.parse(url);
                console.log(`CommentModal - JSON 파싱 결과 ${i}:`, innerParsed);

                // 파싱된 결과가 배열인 경우
                if (Array.isArray(innerParsed)) {
                  innerParsed.forEach((innerUrl, j) => {
                    if (
                      innerUrl &&
                      typeof innerUrl === "string" &&
                      innerUrl.trim() !== ""
                    ) {
                      console.log(
                        `CommentModal - 추가된 URL ${i}-${j}:`,
                        innerUrl
                      );
                      validUrls.push(innerUrl);
                    }
                  });
                }
                // 문자열인 경우 직접 추가
                else if (
                  typeof innerParsed === "string" &&
                  innerParsed.trim() !== ""
                ) {
                  console.log(`CommentModal - 추가된 URL ${i}:`, innerParsed);
                  validUrls.push(innerParsed);
                }
              } catch (e) {
                // JSON 파싱 실패 시 문자열 자체가 URL인지 확인
                if (url.includes("http")) {
                  // JSON 문자열 형태로 오는 URL 정리 (큰따옴표, 대괄호 제거)
                  const cleanUrl = url
                    .replace(/^\["|"\]$/g, "")
                    .replace(/^"|"$/g, "");
                  if (cleanUrl.startsWith("http")) {
                    console.log(
                      `CommentModal - 추가된 URL(정리) ${i}:`,
                      cleanUrl
                    );
                    validUrls.push(cleanUrl);
                  }
                }
              }
            }
            // 일반 URL 문자열인 경우
            else if (url.includes("http")) {
              console.log(`CommentModal - 추가된 URL(일반) ${i}:`, url);
              validUrls.push(url);
            }
          }
        }

        console.log("CommentModal - 최종 유효한 URL 배열:", validUrls);
        setParsedImageUrls(validUrls);
        return;
      }

      // JSON 형식으로 된 문자열인지 확인
      if (typeof postImage === "string" && postImage.trim() !== "") {
        if (postImage.startsWith("[") && postImage.endsWith("]")) {
          try {
            const parsed = JSON.parse(postImage);
            console.log("CommentModal - JSON 파싱 결과:", parsed);

            if (Array.isArray(parsed)) {
              // 유효한 URL만 필터링
              const validUrls: string[] = [];

              parsed.forEach((url, i) => {
                if (!url) return;

                if (typeof url === "string") {
                  // 따옴표와 대괄호 제거
                  const cleanUrl = url
                    .replace(/^\["|"\]$/g, "")
                    .replace(/^"|"$/g, "");
                  if (cleanUrl.trim() !== "" && cleanUrl.includes("http")) {
                    console.log(
                      `CommentModal - JSON 배열에서 추가된 URL ${i}:`,
                      cleanUrl
                    );
                    validUrls.push(cleanUrl);
                  }
                }
              });

              console.log(
                "CommentModal - JSON에서 파싱된 최종 URL 배열:",
                validUrls
              );
              setParsedImageUrls(validUrls.length > 0 ? validUrls : []);
              return;
            }
          } catch (e) {
            console.error("CommentModal - JSON 파싱 오류:", e);
            // JSON 파싱 실패 시, 문자열 자체가 URL일 수 있음
            if (postImage.includes("http")) {
              // 문자열 정리 (큰따옴표, 대괄호 제거)
              const cleanUrl = postImage
                .replace(/^\["|"\]$/g, "")
                .replace(/^"|"$/g, "");
              if (cleanUrl.includes("http")) {
                console.log("CommentModal - URL로 간주:", cleanUrl);
                setParsedImageUrls([cleanUrl]);
                return;
              }
            }
          }
        } else if (postImage.includes("http")) {
          // 일반 URL 문자열인 경우
          console.log("CommentModal - 일반 URL 문자열:", postImage);
          setParsedImageUrls([postImage]);
          return;
        }
      }

      // 위의 모든 검사를 통과하지 못한 경우
      console.log("CommentModal - 파싱 불가능한 이미지 URL, 빈 배열 설정");
      setParsedImageUrls([]);
    } catch (e) {
      console.error("CommentModal - 이미지 URL 파싱 오류:", e);
      setParsedImageUrls([]);
    }
  }, [postImage]);

  // 이미지 배열이 변경될 때 현재 이미지 인덱스 리셋
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [parsedImageUrls]);

  // 댓글 작성
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    // 백엔드 DTO의 JsonProperty 형식에 맞춰 snake_case로 파라미터 전송
    const commentData = {
      post_id: postId,
      content: newComment.trim(),
      parent_id: replyToId,
    };

    console.log("전송하는 댓글 데이터:", commentData);

    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}` + `/api/v1/comments`,
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
        console.log("댓글 작성 성공!");
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
                  comment.userId !== undefined &&
                  comment.userId !== null &&
                  typeof comment.userId === "number"
              )
              .map((comment: Comment) => comment.userId);

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
      } else {
        // 에러 응답 로깅 추가
        const errorText = await response.text();
        console.error("댓글 작성 실패:", response.status, errorText);

        // 상태 코드에 따른 오류 메시지 표시
        if (response.status === 404) {
          console.error("게시글을 찾을 수 없습니다.");
        } else if (response.status === 400) {
          console.error("댓글 내용이 유효하지 않습니다.");
        } else if (response.status === 401) {
          console.error("로그인이 필요합니다.");
        } else if (response.status === 500) {
          console.error(
            "서버 내부 오류가 발생했습니다. 관리자에게 문의하세요."
          );
        }
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}` +
          `/api/v1/comments/${commentId}`,
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}` + `/api/v1/posts/${postId}`,
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
    const files = e.target.files;
    if (files && files.length > 0 && onImageUpdate) {
      // 선택된 파일 배열을 FileList에서 File[] 배열로 변환
      const fileArray: File[] = Array.from(files);
      // 여러 파일 선택한 경우 안내 메시지
      if (fileArray.length > 1) {
        toast(`${fileArray.length}개의 이미지를 업로드합니다.`);
      }

      console.log("CommentModal - 선택한 이미지 파일:", fileArray.length, "개");

      // onImageUpdate 콜백을 통해 상위 컴포넌트에 전달
      onImageUpdate(fileArray);
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

  // 유저 프로필 페이지로 이동하는 함수
  const navigateToUserProfile = (userId: number | string | undefined) => {
    if (userId === undefined || userId === null) {
      console.error("사용자 ID가 없습니다.");
      return;
    }

    // userId가 문자열인 경우 숫자로 변환 시도
    const numericUserId =
      typeof userId === "string" ? parseInt(userId, 10) : userId;

    // 유효한 숫자인지 확인
    if (isNaN(Number(numericUserId))) {
      console.error("유효하지 않은 사용자 ID:", userId);
      return;
    }

    console.log(`프로필로 이동: /profile/${numericUserId}`);

    // 먼저 모달을 닫고
    onClose();

    // 새 창에서 프로필 페이지 열기 (모달 닫는 과정에서 생기는 문제 방지)
    window.open(`/profile/${numericUserId}`, "_blank");
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
              src={parsedImageUrls[currentImageIndex] || ""}
              alt="게시글 이미지"
              width={600}
              height={450}
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                console.error(
                  "CommentModal - 이미지 로드 실패:",
                  parsedImageUrls[currentImageIndex]
                );
                console.log(
                  "CommentModal - 전체 이미지 URL 배열:",
                  parsedImageUrls
                );
                // 이미지 로드 실패 시 오류 메시지 표시
                const container = (e.target as HTMLImageElement).parentElement;
                if (container) {
                  const errorMsg = document.createElement("div");
                  errorMsg.className = "text-white text-sm p-4 text-center";
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
              multiple
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
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center">
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
                )}
              </div>
              <span className="ml-3 font-bold text-[14px] text-black hover:text-gray-900">
                {userNickname}
              </span>
            </div>
            {userId && user && userId !== user.id && (
              <button
                onClick={toggleFollow}
                disabled={followLoading}
                className={`px-4 py-1.5 rounded text-sm font-bold ${
                  isFollowing
                    ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    : "text-white hover:opacity-90"
                } transition-colors ${
                  followLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                style={{ backgroundColor: isFollowing ? undefined : "#F742CD" }}
              >
                {followLoading
                  ? "처리중..."
                  : isFollowing
                  ? "팔로우 취소"
                  : "팔로우"}
              </button>
            )}
          </div>

          {/* 댓글 목록 */}
          <div className="flex-1 overflow-y-auto">
            {/* 원글 내용 */}
            <div className="p-3 border-b">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer"
                    onClick={() => userId && navigateToUserProfile(userId)}
                  >
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
                    )}
                  </div>
                </div>
                <div className="flex-1 group">
                  <div className="flex items-baseline">
                    <span
                      className="font-bold text-[14px] text-black hover:text-gray-900 cursor-pointer"
                      onClick={() => userId && navigateToUserProfile(userId)}
                    >
                      {userNickname}
                    </span>
                    {isOwnPost && !isEditingContent ? (
                      <div className="relative flex-1">
                        <p className="ml-2 text-[14px] text-gray-900">
                          {detoxTime && detoxTime > 0 ? (
                            `detoxed for ${detoxTime} hours`
                          ) : isEmojiLoaded ? (
                            <>
                              {convertEmojiCodesToImages(
                                postContent || "",
                                purchasedEmojis
                              )}
                            </>
                          ) : (
                            postContent
                          )}
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
                        {detoxTime && detoxTime > 0 ? (
                          `detoxed for ${detoxTime} hours`
                        ) : isEmojiLoaded ? (
                          <>
                            {convertEmojiCodesToImages(
                              postContent || "",
                              globalEmojis
                            )}
                          </>
                        ) : (
                          postContent
                        )}
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
                      <div
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer"
                        onClick={() => navigateToUserProfile(comment.userId)}
                      >
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
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span
                            className="font-bold text-[14px] text-black hover:text-gray-900 cursor-pointer"
                            onClick={() =>
                              navigateToUserProfile(comment.userId)
                            }
                          >
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

                              return isEmojiLoaded ? (
                                <>
                                  {convertEmojiCodesToImages(
                                    comment.content,
                                    globalEmojis
                                  )}
                                </>
                              ) : (
                                comment.content
                              );
                            })()}
                          </span>
                        </div>
                        {comment.userId === user?.id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
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
              {/* 현재 로그인한 사용자 프로필 이미지 */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {user?.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt={`${user.nickname || "사용자"}의 프로필`}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                      unoptimized={true}
                    />
                  ) : (
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
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
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

              {/* 이모티콘 선택창 */}
              <div className="relative">
                <EmojiPicker
                  isOpen={showEmojiPicker}
                  onClose={() => setShowEmojiPicker(false)}
                  onEmojiSelect={handleEmojiSelect}
                />
              </div>

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
