'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { UserInfo } from '@/types/user';

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

const CUSTOM_PINK = '#F742CD';

const BADGES = [
  { name: '디톡스새싹', requiredPoints: 0, emoji: '🌱' },
  { name: '절제수련생', requiredPoints: 100, emoji: '🧘' },
  { name: '집중탐험가', requiredPoints: 600, emoji: '🔍' },
  { name: '선명한의식', requiredPoints: 2000, emoji: '✨' },
  { name: '도파민파괴자', requiredPoints: 4500, emoji: '💥' },
  { name: '브레인클리너', requiredPoints: 7500, emoji: '🧠' },
];

export default function OtherUserProfile() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [isFollowing, setIsFollowing] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: null,
    nickname: '',
    email: '',
    remainingPoint: 0,
    totalPoint: 0,
    createdAt: null,
    statusMessage: '',
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

  const [selectedTab, setSelectedTab] = useState('feed');
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
          'http://localhost:8090/api/v1/users/me',
          {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (meResponse.ok) {
          const meData = await meResponse.json();
          // 본인 프로필이면 /profile/me로 리다이렉트
          if (meData.id.toString() === userId) {
            router.push('/profile/me');
            return;
          }

          // 팔로우 상태 확인 - 주석 해제하고 구현
          const followStatusResponse = await fetch(
            `http://localhost:8090/api/v1/follows/check?followerId=${meData.id}&followingId=${userId}`,
            {
              credentials: 'include',
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
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // profileImageUrl을 profileImage로 매핑
          const userData = {
            ...data,
            profileImage: data.profileImageUrl,
          };
          setUserInfo(userData);
          // 사용자 정보를 가져온 후 팔로워/팔로잉 수와 게시글을 가져옴
          fetchFollowStats(data.id);
          fetchUserPosts(data.id);
        } else {
          console.error('Failed to fetch user info');
          router.push('/404'); // 사용자를 찾을 수 없는 경우 404 페이지로 이동
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
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
            credentials: 'include',
          }
        ),
        fetch(
          `http://localhost:8090/api/v1/follows/${userId}/followings/number`,
          {
            credentials: 'include',
          }
        ),
      ]);

      if (followersRes.ok && followingRes.ok) {
        const followers = await followersRes.json();
        const following = await followingRes.json();
        setFollowStats({ followers, following });
      }
    } catch (error) {
      console.error('Error fetching follow stats:', error);
    }
  };

  const fetchUserPosts = async (userId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8090/api/v1/posts/user/${userId}`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const handleFollowToggle = async () => {
    try {
      // 현재 로그인한 사용자 정보 가져오기
      const meResponse = await fetch('http://localhost:8090/api/v1/users/me', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!meResponse.ok) {
        console.error('Failed to fetch current user info');
        return;
      }

      const meData = await meResponse.json();

      if (isFollowing) {
        // 언팔로우 로직 - 백엔드 API 수정사항 반영
        const unfollowResponse = await fetch(
          `http://localhost:8090/api/v1/follows/${meData.id}/${userInfo.id}`,
          {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
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
        console.log('Sending follow request:', {
          followerId: meData.id,
          followingId: userInfo.id,
        });

        const followResponse = await fetch(
          'http://localhost:8090/api/v1/follows',
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
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
      console.error('Error toggling follow status:', error);
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
    return '방금 전';
  };

  // 팔로워 목록 가져오기 - "나를 팔로우하는 사람들"
  const fetchFollowers = async (userId: number) => {
    try {
      setIsLoadingFollows(true);
      const response = await fetch(
        `http://localhost:8090/api/v1/follows/${userId}/followers`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFollowers(data);
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
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
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFollowings(data);
      }
    } catch (error) {
      console.error('Error fetching followings:', error);
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
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header with username and follow button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{userInfo.nickname}</h1>
          <button
            onClick={handleFollowToggle}
            className={`w-20 text-white px-3 py-1.5 rounded-md text-sm hover:opacity-90 transition-colors ${
              isFollowing ? 'bg-gray-400' : ''
            }`}
            style={{ backgroundColor: isFollowing ? undefined : CUSTOM_PINK }}
          >
            {isFollowing ? '팔로잉' : '팔로우'}
          </button>
        </div>

        {/* Profile Info */}
        <div className="flex items-start gap-12 mb-8">
          <div className="flex flex-col items-center gap-4">
            {/* Profile Image */}
            <div className="relative">
              <Image
                src={userInfo.profileImage || '/placeholder-avatar.png'}
                alt="Profile"
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
              <div
                className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white"
                style={{ backgroundColor: CUSTOM_PINK }}
              ></div>
            </div>
            {/* Status Message Container - Always present for consistent layout */}
            <div className="w-[16rem]">
              {userInfo.statusMessage && (
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {userInfo.statusMessage}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="w-[16rem]">
            <div className="grid grid-cols-3 text-center">
              <div>
                <div className="font-semibold text-lg">{stats.detoxDays}</div>
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
                      isEarned ? 'bg-gray-100' : 'bg-gray-50 opacity-30'
                    }`}
                  >
                    <span className="text-lg">{badge.emoji}</span>
                  </div>
                  <span
                    className="text-xs mt-1 text-center"
                    style={{
                      color: isEarned ? CUSTOM_PINK : 'rgb(107 114 128)',
                    }}
                  >
                    {badge.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feed Section */}
        <div>
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex justify-center">
              <button
                onClick={() => setSelectedTab('feed')}
                className={`pb-4 px-8 w-40 text-center ${
                  selectedTab === 'feed'
                    ? `border-b-2 border-[${CUSTOM_PINK}]`
                    : 'text-gray-500'
                }`}
                style={{
                  color: selectedTab === 'feed' ? CUSTOM_PINK : undefined,
                }}
              >
                피드
              </button>
              <button
                onClick={() => setSelectedTab('comments')}
                className={`pb-4 px-8 w-40 text-center ${
                  selectedTab === 'comments'
                    ? `border-b-2 border-[${CUSTOM_PINK}]`
                    : 'text-gray-500'
                }`}
                style={{
                  color: selectedTab === 'comments' ? CUSTOM_PINK : undefined,
                }}
              >
                댓글
              </button>
              <button
                onClick={() => setSelectedTab('stats')}
                className={`pb-4 px-8 w-40 text-center ${
                  selectedTab === 'stats'
                    ? `border-b-2 border-[${CUSTOM_PINK}]`
                    : 'text-gray-500'
                }`}
                style={{
                  color: selectedTab === 'stats' ? CUSTOM_PINK : undefined,
                }}
              >
                디톡스정보
              </button>
            </nav>
          </div>

          {selectedTab === 'feed' && (
            <div className="grid grid-cols-2 gap-4">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post.postId} className="border rounded-lg p-4">
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

          {selectedTab === 'comments' && (
            <div className="space-y-4">
              <p className="text-gray-500 text-center py-8">
                아직 작성한 댓글이 없습니다.
              </p>
            </div>
          )}

          {selectedTab === 'stats' && (
            <div className="max-w-[16rem] mx-auto">
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
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">디지털 디톡스 시간</span>
                    <span
                      className="font-medium"
                      style={{ color: CUSTOM_PINK }}
                    >
                      {stats.detoxTime}시간
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${(stats.detoxTime / 48) * 100}%`,
                        backgroundColor: CUSTOM_PINK,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
