"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserInfo } from "@/types/user";
import Link from "next/link";
import { FaStore, FaCog } from "react-icons/fa";
import CommentModal from "@/components/CommentModal";

interface Post {
  postId: number;
  userId: number;
  userNickname: string;
  categoryId: number;
  title: string;
  content: string;
  imageUrl: string[] | string;
  viewCount: number;
  likeCount: number;
  verificationImageUrl: string | null;
  detoxTime: number | null;
  createdAt: string;
  updatedAt: string;
  commentCount?: number;
}

const CUSTOM_PINK = "#F742CD";

const BADGES = [
  { name: "디톡스새싹", requiredPoints: 0, emoji: "🌱" },
  { name: "절제수련생", requiredPoints: 100, emoji: "🧘" },
  { name: "집중탐험가", requiredPoints: 600, emoji: "🔍" },
  { name: "선명한의식", requiredPoints: 2000, emoji: "✨" },
  { name: "도파민파괴자", requiredPoints: 4500, emoji: "💥" },
  { name: "브레인클리너", requiredPoints: 7500, emoji: "🧠" },
];

export default function MyProfile() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: null,
    nickname: "",
    email: "",
    remainingPoint: 0,
    totalPoint: 0,
    createdAt: null,
  });
  const [followStats, setFollowStats] = useState({
    followers: 0,
    following: 0,
  });
  const [stats, setStats] = useState({
    detoxDays: 0,
    streakDays: 0,
    detoxTime: 0,
    completionRate: 0,
    badges: 12,
  });

  const [selectedTab, setSelectedTab] = useState("feed");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 팔로워/팔로잉 모달 상태
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState<
    { id: number; nickname: string }[]
  >([]);
  const [followings, setFollowings] = useState<
    { id: number; nickname: string }[]
  >([]);
  const [isLoadingFollows, setIsLoadingFollows] = useState(false);

  // CommentModal 관련 상태
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);

  // 새로 추가한 상태
  const [userComments, setUserComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/users/me", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            // 캐시 방지
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("프로필 데이터 로드 (원본):", data);
          console.log(
            "detoxGoal 타입:",
            typeof data.detoxGoal,
            "값:",
            data.detoxGoal
          );

          const userData = {
            ...data,
            profileImage: data.profileImageUrl,
          };
          console.log("변환 후 userData:", userData);
          setUserInfo(userData);

          if (data.id) {
            fetchFollowStats(data.id);
            fetchUserPosts(data.id);
            fetchVerificationStats(data.id);
            fetchUserComments(data.id);
          }
        } else {
          console.error("프로필 정보를 불러오는데 실패했습니다.");
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [router]);

  const fetchFollowStats = async (userId: number) => {
    try {
      const [followersRes, followingRes] = await Promise.all([
        fetch(
          `http://localhost:8080/api/v1/follows/${userId}/followers/number`,
          {
            credentials: "include",
          }
        ),
        fetch(
          `http://localhost:8080/api/v1/follows/${userId}/followings/number`,
          {
            credentials: "include",
          }
        ),
      ]);

      if (followersRes.ok && followingRes.ok) {
        const followers = await followersRes.json();
        const following = await followingRes.json();
        setFollowStats({ followers, following });
      }
    } catch (error) {
      console.error("Error fetching follow stats:", error);
    }
  };

  const fetchUserPosts = async (userId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/posts/user/${userId}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const fetchVerificationStats = async (userId: number) => {
    try {
      console.log("fetchVerificationStats 시작, 현재 userInfo:", userInfo);

      // 1. 연속 인증일수 가져오기
      const streakResponse = await fetch(
        `http://localhost:8080/api/v1/verifications/streak`,
        {
          credentials: "include",
        }
      );

      let streakDays = 0;
      if (streakResponse.ok) {
        streakDays = await streakResponse.json();
      }

      // 2. 인증 카테고리(categoryId=1)의 모든 게시물 가져오기
      const categoryPostsResponse = await fetch(
        `http://localhost:8080/api/v1/posts/category/1`,
        {
          credentials: "include",
        }
      );

      if (categoryPostsResponse.ok) {
        const allCategoryPosts = await categoryPostsResponse.json();

        // 3. 현재 사용자가 작성한 인증 게시물만 필터링
        const userVerificationPosts = allCategoryPosts.filter(
          (post: Post) => post.userId === userId
        );

        // 총 인증일수 = 해당 사용자의 인증 게시글 수
        const totalVerificationDays = userVerificationPosts.length;

        // 디톡스 시간 계산 - 해당 사용자의 인증 게시글의 detoxTime 합산
        let totalDetoxTime = 0;
        userVerificationPosts.forEach((post: Post) => {
          if (post.detoxTime) {
            totalDetoxTime += post.detoxTime;
          }
        });

        // 최신 userInfo 가져오기
        const latestUserInfo = await fetch(
          "http://localhost:8080/api/v1/users/me",
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
            },
          }
        ).then((res) => res.json());

        console.log("최신 사용자 정보:", latestUserInfo);
        console.log("최신 detoxGoal:", latestUserInfo.detoxGoal);

        // 목표 달성률 계산 - detoxGoal이 설정되어 있고 0보다 큰 경우에만 계산
        let completionRate = 0;
        let detoxGoal = latestUserInfo.detoxGoal;

        if (detoxGoal && detoxGoal > 0) {
          completionRate = Math.min(
            100,
            Math.round((totalDetoxTime / detoxGoal) * 100)
          );
        }

        console.log("사용 중인 detoxGoal:", detoxGoal);
        console.log("totalDetoxTime:", totalDetoxTime);
        console.log("계산된 completionRate:", completionRate);

        // stats 상태 업데이트
        setStats({
          detoxDays: totalVerificationDays,
          streakDays: streakDays,
          detoxTime: totalDetoxTime,
          completionRate: completionRate,
          badges: 12,
        });
      }
    } catch (error) {
      console.error("Error fetching verification stats:", error);
    }
  };

  const fetchUserComments = async (userId: number) => {
    try {
      setCommentsLoading(true);
      // 올바른 API 엔드포인트로 사용자 댓글 가져오기
      const response = await fetch(
        `http://localhost:8080/api/v1/comments/user/${userId}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const comments = await response.json();
        console.log("사용자 댓글 데이터:", comments);

        if (!Array.isArray(comments)) {
          console.error("댓글 데이터가 배열이 아닙니다:", comments);
          setUserComments([]);
          return;
        }

        // 댓글 데이터 정제 (snake_case -> camelCase)
        const processedComments = comments.map((comment: any) => ({
          ...comment,
          userId: comment.userId || comment.user_id,
          postId: comment.postId || comment.post_id,
          parentId: comment.parentId || comment.parent_id,
          createdAt: comment.createdAt || comment.created_at,
          updatedAt: comment.updatedAt || comment.updated_at,
        }));

        // 필요한 게시글 정보 가져오기
        const commentsWithPostInfo = await Promise.all(
          processedComments.map(async (comment: any) => {
            if (!comment.postId) {
              return comment;
            }

            try {
              const postResponse = await fetch(
                `http://localhost:8080/api/v1/posts/${comment.postId}`,
                {
                  credentials: "include",
                }
              );

              if (postResponse.ok) {
                const post = await postResponse.json();
                return { ...comment, post };
              }
              return comment;
            } catch (error) {
              console.error(
                `댓글 ID ${comment.id}의 게시글 정보 로드 중 오류:`,
                error
              );
              return comment;
            }
          })
        );

        setUserComments(commentsWithPostInfo);
      } else {
        console.error("댓글 조회 API 오류:", response.status);
      }
    } catch (error) {
      console.error("사용자 댓글 로드 중 오류:", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  // 시간 경과 표시 함수
  const getTimeAgo = (dateString: string) => {
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

  // 팔로워 목록 가져오기 - "나를 팔로우하는 사람들"
  const fetchFollowers = async (userId: number) => {
    try {
      setIsLoadingFollows(true);
      const response = await fetch(
        `http://localhost:8080/api/v1/follows/${userId}/followers`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFollowers(data);
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
    } finally {
      setIsLoadingFollows(false);
    }
  };

  // 팔로잉 목록 가져오기 - "내가 팔로우하는 사람들"
  const fetchFollowings = async (userId: number) => {
    try {
      setIsLoadingFollows(true);
      const response = await fetch(
        `http://localhost:8080/api/v1/follows/${userId}/followings`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFollowings(data);
      }
    } catch (error) {
      console.error("Error fetching followings:", error);
    } finally {
      setIsLoadingFollows(false);
    }
  };

  // 팔로워 모달 열기
  const handleShowFollowers = () => {
    if (userInfo.id !== null) {
      fetchFollowers(userInfo.id);
      setShowFollowersModal(true);
      setShowFollowingModal(false);
    }
  };

  // 팔로잉 모달 열기
  const handleShowFollowing = () => {
    if (userInfo.id !== null) {
      fetchFollowings(userInfo.id);
      setShowFollowingModal(true);
      setShowFollowersModal(false);
    }
  };

  // 유저 프로필로 이동
  const navigateToUserProfile = (userId: number) => {
    setShowFollowersModal(false);
    setShowFollowingModal(false);
    router.push(`/profile/${userId.toString()}`);
  };

  // CommentModal 관련 함수
  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setShowCommentModal(true);
  };

  const handleCloseCommentModal = () => {
    setShowCommentModal(false);
    setSelectedPost(null);
  };

  const handleCommentUpdate = (count: number) => {
    if (!selectedPost) return;

    // selectedPost의 댓글 수 업데이트
    setSelectedPost({
      ...selectedPost,
      commentCount: count,
    });

    // posts 배열 내의 해당 게시글 댓글 수도 업데이트
    setPosts((prev) =>
      prev.map((post) =>
        post.postId === selectedPost.postId
          ? { ...post, commentCount: count }
          : post
      )
    );
  };

  // 댓글 클릭시 해당 게시글 모달 표시 함수
  const handleCommentClick = (comment: any) => {
    if (comment.post) {
      setSelectedPost(comment.post);
      setShowCommentModal(true);
    }
  };

  // 이미지 URL을 안전하게 파싱하는 함수
  const getSafeImageUrl = (imageUrl: string | string[]): string => {
    if (!imageUrl) return "";

    try {
      // 배열인 경우
      if (Array.isArray(imageUrl) && imageUrl.length > 0) {
        // 유효한 URL만 반환
        for (let i = 0; i < imageUrl.length; i++) {
          if (imageUrl[i] && imageUrl[i].trim() !== "") {
            return imageUrl[i];
          }
        }
        return "";
      }

      // JSON 문자열인 경우
      if (
        typeof imageUrl === "string" &&
        imageUrl.startsWith("[") &&
        imageUrl.endsWith("]")
      ) {
        try {
          const parsed = JSON.parse(imageUrl);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // 유효한 URL만 반환
            for (let i = 0; i < parsed.length; i++) {
              if (parsed[i] && parsed[i].trim() !== "") {
                return parsed[i];
              }
            }
          }
        } catch (e) {
          console.error("이미지 URL JSON 파싱 오류:", e);
        }
        return "";
      }

      // 일반 문자열인 경우
      if (typeof imageUrl === "string" && imageUrl.trim() !== "") {
        return imageUrl;
      }

      return "";
    } catch (e) {
      console.error("이미지 URL 파싱 오류:", e);
      return "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header with username and icons */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{userInfo.nickname}</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/point-store"
              className="text-xl hover:opacity-70 transition-colors"
              style={{ color: CUSTOM_PINK }}
            >
              <FaStore />
            </Link>
            <button
              onClick={() => router.push("/profile/me/edit")}
              className="text-xl hover:opacity-70 transition-colors"
              style={{ color: CUSTOM_PINK }}
            >
              <FaCog />
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex items-start gap-12 mb-8">
          <div className="flex flex-col items-center gap-4">
            {/* Profile Image */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {userInfo.profileImage ? (
                <Image
                  src={userInfo.profileImage}
                  alt="프로필 이미지"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-gray-400"
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
            {/* Status Message */}
            <div className="w-[16rem]">
              <textarea
                value={userInfo.statusMessage || ""}
                onChange={(e) => {
                  setUserInfo({
                    ...userInfo,
                    statusMessage: e.target.value,
                  });
                }}
                className="w-full text-sm text-gray-600 bg-transparent border-none resize-none focus:outline-none placeholder:text-transparent hover:placeholder:text-gray-400 transition-all overflow-hidden caret-[#F742CD]"
                rows={1}
                placeholder="상태 메시지를 입력하세요..."
                style={{ height: "auto" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = target.scrollHeight + "px";
                }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="w-[16rem]">
            <div className="grid grid-cols-3 text-center">
              <div>
                <div className="font-semibold text-lg">{posts.length}</div>
                <div className="text-sm text-gray-500">게시물</div>
              </div>
              <div className="cursor-pointer" onClick={handleShowFollowers}>
                <div className="font-semibold text-lg">
                  {followStats.followers}
                </div>
                <div className="text-sm text-gray-500">팔로워</div>
              </div>
              <div className="cursor-pointer" onClick={handleShowFollowing}>
                <div className="font-semibold text-lg">
                  {followStats.following}
                </div>
                <div className="text-sm text-gray-500">팔로잉</div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-8">
            {BADGES.map((badge, index) => {
              const isEarned =
                (userInfo.totalPoint || 0) >= badge.requiredPoints;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center"
                  title={`${badge.name} (${badge.requiredPoints}P)`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isEarned ? "bg-gray-100" : "bg-gray-50 opacity-30"
                    }`}
                  >
                    <span className="text-lg">{badge.emoji}</span>
                  </div>
                  <span
                    className="text-xs mt-1 text-center"
                    style={{
                      color: isEarned ? CUSTOM_PINK : "rgb(107 114 128)",
                    }}
                  >
                    {badge.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex justify-center">
            <button
              onClick={() => setSelectedTab("feed")}
              className={`pb-4 px-8 w-40 text-center ${
                selectedTab === "feed"
                  ? `border-b-2 border-[${CUSTOM_PINK}]`
                  : "text-gray-500"
              }`}
              style={{
                color: selectedTab === "feed" ? CUSTOM_PINK : undefined,
              }}
            >
              피드
            </button>
            <button
              onClick={() => setSelectedTab("comments")}
              className={`pb-4 px-8 w-40 text-center ${
                selectedTab === "comments"
                  ? `border-b-2 border-[${CUSTOM_PINK}]`
                  : "text-gray-500"
              }`}
              style={{
                color: selectedTab === "comments" ? CUSTOM_PINK : undefined,
              }}
            >
              댓글
            </button>
            <button
              onClick={() => setSelectedTab("stats")}
              className={`pb-4 px-8 w-40 text-center ${
                selectedTab === "stats"
                  ? `border-b-2 border-[${CUSTOM_PINK}]`
                  : "text-gray-500"
              }`}
              style={{
                color: selectedTab === "stats" ? CUSTOM_PINK : undefined,
              }}
            >
              디톡스정보
            </button>
          </nav>
        </div>

        {/* Tab Contents */}
        {selectedTab === "feed" && (
          <div className="grid grid-cols-2 gap-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div
                  key={post.postId}
                  className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handlePostClick(post)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">
                        @{post.userNickname}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getTimeAgo(post.createdAt)}
                      </p>
                    </div>
                  </div>
                  {post.imageUrl && getSafeImageUrl(post.imageUrl) && (
                    <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <Image
                        src={getSafeImageUrl(post.imageUrl)}
                        alt="Post image"
                        width={300}
                        height={200}
                        className="w-full h-full object-cover"
                        unoptimized={true}
                        onError={(e) => {
                          console.error("이미지 로드 실패:", post.imageUrl);
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <h3 className="font-medium mb-1">{post.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>조회 {post.viewCount || 0}</span>
                    <span>좋아요 {post.likeCount || 0}</span>
                    <span>댓글 {post.commentCount || 0}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-2 text-center py-8">
                아직 작성한 글이 없습니다.
              </p>
            )}
          </div>
        )}

        {selectedTab === "comments" && (
          <div className="space-y-4">
            {commentsLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
              </div>
            ) : userComments.length > 0 ? (
              userComments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-b pb-4 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition"
                  onClick={() => handleCommentClick(comment)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {userInfo.profileImage ? (
                          <Image
                            src={userInfo.profileImage}
                            alt="프로필 이미지"
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
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            @{userInfo.nickname}
                          </p>
                          <span className="text-xs text-gray-400">
                            {getTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-800 mt-1">{comment.content}</p>
                      {comment.post && (
                        <div className="mt-2 text-xs text-gray-500">
                          <span>게시글: {comment.post.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                아직 작성한 댓글이 없습니다.
              </p>
            )}
          </div>
        )}

        {selectedTab === "stats" && (
          <div className="max-w-[16rem] mx-auto mb-8 mt-12">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">총 인증일수</span>
                <span className="font-medium" style={{ color: CUSTOM_PINK }}>
                  {stats.detoxDays}일
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">연속 인증일수</span>
                <span className="font-medium" style={{ color: CUSTOM_PINK }}>
                  {stats.streakDays}일
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">현재 포인트</span>
                <span className="font-medium" style={{ color: CUSTOM_PINK }}>
                  {userInfo.remainingPoint}P
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">디지털 디톡스 시간</span>
                  <span className="font-medium" style={{ color: CUSTOM_PINK }}>
                    {stats.detoxTime}시간
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width:
                        userInfo.detoxGoal && userInfo.detoxGoal > 0
                          ? `${Math.min(
                              100,
                              (stats.detoxTime / userInfo.detoxGoal) * 100
                            )}%`
                          : "0%",
                      backgroundColor: CUSTOM_PINK,
                    }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">목표 달성률</span>
                  <span className="font-medium" style={{ color: CUSTOM_PINK }}>
                    {stats.completionRate}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${stats.completionRate}%`,
                      backgroundColor: CUSTOM_PINK,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 팔로워 모달 */}
        {showFollowersModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 w-72 max-w-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">팔로워</h3>
                <button
                  onClick={() => setShowFollowersModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              <div className="overflow-y-auto max-h-60">
                {isLoadingFollows ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pink-500"></div>
                  </div>
                ) : followers.length > 0 ? (
                  <ul className="space-y-2">
                    {followers.map((follower, index) => (
                      <li
                        key={index}
                        className="py-2 px-3 hover:bg-gray-100 rounded cursor-pointer"
                        onClick={() => navigateToUserProfile(follower.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <span>@{follower.nickname}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    팔로워가 없습니다.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 팔로잉 모달 */}
        {showFollowingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 w-72 max-w-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">팔로잉</h3>
                <button
                  onClick={() => setShowFollowingModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              <div className="overflow-y-auto max-h-60">
                {isLoadingFollows ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pink-500"></div>
                  </div>
                ) : followings.length > 0 ? (
                  <ul className="space-y-2">
                    {followings.map((following, index) => (
                      <li
                        key={index}
                        className="py-2 px-3 hover:bg-gray-100 rounded cursor-pointer"
                        onClick={() => navigateToUserProfile(following.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <span>@{following.nickname}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    팔로잉하는 사용자가 없습니다.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CommentModal */}
        {showCommentModal && selectedPost && (
          <CommentModal
            postId={selectedPost.postId}
            onClose={handleCloseCommentModal}
            postImage={selectedPost.imageUrl}
            postContent={selectedPost.content}
            userNickname={selectedPost.userNickname}
            createdAt={selectedPost.createdAt}
            isOwnPost={userInfo.id === selectedPost.userId}
            onUpdate={handleCommentUpdate}
            detoxTime={selectedPost.detoxTime ?? undefined}
            userId={selectedPost.userId}
          />
        )}
      </div>
    </div>
  );
}
