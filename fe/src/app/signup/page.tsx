"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { debounce } from "lodash";
import { toast } from "react-hot-toast";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordScore, setPasswordScore] = useState(0);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    cases: false,
    numbers: false,
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);

  const [nickname, setNickname] = useState("");
  const [nicknameValid, setNicknameValid] = useState<boolean | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [nicknameChecking, setNicknameChecking] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const router = useRouter();

  // 이메일 유효성 검사
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // 이메일 중복 체크
  const checkEmailDuplicate = async (email: string) => {
    if (!validateEmail(email)) {
      setEmailValid(false);
      setEmailError("유효한 이메일 형식이 아닙니다.");
      return;
    }

    setEmailChecking(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}` +
          `/api/v1/users/check-email?email=${encodeURIComponent(email)}`
      );
      const data = await response.json();

      if (data.exists) {
        setEmailValid(false);
        setEmailError("이미 등록된 이메일입니다.");
      } else {
        setEmailValid(true);
        setEmailError(null);
      }
    } catch (error) {
      console.error("이메일 중복 체크 중 오류 발생:", error);
      setEmailValid(false);
      setEmailError("서버 오류가 발생했습니다.");
    } finally {
      setEmailChecking(false);
    }
  };

  // 닉네임 중복 체크
  const checkNicknameDuplicate = async (nickname: string) => {
    if (!nickname.trim()) {
      setNicknameValid(false);
      setNicknameError("닉네임을 입력해주세요.");
      return;
    }

    setNicknameChecking(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}` +
          `/api/v1/users/check-nickname?nickname=${encodeURIComponent(
            nickname
          )}`
      );
      const data = await response.json();

      if (data.exists) {
        setNicknameValid(false);
        setNicknameError("이미 사용 중인 닉네임입니다.");
      } else {
        setNicknameValid(true);
        setNicknameError(null);
      }
    } catch (error) {
      console.error("닉네임 중복 체크 중 오류 발생:", error);
      setNicknameValid(false);
      setNicknameError("서버 오류가 발생했습니다.");
    } finally {
      setNicknameChecking(false);
    }
  };

  // 비밀번호 강도 검사
  const checkPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      cases: /(?=.*[a-z])(?=.*[A-Z])/.test(password),
      numbers: /\d/.test(password),
    };

    setPasswordChecks(checks);

    // 비밀번호 강도 점수 계산 (0-3)
    const score = Object.values(checks).filter(Boolean).length;
    setPasswordScore(score);

    // 비밀번호 확인 체크
    if (confirmPassword) {
      if (password !== confirmPassword) {
        setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
      } else {
        setConfirmPasswordError(null);
      }
    }
  };

  // 디바운스 처리 (유저가 입력을 마쳤을때 체크를 하도록 -> 불필요한 서버 요청을 줄임)
  const debouncedEmailCheck = useRef(
    debounce((email: string) => checkEmailDuplicate(email), 500)
  ).current;

  const debouncedNicknameCheck = useRef(
    debounce((nickname: string) => checkNicknameDuplicate(nickname), 500)
  ).current;

  // 이메일 변경 핸들러
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (!value) {
      setEmailValid(null);
      setEmailError(null);
      return;
    }

    if (!validateEmail(value)) {
      setEmailValid(false);
      setEmailError("유효한 이메일 형식이 아닙니다.");
      return;
    }

    debouncedEmailCheck(value);
  };

  // 닉네임 변경 핸들러
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);

    if (!value) {
      setNicknameValid(null);
      setNicknameError(null);
      return;
    }

    debouncedNicknameCheck(value);
  };

  // 비밀번호 변경 핸들러
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    checkPasswordStrength(value);
  };

  // 비밀번호 확인 변경 핸들러
  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (value && password !== value) {
      setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setConfirmPasswordError(null);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordScore === 0) return "bg-gray-200";
    if (passwordScore === 1) return "bg-red-500";
    if (passwordScore === 2) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthWidth = () => {
    if (passwordScore === 0) return "0%";
    if (passwordScore === 1) return "33%";
    if (passwordScore === 2) return "66%";
    return "100%";
  };

  const getPasswordMessage = () => {
    if (!password) return null;
    if (passwordScore === 1)
      return "비밀번호가 너무 약합니다. 최소 2가지 이상의 규칙을 충족해주세요.";
    if (passwordScore === 2)
      return "사용 가능한 비밀번호입니다. 모든 규칙을 충족하면 더 안전합니다.";
    if (passwordScore === 3) return "안전한 비밀번호입니다!";
    return null;
  };

  const isFormValid = () => {
    return (
      emailValid === true &&
      passwordScore >= 2 &&
      !confirmPasswordError &&
      nicknameValid === true
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      toast.error("입력 정보를 확인해주세요.");
      return;
    }

    setIsLoading(true);
    setGeneralError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}` + "/api/v1/users/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
            nickname,
          }),
        }
      );

      if (response.ok) {
        toast.success("회원가입에 성공했습니다.");
        // 회원가입 성공 시 로그인 페이지로 이동
        router.push("/login?signup=success");
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.message || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      console.error("회원가입 중 오류 발생:", error);
      toast.error("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          {/* TODO: 아이콘 경로 수정 필요 */}
          <img
            src="/brain-icon.png"
            alt="Brain Cleaner"
            className="h-12 w-auto"
          />
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="mb-6">
            <Link href="/" className="flex items-center text-gray-600">
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
              <span className="ml-2 text-lg font-medium">회원가입</span>
            </Link>
          </div>

          {generalError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className={`pl-10 block w-full rounded-md border ${
                    emailValid === false
                      ? "border-red-300"
                      : emailValid === true
                      ? "border-green-300"
                      : "border-gray-300"
                  } py-2 px-3 text-gray-700 placeholder-gray-400 focus:outline-none ${
                    emailValid === false
                      ? "focus:border-red-500 focus:ring-red-500"
                      : emailValid === true
                      ? "focus:border-green-500 focus:ring-green-500"
                      : "focus:border-pink-500 focus:ring-pink-500"
                  }`}
                  placeholder="이메일을 입력해주세요"
                  value={email}
                  onChange={handleEmailChange}
                />
                {emailChecking && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                )}
                {emailValid === true && !emailChecking && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {emailError && (
                <p className="mt-1 text-xs text-red-500">{emailError}</p>
              )}
              {emailValid === true && (
                <p className="mt-1 text-xs text-green-500">
                  사용 가능한 이메일입니다!
                </p>
              )}
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
                  autoComplete="new-password"
                  required
                  className={`pl-10 block w-full rounded-md border py-2 px-3 text-gray-700 placeholder-gray-400 focus:outline-none ${
                    passwordScore === 0
                      ? "border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                      : passwordScore === 1
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : passwordScore === 2
                      ? "border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                      : "border-green-300 focus:border-green-500 focus:ring-green-500"
                  }`}
                  placeholder="비밀번호를 입력해주세요"
                  value={password}
                  onChange={handlePasswordChange}
                />
              </div>

              <div className="mt-2">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                    style={{ width: getPasswordStrengthWidth() }}
                  ></div>
                </div>

                <p
                  className={`mt-1 text-xs ${
                    passwordScore === 1
                      ? "text-red-500"
                      : passwordScore === 2
                      ? "text-yellow-500"
                      : passwordScore === 3
                      ? "text-green-500"
                      : ""
                  }`}
                >
                  {getPasswordMessage()}
                </p>

                <ul className="mt-2 space-y-1 text-xs">
                  <li
                    className={`flex items-center ${
                      passwordChecks.length ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {passwordChecks.length ? (
                      <svg
                        className="h-4 w-4 text-green-500 mr-1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-4 w-4 text-red-500 mr-1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    최소 8자리 이상
                  </li>
                  <li
                    className={`flex items-center ${
                      passwordChecks.cases ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {passwordChecks.cases ? (
                      <svg
                        className="h-4 w-4 text-green-500 mr-1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-4 w-4 text-red-500 mr-1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    영문 대소문자 포함
                  </li>
                  <li
                    className={`flex items-center ${
                      passwordChecks.numbers ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {passwordChecks.numbers ? (
                      <svg
                        className="h-4 w-4 text-green-500 mr-1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-4 w-4 text-red-500 mr-1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    숫자 포함
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                비밀번호 확인
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
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`pl-10 block w-full rounded-md border ${
                    confirmPasswordError
                      ? "border-red-300"
                      : confirmPassword && !confirmPasswordError
                      ? "border-green-300"
                      : "border-gray-300"
                  } py-2 px-3 text-gray-700 placeholder-gray-400 focus:outline-none ${
                    confirmPasswordError
                      ? "focus:border-red-500 focus:ring-red-500"
                      : confirmPassword && !confirmPasswordError
                      ? "focus:border-green-500 focus:ring-green-500"
                      : "focus:border-pink-500 focus:ring-pink-500"
                  }`}
                  placeholder="비밀번호를 다시 입력해주세요"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                />
                {confirmPassword && !confirmPasswordError && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {confirmPasswordError && (
                <p className="mt-1 text-xs text-red-500">
                  {confirmPasswordError}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="nickname"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                닉네임
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
                  className={`pl-10 block w-full rounded-md border ${
                    nicknameValid === false
                      ? "border-red-300"
                      : nicknameValid === true
                      ? "border-green-300"
                      : "border-gray-300"
                  } py-2 px-3 text-gray-700 placeholder-gray-400 focus:outline-none ${
                    nicknameValid === false
                      ? "focus:border-red-500 focus:ring-red-500"
                      : nicknameValid === true
                      ? "focus:border-green-500 focus:ring-green-500"
                      : "focus:border-pink-500 focus:ring-pink-500"
                  }`}
                  placeholder="닉네임을 입력해주세요"
                  value={nickname}
                  onChange={handleNicknameChange}
                />
                {nicknameChecking && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                )}
                {nicknameValid === true && !nicknameChecking && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {nicknameError && (
                <p className="mt-1 text-xs text-red-500">{nicknameError}</p>
              )}
              {nicknameValid === true && (
                <p className="mt-1 text-xs text-green-500">
                  사용 가능한 닉네임입니다!
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !isFormValid()}
                className={`group relative flex w-full justify-center rounded-md border border-transparent py-3 px-4 text-sm font-medium text-white ${
                  isFormValid()
                    ? "bg-[#F742CD] hover:opacity-90"
                    : "bg-gray-400 cursor-not-allowed"
                } focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2`}
              >
                {isLoading ? "처리 중..." : "회원가입"}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-4 text-center text-sm">
          <p className="text-gray-600">
            이미 계정이 있으신가요?
            <Link
              href="/login"
              className="ml-1 font-medium text-pink-500 hover:text-pink-600"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
