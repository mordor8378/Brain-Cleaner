'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaStore } from 'react-icons/fa';
import { axiosInstance } from '@/utils/api/axios';
import { toast } from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  email: string;
  remainingPoint: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await axiosInstance.get('/api/v1/users/me');
      setUser(response.data);
    } catch (error) {
      toast.error('프로필 정보를 불러오는데 실패했습니다.');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">내 프로필</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/point-store"
              className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
            >
              <FaStore className="text-xl" />
              <span>포인트 상점</span>
            </Link>
            <span className="text-gray-500">
              보유 포인트: {user.remainingPoint}P
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-gray-600">사용자 이름</label>
              <p className="text-lg font-medium">{user.username}</p>
            </div>
            <div>
              <label className="text-gray-600">이메일</label>
              <p className="text-lg font-medium">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
