'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import { UserProvider } from '@/contexts/UserContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 로그인/회원가입 페이지에서는 navbar를 표시하지 않음
  const hideNavbar = pathname === '/login' || pathname === '/signup';

  return (
    <UserProvider>
      {!hideNavbar && <Navbar />}
      {children}
    </UserProvider>
  );
}