"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 로그인 요청
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}` + "/api/v1/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        }
      );

      if (response.ok) {
        const userData = await response.json();
        console.log("로그인 응답 데이터:", JSON.stringify(userData, null, 2));

        // 로그인 성공시 로그인 상태와 사용자 정보 저장
        localStorage.setItem("isLoggedIn", "true");

        localStorage.setItem("userRole", userData.role);
        localStorage.setItem("userId", userData.id.toString());
        localStorage.setItem("userEmail", userData.email);
        localStorage.setItem("userNickname", userData.nickname);

        // 사용자 역할에 따라 다른 페이지로 리다이렉트
        if (userData.role === "ROLE_ADMIN") {
          router.push("/admin?login=true");
        } else {
          router.push("/?login=true");
        }
      } else {
        let errorMessage = "로그인에 실패했습니다.";

        if (response.status === 403) {
          errorMessage =
            "해당 ID는 정지된 계정입니다.\n자세한 내용은 관리자에게 문의해주세요.";
        }
        toast.error(errorMessage);

        // // 서버에서 반환된 에러 메시지 사용
        // if (data.message === 'USER_NOT_FOUND') {
        //   setError('존재하지 않는 사용자입니다.');
        // } else if (data.message === 'INVALID_PASSWORD') {
        //   setError('비밀번호가 일치하지 않습니다.');
        // } else {
        //   setError(data.message || '로그인에 실패했습니다.');
        // }
      }
    } catch (error) {
      console.error("로그인 중 오류 발생:", error);
      toast.error("서버 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    localStorage.clear();
    sessionStorage.clear();

    // 메인 페이지로 리다이렉트
    const redirectUrl = window.location.origin + "?social=true";
    window.location.href =
      `${process.env.NEXT_PUBLIC_API_BASE_URL}` +
      `/oauth2/authorization/kakao?redirectUrl=${redirectUrl}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          {/* 아이콘 경로 수정 필요 */}
          <img
            src="/brain-icon.png"
            alt="Brain Cleaner"
            className="h-12 w-auto"
          />
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span className="ml-2 text-lg font-medium">로그인</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded whitespace-pre-wrap">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                이메일
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 placeholder-gray-400 focus:border-pink-500 focus:outline-none focus:ring-pink-500"
                  placeholder="이메일을 입력해주세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                비밀번호
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 placeholder-gray-400 focus:border-pink-500 focus:outline-none focus:ring-pink-500"
                  placeholder="비밀번호를 입력해주세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                아이디 저장
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-md border border-transparent py-3 px-4 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                style={{ backgroundColor: "#F742CD" }}
              >
                {isLoading ? "로그인 중..." : "로그인"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">간편 로그인</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleKakaoLogin}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-yellow-400 py-3 px-4 text-sm font-medium text-black hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                <span className="flex items-center">
                  <svg
                    width="18"
                    height="18"
                    viewBox="2 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 3C6.5 3 2 6.5 2 10.9c0 3 1.5 5.5 4.7 7 0 0 0 0-.3 2-1 3 3 1.5 3 1.5l5-3c1.1 0.1 1.5 0 2.5 0 5.5 0 10-3.5 10-7.9s-4.5-7.5-10-7.5z" />
                  </svg>
                  <span className="ml-2">카카오로 로그인</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-sm">
          <p className="text-gray-600">
            아직 회원이 아니신가요?
            <Link
              href="/signup"
              className="ml-1 font-medium text-pink-500 hover:text-pink-600"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
