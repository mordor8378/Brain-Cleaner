"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import { UserProvider } from "@/contexts/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 각 요청마다 QueryClient 인스턴스 생성 방지
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // 로그인/회원가입 페이지에서는 navbar를 표시하지 않음
  const hideNavbar = pathname === "/login" || pathname === "/signup";

  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#fff",
              color: "#333",
              boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
              borderRadius: "8px",
              padding: "12px 20px",
              maxWidth: "500px",
              width: "max-content",
              whiteSpace: "nowrap",
            },
            success: {
              style: {
                border: "1px solid #10B981",
              },
              iconTheme: {
                primary: "#10B981",
                secondary: "#FFFBEB",
              },
            },
            error: {
              style: {
                border: "1px solid #EF4444",
              },
              iconTheme: {
                primary: "#EF4444",
                secondary: "#FFFBEB",
              },
            },
          }}
        />
        {!hideNavbar && <Navbar />}
        {children}
      </QueryClientProvider>
    </UserProvider>
  );
}
