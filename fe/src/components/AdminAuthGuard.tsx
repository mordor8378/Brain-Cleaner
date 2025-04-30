"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

const AdminAuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { user, loading } = useUser(); // UserContext의 상태 사용
  const [isValidating, setIsValidating] = useState(true); // 가드 자체 검증 상태

  useEffect(() => {
    const validateAdminRole = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}` + "/api/v1/users/me",
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`권한 확인 실패 (${response.status})`); // 상태 코드 포함
        }

        const userData = await response.json();
        console.log("[AdminAuthGuard] 서버 직접 권한 확인:", userData.role);

        if (userData.role !== "ROLE_ADMIN") {
          console.log(
            "[AdminAuthGuard] 서버 확인 결과 관리자 아님. 리다이렉트 실행"
          );
          setIsValidating(false); // 리다이렉트 전에 상태 업데이트
          router.replace("/");
          return; // 리다이렉트 후 함수 종료
        }

        console.log("[AdminAuthGuard] 권한 확인 완료. 관리자 맞음");
        setIsValidating(false); // 유효성 검증 완료
      } catch (error) {
        console.error("[AdminAuthGuard] 권한 확인 중 오류:", error);
        setIsValidating(false); // 오류 발생 시에도 검증 상태는 완료 처리
        router.replace("/"); // 오류 시 홈으로 리다이렉트
      }
    };

    // UserContext 로딩이 완료되었을 때만 validateAdminRole 실행
    if (!loading) {
      console.log(
        "[AdminAuthGuard:useEffect] UserContext 로딩 완료. validateAdminRole 호출."
      );
      validateAdminRole();
    } else {
      console.log(
        "[AdminAuthGuard:useEffect] UserContext 로딩 중... validateAdminRole 대기."
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, router]); //

  // 로딩 중이거나 가드 자체 검증 중일 때 스피너 표시
  if (loading || isValidating) {
    console.log(
      `[AdminAuthGuard] 스피너 표시 (loading: ${loading}, isValidating: ${isValidating})`
    );
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // 모든 검증 완료 & 리다이렉트 안됐으면 자식 렌더링
  console.log("[AdminAuthGuard] 모든 검증 완료. 자식 컴포넌트 렌더링.");
  return <>{children}</>;
};

export default AdminAuthGuard;
