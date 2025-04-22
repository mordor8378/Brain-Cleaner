'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import { UserProvider } from '@/contexts/UserContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 각 요청마다 QueryClient 인스턴스 생성
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1분
        refetchOnWindowFocus: false,
      },
    },
  }));

  // 로그인/회원가입 페이지에서는 navbar를 표시하지 않음
  const hideNavbar = pathname === '/login' || pathname === '/signup';

  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>
        {!hideNavbar && <Navbar />}
        {children}
      </QueryClientProvider>
    </UserProvider>
  );
}