'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    nickname?: string;
    general?: string;
  }>({});
  
  const router = useRouter();
  
  const validate = () => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
      nickname?: string;
    } = {};
    
    if (!email) newErrors.email = '이메일은 필수입니다.';
    if (!password) newErrors.password = '비밀번호는 필수입니다.';
    if (password && password.length < 6) newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    if (password !== confirmPassword) newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    if (!nickname) newErrors.nickname = '닉네임은 필수입니다.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8090/api/v1/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          nickname,
        }),
      });
      
      if (response.ok) {
        // 회원가입 성공 시 로그인 페이지로 이동
        router.push('/login?signup=success');
      } else {
        const errorData = await response.json().catch(() => null);
        setErrors({
          ...errors,
          general: errorData?.message || '회원가입에 실패했습니다.',
        });
      }
    } catch (error) {
      console.error('회원가입 중 오류 발생:', error);
      setErrors({
        ...errors,
        general: '서버 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          {/* TODO: 아이콘 경로 수정 필요 */}
          <img src="/brain-icon.png" alt="Brain Cleaner" className="h-12 w-auto" />
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="mb-6">
            <Link href="/" className="flex items-center text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span className="ml-2 text-lg font-medium">회원가입</span>
            </Link>
          </div>
          
          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {errors.general}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`pl-10 block w-full rounded-md border ${errors.email ? 'border-red-300' : 'border-gray-300'} py-2 px-3 text-gray-700 placeholder-gray-400 focus:border-pink-500 focus:outline-none focus:ring-pink-500`}
                  placeholder="이메일을 입력해주세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`pl-10 block w-full rounded-md border ${errors.password ? 'border-red-300' : 'border-gray-300'} py-2 px-3 text-gray-700 placeholder-gray-400 focus:border-pink-500 focus:outline-none focus:ring-pink-500`}
                  placeholder="비밀번호를 입력해주세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`pl-10 block w-full rounded-md border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} py-2 px-3 text-gray-700 placeholder-gray-400 focus:border-pink-500 focus:outline-none focus:ring-pink-500`}
                  placeholder="비밀번호를 다시 입력해주세요"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>

            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <input
                  id="nickname"
                  name="nickname"
                  type="text"
                  autoComplete="nickname"
                  required
                  className={`pl-10 block w-full rounded-md border ${errors.nickname ? 'border-red-300' : 'border-gray-300'} py-2 px-3 text-gray-700 placeholder-gray-400 focus:border-pink-500 focus:outline-none focus:ring-pink-500`}
                  placeholder="닉네임을 입력해주세요"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>
              {errors.nickname && <p className="mt-1 text-xs text-red-500">{errors.nickname}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-pink-500 py-3 px-4 text-sm font-medium text-white hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              >
                {isLoading ? '처리 중...' : '회원가입'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-4 text-center text-sm">
          <p className="text-gray-600">
            이미 계정이 있으신가요? 
            <Link href="/login" className="ml-1 font-medium text-pink-500 hover:text-pink-600">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}