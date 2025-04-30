"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface UserDetail {
  userId: number;
  email: string;
  nickname: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  ssoProvider: string | null;
  remainingPoint: number;
  totalPoint: number;
}

interface PointHistoryDto {
  historyId: number;
  pointChange: number;
  type: string;
  createdAt: string;
}

interface PointHistoryPage {
  content: PointHistoryDto[];
  number: number;
  totalPages: number;
  totalElements: number;
}

// 역할 코드 -> 표시 이름 변환 함수
const getRoleDisplayName = (roleCode: string | undefined): string => {
  switch (roleCode) {
    case "ROLE_ADMIN":
      return "관리자";
    case "ROLE_USER_SPROUT":
      return "디톡스새싹";
    case "ROLE_USER_TRAINEE":
      return "절제수련생";
    case "ROLE_USER_EXPLORER":
      return "집중탐험가";
    case "ROLE_USER_CONSCIOUS":
      return "선명한의식";
    case "ROLE_USER_DESTROYER":
      return "도파민파괴자";
    case "ROLE_USER_CLEANER":
      return "브레인클리너";
    default:
      return roleCode || "정보 없음"; // 코드가 없거나 모르는 경우
  }
};

// 상태 코드 -> 표시 이름 변환 함수
const getStatusDisplayName = (statusCode: string | undefined): string => {
  switch (statusCode) {
    case "ACTIVE":
      return "활성";
    case "SUSPENDED":
      return "정지";
    case "DORMANT":
      return "휴면";
    case "DELETED":
      return "삭제됨";
    default:
      return statusCode || "정보 없음";
  }
};

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams<{ userId: string }>();
  const userId = params.userId;
  console.log("Received params in detail page:", params); // <- 이 로그 추가
  console.log("Received userId in detail page:", userId); // <- 이 로그 추가
  const [user, setUser] = useState<UserDetail | null>(null);
  const [pointHistory, setPointHistory] = useState<PointHistoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pointHistoryCurrentPage, setPointHistoryCurrentPage] = useState(1); // 1-based
  const [pointHistoryTotalPages, setPointHistoryTotalPages] = useState(1);
  const [pointHistoryTotalItems, setPointHistoryTotalItems] = useState(0); // 필요시 사용
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchPointHistory = useCallback(
    async (page: number) => {
      // page는 1부터 시작하는 페이지 번호
      if (!userId || isNaN(Number(userId))) return; // userId 없으면 중단

      const apiPage = page - 1; // 백엔드 API는 페이지 번호를 0부터 시작하므로 1 빼주기
      console.log(
        `[fetchPointHistory] ${page} 페이지 (API 페이지: ${apiPage}) 포인트 내역 로딩 시작`
      );
      // 나중에 여기에 포인트 내역 로딩 상태(isLoading 같은)를 true로 설정하는 코드 추가 가능

      try {
        const historyApiUrl =
          `${process.env.NEXT_PUBLIC_API_BASE_URL}` +
          `/api/admin/users/${userId}/point-history?page=${apiPage}&size=10`;
        console.log(`[fetchPointHistory] 요청 URL: ${historyApiUrl}`);

        // API 호출
        const response = await fetch(historyApiUrl, { credentials: "include" });

        if (!response.ok) {
          // API 호출 실패 시 에러 처리
          throw new Error(`포인트 내역 로딩 실패 (${response.status})`);
        }

        // 성공 시, JSON 데이터 파싱 (백엔드가 Page<PointHistoryResponseDto> 형태를 반환한다고 가정)
        const data: PointHistoryPage = await response.json();
        console.log("[fetchPointHistory] 받은 데이터:", data);

        // 상태 업데이트: 받아온 데이터로 포인트 내역 및 페이지 정보 설정
        setPointHistory(data.content || []); // 실제 내역 배열
        setPointHistoryCurrentPage((data.number ?? 0) + 1); // 현재 페이지 번호 (0-based -> 1-based)
        setPointHistoryTotalPages(data.totalPages ?? 1); // 전체 페이지 수
        setPointHistoryTotalItems(data.totalElements ?? 0); // 전체 항목 수
      } catch (err) {
        // 에러 발생 시 처리
        console.error("[fetchPointHistory] 포인트 내역 로딩 중 오류:", err);
        setError(err instanceof Error ? err.message : "포인트 내역 로딩 오류"); // 에러 상태 설정
        // 에러 시 상태 초기화
        setPointHistory([]);
        setPointHistoryCurrentPage(1);
        setPointHistoryTotalPages(1);
        setPointHistoryTotalItems(0);
      } finally {
        // 나중에 여기에 포인트 내역 로딩 상태를 false로 설정하는 코드 추가 가능
      }
    },
    [userId]
  ); // userId가 변경될 때마다 이 함수를 새로 만들도록 설정

  useEffect(() => {
    console.log("[UserDetailPage useEffect] Effect 실행! 현재 userId:", userId);
    console.log(
      "[UserDetailPage useEffect] Effect 실행! 현재 params 객체:",
      params
    );

    const fetchUserData = async () => {
      // userId가 유효한지 먼저 확인
      if (!userId || userId === "undefined" || isNaN(Number(userId))) {
        console.error(
          "[UserDetailPage fetchUserData] 유효하지 않은 userId:",
          userId
        );
        setError("유효하지 않은 사용자 ID입니다.");
        setIsLoading(false);
        return; // 함수 종료
      }

      console.log(`[UserDetail] 유효한 userId (${userId})로 데이터 요청 시작`);
      setIsLoading(true);
      setError(null); // 에러 초기화

      try {
        const backendApiUrl =
          `${process.env.NEXT_PUBLIC_API_BASE_URL}` +
          `/api/admin/users/${params.userId}`;
        console.log(`[UserDetail] Request URL: ${backendApiUrl}`);

        // API 호출 예시 (실제 구현에서는 실제 API 엔드포인트로 변경)
        const response = await fetch(backendApiUrl, {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401)
            throw new Error("인증되지 않은 사용자입니다. 로그인이 필요합니다.");
          if (response.status === 403)
            throw new Error("접근 권한이 없습니다 (관리자 아님).");
          if (response.status === 404)
            throw new Error("해당 사용자를 찾을 수 없습니다.");

          throw new Error(`사용자 정보 로딩 실패 (${response.status})`);
        }
        const data = await response.json();
        console.log("[UserDetail] Received data:", data);

        const { pointHistoryPage, ...userData } = data;
        setUser(userData);

        // 드롭다운 초기 선택값  설정
        setSelectedStatus(data.status || "");
        setSelectedRole(data.role || "");

        await fetchPointHistory(1);
      } catch (err) {
        console.error("[UserDetail] Error fetching user data:", err);
        setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
        setUser(null); // 에러 시 사용자 데이터 null 처리
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]); // userId가 바뀔 때마다 데이터 다시 불러오기

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
  };

  const handleApplyChanges = async () => {
    // 유효성 검사된 userId 사용 (useEffect 안에서 설정된 값)
    if (!userId || userId === "undefined" || isNaN(Number(userId))) {
      alert("잘못된 사용자 ID입니다.");
      return;
    }

    if (!user) {
      // user 객체가 null인 경우 방지
      alert("사용자 정보가 로드되지 않았습니다.");
      return;
    }

    const statusChanged = selectedStatus !== user.status;
    const roleChanged = selectedRole !== user.role;

    // 변경사항이 있는지 확인 (없으면 API 호출 안 함)
    if (selectedStatus === user?.status && selectedRole === user?.role) {
      alert("변경된 내용이 없습니다.");
      return;
    }

    console.log(
      `[handleApplyChanges] userId: ${userId}, status: ${selectedStatus}, role: ${selectedRole} 변경 요청`
    );
    setIsUpdating(true);
    setError(null);

    const apiCalls: Promise<Response>[] = [];

    if (statusChanged) {
      console.log(
        `[handleApplyChanges] 상태 변경 API 호출 준비: ${selectedStatus}`
      );
      const statusUrl =
        `${process.env.NEXT_PUBLIC_API_BASE_URL}` +
        `/api/admin/users/${userId}/status`;
      apiCalls.push(
        fetch(statusUrl, {
          method: "PUT", // ★★★ PUT 방식 사용 ★★★
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ newStatus: selectedStatus }), // ★★★ 백엔드 DTO 필드명 newStatus 에 맞춤 ★★★
        })
      );
    }

    if (roleChanged) {
      console.log(
        `[handleApplyChanges] 역할 변경 API 호출 준비: ${selectedRole}`
      );
      const roleUrl =
        `${process.env.NEXT_PUBLIC_API_BASE_URL}` +
        `/api/admin/users/${userId}/role`;
      apiCalls.push(
        fetch(roleUrl, {
          method: "PUT", // ★★★ PUT 방식 사용 ★★★
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ newRole: selectedRole }), // ★★★ 백엔드 DTO 필드명 newRole 에 맞춤 ★★★
        })
      );
    }

    try {
      // 3. 준비된 API 호출들을 동시에 실행
      const responses = await Promise.all(apiCalls);

      // 4. 모든 응답이 성공적인지 확인
      const allSuccess = responses.every((res) => res.ok);

      if (allSuccess) {
        console.log("[handleApplyChanges] 모든 변경사항 적용 성공.");
        alert("성공적으로 적용되었습니다.");

        // ★★★ 성공 시 사용자 정보 새로고침 ★★★
        // 백엔드 PUT 응답에 수정된 정보가 없으므로, fetchUserData 를 다시 호출해서 화면 갱신
        // (fetchUserData 함수를 useEffect 외부에서도 호출할 수 있도록 필요하면 useCallback 등으로 감싸거나 구조 변경 고려)

        // 임시로 상태 직접 업데이트 (fetchUserData 호출이 더 확실함)
        setUser((prevUser) =>
          prevUser
            ? { ...prevUser, status: selectedStatus, role: selectedRole }
            : null
        );

        // TODO: fetchUserData()를 직접 호출하도록 수정하는 것을 권장!
        // 예: await fetchUserData(); // fetchUserData가 이 scope에서 접근 가능해야 함
      } else {
        // 실패한 응답 찾기 (간단히 첫 번째 실패 응답만 처리)
        const failedResponse = responses.find((res) => !res.ok);
        const errorData = await failedResponse?.json().catch(() => null);
        const errorMessage =
          errorData?.message ||
          `오류 발생 (상태 코드: ${failedResponse?.status})`;
        console.error(
          "[handleApplyChanges] 일부 또는 전체 업데이트 실패:",
          failedResponse?.status,
          errorData
        );
        throw new Error(errorMessage); // catch 블록으로 에러 전달
      }
    } catch (err) {
      console.error("[handleApplyChanges] 업데이트 중 예외 발생:", err);
      const message =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(message);
      alert(`오류: ${message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="space-y-4">
          <div className="bg-white rounded p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">오류 발생!</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">사용자 상세 정보</h1>
        <Link
          href="/admin/users"
          className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-button whitespace-nowrap"
        >
          <div className="w-5 h-5 flex items-center justify-center mr-1">
            <i className="ri-arrow-left-line"></i>
          </div>
          목록으로
        </Link>
      </div>

      <div className="space-y-6">
        {/* 기본 프로필 정보 */}
        <div className="bg-white rounded shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">기본 프로필 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex">
              <span className="w-32 text-gray-500">사용자 ID</span>
              <span className="font-medium">{user.userId}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-gray-500">이메일</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-gray-500">닉네임</span>
              <span className="font-medium">{user.nickname}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-gray-500">가입일</span>
              <span className="font-medium">
                {user.createdAt
                  ? new Date(user.createdAt)
                      .toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                      .replace(/\.$/, "")
                  : "-"}
              </span>
            </div>
            <div className="flex">
              <span className="w-32 text-gray-500">수정일</span>
              <span className="font-medium">
                {user.updatedAt
                  ? new Date(user.updatedAt)
                      .toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                      .replace(/\.$/, "")
                  : "-"}
              </span>
            </div>
            <div className="flex">
              <span className="w-32 text-gray-500">SSO 제공자</span>
              <span className="font-medium">{user.ssoProvider || "없음"}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-gray-500">역할</span>
              <span className="badge bg-primary/10 text-primary">
                {getRoleDisplayName(user.role)}
              </span>
            </div>
            <div className="flex">
              <span className="w-32 text-gray-500">상태</span>
              <span className="badge bg-green-100 text-green-800">
                {getStatusDisplayName(user.status)}
              </span>
            </div>
          </div>
        </div>

        {/* 포인트 정보 */}
        <div className="bg-white rounded shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">포인트 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 mb-1">잔여 포인트</p>
              <div className="flex items-end">
                <span className="text-3xl font-bold">
                  {(user.remainingPoint ?? 0).toLocaleString("ko-KR")}
                </span>
                <span className="text-gray-500 ml-1">P</span>
              </div>
            </div>
            <div>
              <p className="text-gray-500 mb-1">총 적립 포인트</p>
              <div className="flex items-end">
                <span className="text-3xl font-bold">
                  {(user.totalPoint ?? 0).toLocaleString("ko-KR")}
                </span>
                <span className="text-gray-500 ml-1">P</span>
              </div>
            </div>
          </div>
        </div>

        {/* 포인트 내역 */}
        <div className="bg-white rounded shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">포인트 내역</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    날짜
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    변경 사유
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    변경량
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pointHistory.length === 0 ? ( // 데이터 없을 때 메시지 추가
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-10 text-center text-sm text-gray-500"
                    >
                      포인트 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  pointHistory.map((history) => (
                    <tr key={history.historyId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {/* ▼▼▼ history.date -> history.createdAt 으로 수정 + 포맷팅 ▼▼▼ */}
                        {history.createdAt
                          ? new Date(history.createdAt).toLocaleDateString(
                              "ko-KR",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              }
                            )
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {history.type}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                          history.pointChange >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {" "}
                        {/* ▼▼▼ history.amount -> history.pointChange 로 수정 + 포맷팅 ▼▼▼ */}
                        {history.pointChange >= 0 ? "+" : ""}
                        {history.pointChange.toLocaleString("ko-KR")} P
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              총 {pointHistoryTotalItems}개 항목 중{" "}
              {pointHistoryCurrentPage * 10 - 9}-
              {Math.min(pointHistoryCurrentPage * 10, pointHistoryTotalItems)}
            </div>
            <div className="flex space-x-1">
              <button
                className="px-3 py-1 border border-gray-300 rounded-button bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                disabled={pointHistoryCurrentPage === 1}
                onClick={() => {
                  const newPage = pointHistoryCurrentPage - 1;
                  setPointHistoryCurrentPage(newPage);
                  fetchPointHistory(newPage);
                }}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-arrow-left-s-line"></i>
                </div>
              </button>
              {/* 페이지 번호 버튼들 */}
              <div className="flex space-x-1">
                {Array.from({ length: pointHistoryTotalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      Math.abs(page - pointHistoryCurrentPage) < 3 ||
                      page === 1 ||
                      page === pointHistoryTotalPages
                  )
                  .map((page, index, arr) => (
                    <React.Fragment key={page}>
                      {index > 0 && page - arr[index - 1] > 1 && (
                        <span className="px-3 py-1">...</span>
                      )}
                      <button
                        className={`px-3 py-1 border rounded-button whitespace-nowrap ${
                          page === pointHistoryCurrentPage
                            ? "border-primary bg-primary text-white"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          setPointHistoryCurrentPage(page);
                          fetchPointHistory(page);
                        }}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
              </div>

              {/* 다음 페이지 버튼 */}
              <button
                className="px-3 py-1 border border-gray-300 rounded-button bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                disabled={pointHistoryCurrentPage === pointHistoryTotalPages}
                onClick={() => {
                  const newPage = pointHistoryCurrentPage + 1;
                  setPointHistoryCurrentPage(newPage);
                  fetchPointHistory(newPage);
                }}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-arrow-right-s-line"></i>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 계정 관리 */}
        <div className="bg-white rounded shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">계정 관리</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="statusSelect"
                  className="block text-lg font-semibold text-gray-600 mb-3"
                >
                  상태 변경
                </label>
                <div className="relative">
                  <select
                    id="statusSelect"
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    className="block w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  >
                    <option value="ACTIVE">활성</option>
                    <option value="SUSPENDED">정지</option>
                    <option value="DELETED">삭제</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <span className="w-5 h-5 flex items-center justify-center">
                      <i className="ri-arrow-down-s-line"></i>{" "}
                      {/* 아이콘 클래스 */}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <label
                  htmlFor="roleSelect"
                  className="block text-lg font-semibold text-gray-600 mb-3"
                >
                  역할 변경
                </label>
                <div className="relative">
                  <select
                    id="roleSelect"
                    value={selectedRole}
                    onChange={handleRoleChange}
                    className="block w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  >
                    <option value="ROLE_USER_SPROUT">디톡스새싹</option>
                    <option value="ROLE_USER_TRAINEE">절제수련생</option>
                    <option value="ROLE_USER_EXPLORER">집중탐험가</option>
                    <option value="ROLE_USER_CONSCIOUS">선명한의식</option>
                    <option value="ROLE_USER_DESTROYER">도파민파괴자</option>
                    <option value="ROLE_USER_CLEANER">브레인클리너</option>
                    <option value="ROLE_ADMIN" disabled>
                      관리자
                    </option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <span className="w-5 h-5 flex items-center justify-center">
                      <i className="ri-arrow-down-s-line"></i>{" "}
                      {/* 아이콘 클래스 */}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleApplyChanges}
                disabled={
                  isUpdating ||
                  (selectedStatus === user?.status &&
                    selectedRole === user?.role)
                }
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-button disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <div className="flex items-center">
                  {isUpdating && (
                    <span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></span>
                  )}
                  <span>적용</span>
                </div>
              </button>
              <button
                onClick={() => router.push("/admin/users")}
                disabled={isUpdating}
                className="px-4 py-2 bg-primary text-white rounded-button hover:bg-primary/90 whitespace-nowrap"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
