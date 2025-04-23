'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function MyProfile() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: null,
    nickname: '',
    email: '',
    remainingPoint: 0,
    totalPoint: 0,
    createdAt: null
  });
  const [followStats, setFollowStats] = useState({
    followers: 0,
    following: 0
  });
  const [stats] = useState({
    detoxDays: 45,
    streakDays: 12,
    detoxTime: 32,
    completionRate: 85,
    badges: 12
  });

  const [selectedTab, setSelectedTab] = useState('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('http://localhost:8090/api/v1/users/me', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
          // 사용자 정보를 가져온 후 팔로워/팔로잉 수와 게시글을 가져옴
          fetchFollowStats(data.id);
          fetchUserPosts(data.id);
        } else {
          console.error('Failed to fetch user info');
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [router]);

  const fetchFollowStats = async (userId: number) => {
    try {
      const [followersRes, followingRes] = await Promise.all([
        fetch(`http://localhost:8090/api/v1/follows/${userId}/followers/number`, {
          credentials: 'include'
        }),
        fetch(`http://localhost:8090/api/v1/follows/${userId}/followings/number`, {
          credentials: 'include'
        })
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
      const response = await fetch(`http://localhost:8090/api/v1/posts/user/${userId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
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
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-pink-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h1 className="text-xl font-semibold">@{userInfo.nickname}</h1>
            <div className="flex gap-4 my-2 text-sm">
              <div className="flex items-center gap-1">
                <span className="font-semibold">{followStats.followers}</span>
                <span className="text-gray-600">팔로워</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold">{followStats.following}</span>
                <span className="text-gray-600">팔로잉</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">{userInfo.statusMessage}</p>
            <p className="text-gray-400 text-xs mt-1">가입일: {formatDate(userInfo.createdAt || '')}</p>
          </div>
        </div>
        <button 
          onClick={() => router.push('/profile/me/edit')}
          className="bg-pink-500 text-white px-4 py-2 rounded-full text-sm hover:bg-pink-600 transition-colors"
        >
          프로필 설정
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center">
          <p className="text-gray-600">총 인증일수</p>
          <p className="text-2xl font-bold text-pink-500">{stats.detoxDays}일</p>
        </div>
        <div className="text-center">
          <p className="text-gray-600">현재 스트릭</p>
          <p className="text-2xl font-bold text-pink-500">{stats.streakDays}일</p>
        </div>
        <div className="text-center">
          <p className="text-gray-600">현재 포인트</p>
          <p className="text-2xl font-bold text-pink-500">{userInfo.remainingPoint} P</p>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-6 mb-8">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">디지털 디톡스 시간</span>
            <span className="text-sm text-pink-500">{stats.detoxTime}시간</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-pink-500 rounded-full"
              style={{ width: `${(stats.detoxTime/48)*100}%` }}
            ></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">목표 달성률</span>
            <span className="text-sm text-pink-500">{stats.completionRate}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-pink-500 rounded-full"
              style={{ width: `${stats.completionRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">획득한 뱃지</h2>
        <div className="grid grid-cols-4 gap-4">
          {Array(stats.badges).fill(0).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-3xl">🏆</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feed Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">내가 쓴 글</h2>
        <div className="border-b border-gray-200 mb-4">
          <nav className="flex gap-4">
            <button
              onClick={() => setSelectedTab('feed')}
              className={`pb-4 px-2 ${
                selectedTab === 'feed'
                  ? 'border-b-2 border-pink-500 text-pink-500'
                  : 'text-gray-500'
              }`}
            >
              피드
            </button>
            <button
              onClick={() => setSelectedTab('comments')}
              className={`pb-4 px-2 ${
                selectedTab === 'comments'
                  ? 'border-b-2 border-pink-500 text-pink-500'
                  : 'text-gray-500'
              }`}
            >
              댓글
            </button>
          </nav>
        </div>

        {selectedTab === 'feed' && (
          <div className="grid grid-cols-2 gap-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.postId} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">@{post.userNickname}</p>
                      <p className="text-xs text-gray-500">{getTimeAgo(post.createdAt)}</p>
                    </div>
                  </div>
                  <div className="aspect-video bg-gray-100 rounded-lg mb-3"></div>
                  <p className="text-sm text-gray-600">{post.content}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-2 text-center py-8">아직 작성한 글이 없습니다.</p>
            )}
          </div>
        )}

        {selectedTab === 'comments' && (
          <div className="space-y-4">
            <p className="text-gray-500 text-center py-8">아직 작성한 댓글이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
} 