"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { UserInfo } from "@/types/user";

interface Post {
  postId: number;
  userId: number;
  userNickname: string;
  categoryId: number;
  title: string;
  content: string;
  imageUrl: string;
  viewCount: number;
  likeCount: number;
  verificationImageUrl: string | null;
  detoxTime: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function OtherUserProfile() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [isFollowing, setIsFollowing] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: null,
    nickname: "",
    email: "",
    remainingPoint: 0,
    totalPoint: 0,
    createdAt: null,
    statusMessage: "",
  });
  const [followStats, setFollowStats] = useState({
    followers: 0,
    following: 0,
  });
  const [stats] = useState({
    detoxDays: 45,
    streakDays: 12,
    detoxTime: 32,
    badges: 8,
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

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        // 먼저 현재 로그인한 사용자 정보를 가져와서 본인 프로필인지 확인
        const meResponse = await fetch(
          "http://localhost:8090/api/v1/users/me",
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (meResponse.ok) {
          const meData = await meResponse.json();
          // 본인 프로필이면 /profile/me로 리다이렉트
          if (meData.id.toString() === userId) {
            router.push("/profile/me");
            return;
          }

          // 팔로우 상태 확인 - 주석 해제하고 구현
          const followStatusResponse = await fetch(
            `http://localhost:8090/api/v1/follows/check?followerId=${meData.id}&followingId=${userId}`,
            {
              credentials: "include",
            }
          );
          if (followStatusResponse.ok) {
            const followStatus = await followStatusResponse.json();
            setIsFollowing(followStatus);
          }
        }

        // 요청된 사용자의 프로필 정보 가져오기
        const response = await fetch(
          `http://localhost:8090/api/v1/users/${userId}`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
          // 사용자 정보를 가져온 후 팔로워/팔로잉 수와 게시글을 가져옴
          fetchFollowStats(data.id);
          fetchUserPosts(data.id);
        } else {
          console.error("Failed to fetch user info");
          router.push("/404"); // 사용자를 찾을 수 없는 경우 404 페이지로 이동
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserInfo();
    }
  }, [userId, router]);

  const fetchFollowStats = async (userId: number) => {
    try {
      const [followersRes, followingRes] = await Promise.all([
        fetch(
          `http://localhost:8090/api/v1/follows/${userId}/followers/number`,
          {
            credentials: "include",
          }
        ),
        fetch(
          `http://localhost:8090/api/v1/follows/${userId}/followings/number`,
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
        `http://localhost:8090/api/v1/posts/user/${userId}`,
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

  const handleFollowToggle = async () => {
    try {
      // 현재 로그인한 사용자 정보 가져오기
      const meResponse = await fetch("http://localhost:8090/api/v1/users/me", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!meResponse.ok) {
        console.error("Failed to fetch current user info");
        return;
      }

      const meData = await meResponse.json();

      if (isFollowing) {
        // 언팔로우 로직 - 백엔드 API 수정사항 반영
        const unfollowResponse = await fetch(
          `http://localhost:8090/api/v1/follows/${meData.id}/${userInfo.id}`,
          {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (unfollowResponse.ok) {
          setIsFollowing(false);
          // 팔로워 수 업데이트
          if (userInfo.id !== null) {
            fetchFollowStats(userInfo.id);
          }
        } else {
          console.error(
            `Failed to unfollow. Status: ${unfollowResponse.status}`,
            await unfollowResponse.text()
          );
        }
      } else {
        // 팔로우 로직
        // API 엔드포인트 확인 - "/api/v1/follows"로 POST 요청
        console.log("Sending follow request:", {
          followerId: meData.id,
          followingId: userInfo.id,
        });

        const followResponse = await fetch(
          "http://localhost:8090/api/v1/follows",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              followerId: meData.id,
              followingId: userInfo.id,
            }),
          }
        );

        if (followResponse.ok) {
          setIsFollowing(true);
          // 팔로워 수 업데이트
          if (userInfo.id !== null) {
            fetchFollowStats(userInfo.id);
          }
        } else {
          console.error(
            `Failed to follow. Status: ${followResponse.status}`,
            await followResponse.text()
          );
        }
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
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
        `http://localhost:8090/api/v1/follows/${userId}/followers`,
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
        `http://localhost:8090/api/v1/follows/${userId}/followings`,
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white min-h-screen">
      {/* Profile Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <Image
              src="/placeholder-avatar.png"
              alt="Profile"
              width={80}
              height={80}
              className="rounded-full"
            />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-gray-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h1 className="text-xl font-semibold">
              @{userInfo.nickname || "loading..."}
            </h1>
            <div className="flex gap-4 my-2 text-sm">
              <div
                className="flex items-center gap-1 cursor-pointer hover:text-pink-500"
                onClick={handleShowFollowers}
              >
                <span className="font-semibold">{followStats.followers}</span>
                <span className="text-gray-600 hover:text-pink-500">
                  팔로워
                </span>
              </div>
              <div
                className="flex items-center gap-1 cursor-pointer hover:text-pink-500"
                onClick={handleShowFollowing}
              >
                <span className="font-semibold">{followStats.following}</span>
                <span className="text-gray-600 hover:text-pink-500">
                  팔로잉
                </span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              {userInfo.statusMessage || "상태 메시지가 없습니다."}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              가입일: {formatDate(userInfo.createdAt || "")}
            </p>
          </div>
        </div>
        <button
          onClick={handleFollowToggle}
          className={`px-4 py-2 rounded-full text-sm transition-colors ${
            isFollowing
              ? "bg-white text-black border border-gray-300 hover:bg-gray-100"
              : "bg-pink-500 text-white hover:bg-pink-600"
          }`}
        >
          {isFollowing ? "언팔로우" : "팔로우"}
        </button>
      </div>

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

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center">
          <p className="text-gray-600">총 인증일수</p>
          <p className="text-2xl font-bold text-pink-500">
            {stats.detoxDays}일
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-600">연속인증일수</p>
          <p className="text-2xl font-bold text-pink-500">
            {stats.streakDays}일
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-600">현재 포인트</p>
          <p className="text-2xl font-bold text-pink-500">
            {userInfo.remainingPoint} P
          </p>
        </div>
      </div>

      {/* Progress Bars - 디지털 디톡스 시간만 유지하고 목표 달성률은 삭제 */}
      <div className="space-y-6 mb-8">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">디지털 디톡스 시간</span>
            <span className="text-sm text-pink-500">{stats.detoxTime}시간</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-pink-500 rounded-full"
              style={{ width: `${(stats.detoxTime / 48) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">획득한 뱃지</h2>
        <div className="grid grid-cols-4 gap-4">
          {Array(stats.badges)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center"
              >
                <span className="text-3xl">🏆</span>
              </div>
            ))}
        </div>
      </div>

      {/* Feed Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">작성한 글</h2>
        <div className="border-b border-gray-200 mb-4">
          <nav className="flex gap-4">
            <button
              onClick={() => setSelectedTab("feed")}
              className={`pb-4 px-2 ${
                selectedTab === "feed"
                  ? "border-b-2 border-pink-500 text-pink-500"
                  : "text-gray-500"
              }`}
            >
              피드
            </button>
            <button
              onClick={() => setSelectedTab("comments")}
              className={`pb-4 px-2 ${
                selectedTab === "comments"
                  ? "border-b-2 border-pink-500 text-pink-500"
                  : "text-gray-500"
              }`}
            >
              댓글
            </button>
          </nav>
        </div>

        {selectedTab === "feed" && (
          <div className="grid grid-cols-2 gap-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div
                  key={post.postId}
                  className="bg-white rounded-lg shadow p-4"
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
                  {post.imageUrl && (
                    <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <Image
                        src={post.imageUrl}
                        alt="Post image"
                        width={300}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h3 className="font-medium mb-1">{post.title}</h3>
                  <p className="text-sm text-gray-600">{post.content}</p>
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
            <p className="text-gray-500 text-center py-8">
              아직 작성한 댓글이 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
