"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

export interface User {
  id: number;
  email: string;
  nickname: string;
  remainingPoint?: number;
  totalPoint?: number;
  role?: string;
  isSocialUser?: boolean;
  profileImage?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshUserInfo: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // 초기 로딩 상태 true
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // fetchUserInfo 함수 (refreshUserInfo 에서 사용될 수 있음)
  const fetchUserInfo = async () => {
    console.log("[UserContext:fetchUserInfo] 시작"); // 로그 추가
    try {
      console.log("[UserContext:fetchUserInfo] setLoading(true) 호출 전");
      setLoading(true);
      console.log(
        "[UserContext:fetchUserInfo] setLoading(true) 호출 후, loading 상태:",
        true
      ); // 로그 추가

      console.log("[UserContext:fetchUserInfo] /api/v1/users/me 호출 시작"); // 로그 추가
      const response = await fetch("http://localhost:8090/api/v1/users/me", {
        credentials: "include",
      });
      console.log(
        "[UserContext:fetchUserInfo] /api/v1/users/me 응답 상태:",
        response.status
      ); // 로그 추가

      if (response.ok) {
        const data = await response.json();
        console.log(
          "[UserContext:fetchUserInfo] /api/v1/users/me 성공. 데이터:",
          data
        ); // 로그 추가

        // profileImageUrl을 profileImage로 매핑
        const userData = {
          ...data,
          profileImage: data.profileImageUrl,
        };

        console.log(
          "[UserContext:fetchUserInfo] setUser(data) 호출 전. data:",
          userData
        ); // 로그 추가
        setUser(userData);
        console.log(
          "[UserContext:fetchUserInfo] setUser(data) 호출 후. user 상태:",
          userData
        ); // 로그 추가

        // 추가 정보도 로컬 스토리지에 저장
        localStorage.setItem("userId", data.id.toString());
        localStorage.setItem("nickname", data.nickname);
        localStorage.setItem("email", data.email);
        localStorage.setItem("isLoggedIn", "true");
        console.log("[UserContext:fetchUserInfo] localStorage 업데이트 완료"); // 로그 추가

        setError(null);
      } else {
        console.log("[UserContext:fetchUserInfo] /api/v1/users/me 실패."); // 로그 추가
        console.log("[UserContext:fetchUserInfo] setUser(null) 호출 전"); // 로그 추가
        setUser(null);
        console.log(
          "[UserContext:fetchUserInfo] setUser(null) 호출 후. user 상태:",
          null
        ); // 로그 추가
        localStorage.removeItem("isLoggedIn");
        setError("사용자 정보를 가져오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("[UserContext:fetchUserInfo] 오류 발생:", error); // 로그 추가
      console.log("[UserContext:fetchUserInfo] 오류 - setUser(null) 호출 전"); // 로그 추가
      setUser(null);
      console.log(
        "[UserContext:fetchUserInfo] 오류 - setUser(null) 호출 후. user 상태:",
        null
      ); // 로그 추가
      localStorage.removeItem("isLoggedIn"); // 오류 시에도 로그인 상태 제거
      setError("인증 과정에서 오류가 발생했습니다.");
    } finally {
      console.log(
        "[UserContext:fetchUserInfo] finally 블록 시작. setLoading(false) 호출 전"
      ); // 로그 추가
      setLoading(false);
      console.log(
        "[UserContext:fetchUserInfo] finally 블록 - setLoading(false) 호출 후. loading 상태:",
        false
      ); // 로그 추가
    }
  };

  // 사용자 정보 새로고침 함수
  const refreshUserInfo = async () => {
    console.log("[UserContext:refreshUserInfo] 호출됨"); // 로그 추가
    await fetchUserInfo();
  };

  // 로그아웃 함수
  const logout = async () => {
    try {
      console.log("[UserContext:logout] 시작"); // 로그 추가
      const response = await fetch(
        "http://localhost:8090/api/v1/users/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );
      console.log(
        "[UserContext:logout] 로그아웃 API 응답 상태:",
        response.status
      ); // 로그 추가

      localStorage.clear();
      sessionStorage.clear();
      console.log(
        "[UserContext:logout] localStorage/sessionStorage 클리어 완료"
      ); // 로그 추가

      console.log("[UserContext:logout] setUser(null) 호출 전"); // 로그 추가
      setUser(null);
      console.log(
        "[UserContext:logout] setUser(null) 호출 후. user 상태:",
        null
      ); // 로그 추가

      router.push("/");
      console.log("[UserContext:logout] 홈으로 리다이렉트 완료"); // 로그 추가
    } catch (error) {
      console.error("[UserContext:logout] 로그아웃 중 오류:", error); // 로그 추가
      setError("로그아웃 중 오류가 발생했습니다.");
    }
  };

  // 인증 상태 확인 로직 (주요 로직)
  useEffect(() => {
    console.log(`[UserContext:useEffect] 시작. Pathname: ${pathname}`); // 로그 추가

    const checkAuth = async () => {
      console.log("[UserContext:useEffect:checkAuth] 시작");
      try {
        console.log(
          "[UserContext:useEffect:checkAuth] setLoading(true) 호출 전"
        );
        setLoading(true);
        console.log(
          "[UserContext:useEffect:checkAuth] setLoading(true) 호출 후, loading 상태:",
          true
        ); // 로그 추가

        const urlParams = new URLSearchParams(window.location.search);
        const isSocialLogin = urlParams.get("social") === "true";
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        console.log(
          `[UserContext:useEffect:checkAuth] 소셜로그인 감지: ${isSocialLogin}, 로컬로그인상태: ${isLoggedIn}`
        ); // 로그 추가

        if (isSocialLogin) {
          console.log(
            "[UserContext:useEffect:checkAuth] 소셜 로그인 처리 시작 (URL 파라미터 제거)"
          ); // 로그 추가
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }

        if (isSocialLogin || isLoggedIn) {
          console.log(
            "[UserContext:useEffect:checkAuth] 로그인 상태 확인됨. /api/v1/users/me 호출 시작"
          ); // 로그 추가
          const response = await fetch(
            "http://localhost:8090/api/v1/users/me",
            {
              credentials: "include",
            }
          );
          console.log(
            "[UserContext:useEffect:checkAuth] /api/v1/users/me 응답 상태:",
            response.status
          ); // 로그 추가

          if (response.ok) {
            const data = await response.json();
            console.log(
              "[UserContext:useEffect:checkAuth] /api/v1/users/me 성공. 데이터:",
              data
            ); // 로그 추가

            // profileImageUrl을 profileImage로 매핑
            const userData = {
              ...data,
              profileImage: data.profileImageUrl,
            };

            console.log(
              "[UserContext:useEffect:checkAuth] setUser(data) 호출 전. data:",
              userData
            ); // 로그 추가
            setUser(userData);
            console.log(
              "[UserContext:useEffect:checkAuth] setUser(data) 호출 후. user 상태:",
              userData
            ); // 로그 추가

            console.log(
              "[UserContext:useEffect:checkAuth] localStorage 업데이트 시작"
            ); // 로그 추가
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userId", data.id.toString());
            localStorage.setItem("nickname", data.nickname);
            localStorage.setItem("email", data.email);
            localStorage.setItem("userRole", data.role); // 역할 저장 확인
            console.log(
              "[UserContext:useEffect:checkAuth] localStorage 업데이트 완료"
            ); // 로그 추가

            setError(null);

            // 이 로직은 그대로 두자 (로그인 페이지에서 관리자 자동 리다이렉트용)
            if (data.role === "ROLE_ADMIN" && pathname === "/login") {
              console.log(
                "[UserContext:useEffect:checkAuth] 관리자이고 /login 경로. /admin으로 리다이렉트."
              ); // 로그 추가
              router.push("/admin");
            }
          } else {
            console.log(
              "[UserContext:useEffect:checkAuth] /api/v1/users/me 실패."
            ); // 로그 추가
            console.log(
              "[UserContext:useEffect:checkAuth] setUser(null) 호출 전"
            ); // 로그 추가
            setUser(null);
            console.log(
              "[UserContext:useEffect:checkAuth] setUser(null) 호출 후. user 상태:",
              null
            ); // 로그 추가
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userRole"); // 실패 시 역할 정보도 제거
            setError("사용자 정보를 가져오는데 실패했습니다.");
          }
        } else {
          console.log(
            "[UserContext:useEffect:checkAuth] 로그인 상태 아님 (소셜X, 로컬 isLoggedinX). setUser(null) 호출 전"
          ); // 로그 추가
          setUser(null);
          console.log(
            "[UserContext:useEffect:checkAuth] 로그인 상태 아님. setUser(null) 호출 후. user 상태:",
            null
          ); // 로그 추가
        }
      } catch (error) {
        console.error("[UserContext:useEffect:checkAuth] 오류 발생:", error); // 로그 추가
        console.log(
          "[UserContext:useEffect:checkAuth] 오류 - setUser(null) 호출 전"
        ); // 로그 추가
        setUser(null);
        console.log(
          "[UserContext:useEffect:checkAuth] 오류 - setUser(null) 호출 후. user 상태:",
          null
        ); // 로그 추가
        localStorage.removeItem("isLoggedIn"); // 오류 시에도 로그인 상태 제거
        localStorage.removeItem("userRole"); // 오류 시 역할 정보도 제거
        setError("인증 과정에서 오류가 발생했습니다.");
      } finally {
        console.log(
          "[UserContext:useEffect:checkAuth] finally 블록 시작. setLoading(false) 호출 전"
        ); // 로그 추가
        setLoading(false);
        console.log(
          "[UserContext:useEffect:checkAuth] finally 블록 - setLoading(false) 호출 후. loading 상태:",
          false
        ); // 로그 추가
      }
    };

    checkAuth();
  }, [pathname, router]); // 의존성 배열은 그대로 유지

  return (
    <UserContext.Provider
      value={{ user, loading, error, logout, refreshUserInfo }}
    >
      {children}
    </UserContext.Provider>
  );
}

// useUser 훅 (변경 없음)
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
