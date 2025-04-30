"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  userId: number;
  nickname: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}
interface PageInfo {
  content: User[];
  number: number;
  totalPages: number;
  totalElements: number;
}
interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [searchParams, setSearchParams] = useState({
    nickname: "",
    email: "",
    role: "",
    status: "",
  });

  const fetchUsers = useCallback(
    async (page = 1) => {
      const apiPage = page - 1;
      console.log(
        `[fetchUsers] ${page} 페이지 (API 요청 시 ${apiPage}) 데이터 로딩 시작...`
      );
      setIsLoading(true);

      try {
        const queryParams = new URLSearchParams({
          page: apiPage.toString(),
          size: "10",
          sort: "createdAt,desc",
          ...(searchParams.nickname && { nickname: searchParams.nickname }),
          ...(searchParams.email && { email: searchParams.email }),
          ...(searchParams.role && { role: searchParams.role }),
          ...(searchParams.status && { status: searchParams.status }),
        });

        const backendApiUrl =
          `${process.env.NEXT_PUBLIC_API_BASE_URL}` + "/api/admin/users";
        console.log(
          `[fetchUsers] Request URL: ${backendApiUrl}?${queryParams}`
        );

        const response = await fetch(`${backendApiUrl}?${queryParams}`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.error("[fetchUsers] Error 401: 인증 실패");
            alert("로그인이 필요하거나 세션이 만료되었습니다.");
            router.push("/login");
            return;
          } else if (response.status === 403) {
            console.error("[fetchUsers] Error 403: 권한 없음");
            alert("관리자 권한이 없습니다.");
            router.push("/");
            return;
          }
          const errorText = await response.text();
          console.error(
            `[fetchUsers] API Error Response (${response.status}):`,
            errorText
          );
          throw new Error(
            `Failed to fetch users: ${response.status} ${response.statusText}`
          );
        }

        const data: PageInfo = await response.json();
        console.log("[fetchUsers] Received data:", data);

        setUsers(Array.isArray(data.content) ? data.content : []);
        setPagination({
          currentPage: (data.number ?? 0) + 1,
          totalPages: data.totalPages ?? 1,
          totalItems: data.totalElements ?? 0,
        });
        console.log("[fetchUsers] 상태 업데이트 완료");
      } catch (error) {
        console.error("[fetchUsers] 데이터 로딩 중 오류 발생:", error);
        setUsers([]);
        setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
        const errorMessage =
          error instanceof Error ? error.message : "알 수 없는 오류 발생";
        alert(
          `사용자 목록을 불러오는 중 오류가 발생했습니다.\n${errorMessage}`
        );
      } finally {
        setIsLoading(false);
        console.log("[fetchUsers] 로딩 완료 처리");
      }
    },
    [searchParams, router]
  );

  useEffect(() => {
    console.log("[AdminUsersPage] Initial fetch on mount.");
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    console.log("[AdminUsersPage] Search button clicked.");
    fetchUsers(1);
  };

  const handleReset = () => {
    console.log("[AdminUsersPage] Reset button clicked (original version).");
    setSearchParams({ nickname: "", email: "", role: "", status: "" });
    fetchUsers(1);
  };

  const handlePageChange = (newPage: number) => {
    console.log(`[AdminUsersPage] Page changed to: ${newPage}`);
    if (
      newPage >= 1 &&
      newPage <= pagination.totalPages &&
      newPage !== pagination.currentPage
    ) {
      fetchUsers(newPage);
    }
  };

  const getRoleClass = (role: string) => {
    switch (role) {
      case "디톡스새싹":
        return "bg-green-100 text-green-800";
      case "절제수련생":
        return "bg-blue-100 text-blue-800";
      case "집중탐험가":
        return "bg-indigo-100 text-indigo-800";
      case "선명한의식":
        return "bg-purple-100 text-purple-800";
      case "도파민파괴자":
        return "bg-pink-100 text-pink-800";
      case "브레인클리너":
        return "bg-yellow-100 text-yellow-800";
      case "관리자":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const getStatusClass = (status: string) => {
    switch (status) {
      case "계정활성":
        return "bg-green-100 text-green-800";
      case "계정정지":
        return "bg-yellow-100 text-yellow-800";
      case "계정삭제":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  console.log("사용자 데이터 확인:", users);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">회원 목록 관리</h1>
        <button
          onClick={() => fetchUsers(pagination.currentPage)}
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-white !rounded-button flex items-center gap-1 whitespace-nowrap disabled:opacity-50"
        >
          <span
            className={`w-5 h-5 flex items-center justify-center ${
              isLoading ? "animate-spin" : ""
            }`}
          >
            <i className="ri-refresh-line"></i>
          </span>
          새로고침
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              닉네임
            </label>
            <input
              key="nickname-input"
              type="text"
              id="nickname"
              value={searchParams.nickname}
              onChange={(e) =>
                setSearchParams({ ...searchParams, nickname: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="닉네임을 입력하세요"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              이메일
            </label>
            <input
              key="email-input"
              type="email"
              id="email"
              value={searchParams.email}
              onChange={(e) =>
                setSearchParams({ ...searchParams, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="이메일을 입력하세요"
            />
          </div>
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              역할
            </label>
            <div className="relative">
              <select
                id="role"
                value={searchParams.role}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, role: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-8 bg-white disabled:bg-gray-50"
              >
                <option value="">전체 역할</option>
                <option value="ROLE_ADMIN">관리자</option>
                <option value="ROLE_USER_SPROUT">디톡스새싹</option>
                <option value="ROLE_USER_TRAINEE">절제수련생</option>
                <option value="ROLE_USER_EXPLORER">집중탐험가</option>
                <option value="ROLE_USER_CONSCIOUS">선명한의식</option>
                <option value="ROLE_USER_DESTROYER">도파민파괴자</option>
                <option value="ROLE_USER_CLEANER">브레인클리너</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <span className="w-5 h-5 flex items-center justify-center text-gray-500">
                  <i className="ri-arrow-down-s-line"></i>
                </span>
              </div>
            </div>
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              상태
            </label>
            <div className="relative">
              <select
                id="status"
                value={searchParams.status}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-8 bg-white disabled:bg-gray-50"
              >
                <option value="">전체 상태</option>
                <option value="ACTIVE">계정활성</option>
                <option value="SUSPENDED">계정정지</option>
                <option value="DELETED">계정삭제</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <span className="w-5 h-5 flex items-center justify-center text-gray-500">
                  <i className="ri-arrow-down-s-line"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 text-gray-700 !rounded-button whitespace-nowrap disabled:opacity-50"
          >
            초기화
          </button>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-4 py-2 bg-primary text-white !rounded-button whitespace-nowrap disabled:opacity-50"
          >
            검색
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-medium text-gray-800">회원 목록</h2>
          <div className="text-sm text-gray-500">
            총 {pagination.totalItems} 명
          </div>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-16">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">
                데이터를 불러오는 중...
              </span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-16 text-gray-500">
              표시할 회원이 없습니다.
            </div>
          ) : (
            <table className="w-full min-w-[768px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    닉네임
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    이메일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    역할
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    가입일
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr
                    key={user.userId}
                    className="table-row hover:bg-pink-50 cursor-pointer"
                    onClick={() =>
                      !isLoading && router.push(`/admin/users/${user.userId}`)
                    }
                    aria-disabled={isLoading}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.nickname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRoleClass(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!isLoading && pagination.totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-center border-t border-gray-200">
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1 || isLoading}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-arrow-left-s-line" aria-hidden="true"></i>
                </span>
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    Math.abs(page - pagination.currentPage) < 3 ||
                    page === 1 ||
                    page === pagination.totalPages
                )
                .map((page, index, arr) => (
                  <React.Fragment key={page}>
                    {index > 0 &&
                      page - arr[index - 1] > 1 &&
                      page !== pagination.totalPages &&
                      arr[index - 1] !== 1 && (
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          ...
                        </span>
                      )}
                    <button
                      onClick={() => handlePageChange(page)}
                      disabled={isLoading}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium disabled:opacity-50 ${
                        page === pagination.currentPage
                          ? "z-10 bg-primary border-primary text-white cursor-default"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-pink-50"
                      }`}
                      aria-current={
                        page === pagination.currentPage ? "page" : undefined
                      }
                    >
                      {page}
                    </button>
                    {index < arr.length - 1 &&
                      arr[index + 1] - page > 1 &&
                      page !== 1 &&
                      arr[index + 1] !== pagination.totalPages && (
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          ...
                        </span>
                      )}
                  </React.Fragment>
                ))}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={
                  pagination.currentPage === pagination.totalPages || isLoading
                }
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
                </span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
