"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import { toast } from "react-hot-toast";
import { UserInfo } from "@/types/user";

export default function EditProfile() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: null,
    nickname: "",
    email: "",
    statusMessage: "",
    detoxGoal: "",
    birthDate: null,
    profileImage: null,
  });
  const [profileImage, setProfileImage] = useState("/placeholder-avatar.png");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("http://localhost:8090/api/v1/users/me", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Loaded user data:", data);
          setUserInfo({
            ...data,
            birthDate: data.birthDate ? new Date(data.birthDate) : null,
            profileImage: data.profileImageUrl,
            statusMessage: data.statusMessage || "",
            detoxGoal: data.detoxGoal || "",
          });
          if (data.profileImageUrl) {
            setProfileImage(data.profileImageUrl);
          }
        } else {
          toast.error("프로필 정보를 불러오는데 실패했습니다.");
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        toast.error("서버 연결에 실패했습니다.");
      }
    };

    fetchUserInfo();
  }, [router]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("Selected file:", file);

    if (file) {
      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("파일 크기는 10MB를 초과할 수 없습니다.");
        return;
      }

      // 이미지 파일 타입 체크
      if (!file.type.startsWith("image/")) {
        toast.error("이미지 파일만 업로드 가능합니다.");
        return;
      }

      try {
        toast.loading("이미지 업로드 중...");
        const formData = new FormData();
        formData.append("file", file);

        console.log(
          "Uploading file:",
          file.name,
          "Size:",
          file.size,
          "Type:",
          file.type
        );

        const response = await fetch("http://localhost:8090/api/v1/s3/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        console.log("Upload response status:", response.status);

        if (response.ok) {
          const imageUrl = await response.text();
          console.log("Upload response data:", imageUrl);

          setProfileImage(imageUrl);
          setUserInfo((prev) => ({
            ...prev,
            profileImage: imageUrl,
          }));
          toast.dismiss();
          toast.success("프로필 이미지가 업로드되었습니다.");
        } else {
          const errorData = await response.text();
          console.error("Upload failed:", errorData);
          toast.dismiss();
          toast.error(
            "이미지 업로드에 실패했습니다: " +
              (errorData || response.statusText)
          );
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.dismiss();
        toast.error("이미지 업로드 중 오류가 발생했습니다.");
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log("Field changed:", name, value);
    setUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Current userInfo state:", userInfo);

      const updateData = {
        nickname: userInfo.nickname,
        email: userInfo.email,
        statusMessage: userInfo.statusMessage,
        detoxGoal: userInfo.detoxGoal,
        birthDate: userInfo.birthDate
          ? userInfo.birthDate.toISOString().split("T")[0]
          : null,
        profileImageUrl: userInfo.profileImage,
      };

      console.log("Sending update request with data:", updateData);
      console.log("User ID:", userInfo.id);

      const response = await fetch(
        `http://localhost:8090/api/v1/users/${userInfo.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (response.ok) {
        toast.success("프로필이 성공적으로 업데이트되었습니다.");
        router.refresh();
        router.push("/profile/me");
      } else {
        toast.error(responseData.message || "프로필 업데이트에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("서버 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    console.log("비밀번호 변경 시도:", passwordForm);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    try {
      console.log("API 호출 시도:", userInfo.id);
      const response = await fetch(
        `http://localhost:8090/api/v1/users/${userInfo.id}/password`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newPassword: passwordForm.newPassword }),
        }
      );

      console.log("API 응답:", response.status);
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "비밀번호가 성공적으로 변경되었습니다.");
        setIsPasswordModalOpen(false);
        setPasswordForm({ newPassword: "", confirmPassword: "" });
        setPasswordError("");
      } else {
        console.error("비밀번호 변경 실패:", data);
        setPasswordError(data.message || "비밀번호 변경에 실패했습니다.");
        toast.error(data.message || "비밀번호 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordError("서버 연결에 실패했습니다.");
      toast.error("서버 연결에 실패했습니다.");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      )
    ) {
      return;
    }

    try {
      // 계정 삭제 요청
      const deleteResponse = await fetch(
        `http://localhost:8090/api/v1/users/${userInfo.id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (deleteResponse.ok) {
        // 로그아웃 요청
        const logoutResponse = await fetch(
          "http://localhost:8090/api/v1/users/logout",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (logoutResponse.ok) {
          toast.success("계정이 성공적으로 삭제되었습니다.");
          router.push("/");
        } else {
          console.error("로그아웃 실패");
          router.push("/");
        }
      } else {
        toast.error("계정 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("서버 연결에 실패했습니다.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-8">프로필 수정</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 기본 프로필 정보 */}
        <section>
          <h2 className="text-lg font-semibold mb-4">기본 프로필 정보</h2>
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-24 h-24 mb-4">
              <Image
                src={profileImage}
                alt="Profile"
                width={96}
                height={96}
                className="rounded-full object-cover"
              />
              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 bg-pink-500 text-white p-2 rounded-full cursor-pointer hover:bg-pink-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </label>
              <input
                id="profile-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                onClick={(e) => {
                  // 같은 파일을 다시 선택할 수 있도록 value 초기화
                  (e.target as HTMLInputElement).value = "";
                }}
              />
            </div>
            <button
              type="button"
              className="text-pink-500 text-sm"
              onClick={() => document.getElementById("profile-image")?.click()}
            >
              사진 변경
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="nickname"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                닉네임
              </label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={userInfo.nickname}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="statusMessage"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                상태 메시지
              </label>
              <textarea
                id="statusMessage"
                name="statusMessage"
                value={userInfo.statusMessage}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                placeholder="상태 메시지를 입력하세요"
              />
            </div>
            <div>
              <label
                htmlFor="birthDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                생년월일
              </label>
              <DatePicker
                selected={userInfo.birthDate}
                onChange={(date: Date | null) =>
                  setUserInfo((prev) => ({ ...prev, birthDate: date }))
                }
                dateFormat="yyyy년 MM월 dd일"
                locale={ko}
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={100}
                placeholderText="생년월일을 선택하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>
        </section>

        {/* 계정 정보 */}
        <section>
          <h2 className="text-lg font-semibold mb-4">계정 정보</h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                이메일 주소
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={userInfo.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>
          </div>
        </section>

        {/* 도파민 디톡스 목표 */}
        <section>
          <h2 className="text-lg font-semibold mb-4">도파민 디톡스 목표</h2>
          <div>
            <label
              htmlFor="detoxGoal"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              도파민 디톡스 목표
            </label>
            <textarea
              id="detoxGoal"
              name="detoxGoal"
              value={userInfo.detoxGoal}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              placeholder="도파민 디톡스 목표를 입력하세요"
            />
          </div>
        </section>

        {/* 프라이버시 설정 */}
        <section>
          <h2 className="text-lg font-semibold mb-4">프라이버시 설정</h2>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="private-profile"
              className="h-4 w-4 text-pink-500 border-gray-300 rounded"
            />
            <label
              htmlFor="private-profile"
              className="ml-2 text-sm text-gray-700"
            >
              전체 공개
            </label>
          </div>
        </section>

        {/* 커뮤니티 설정 */}
        <section>
          <h2 className="text-lg font-semibold mb-4">커뮤니티 설정</h2>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="push-notifications"
              className="h-4 w-4 text-pink-500 border-gray-300 rounded"
            />
            <label
              htmlFor="push-notifications"
              className="ml-2 text-sm text-gray-700"
            >
              댓글 알림
            </label>
          </div>
        </section>

        {/* 계정 관리 */}
        <section>
          <h2 className="text-lg font-semibold mb-4">계정 관리</h2>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="text-red-500 text-sm hover:underline"
            >
              비밀번호 변경
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="block text-red-500 text-sm hover:underline"
            >
              계정 삭제
            </button>
          </div>
        </section>

        {/* 버튼 그룹 */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 text-white bg-pink-500 rounded-md hover:bg-pink-600 transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "저장 중..." : "변경사항 저장"}
          </button>
        </div>
      </form>

      {/* 비밀번호 변경 모달 */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-4">비밀번호 변경</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  새 비밀번호
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordForm({ newPassword: "", confirmPassword: "" });
                    setPasswordError("");
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handlePasswordChange}
                  className="px-4 py-2 text-white bg-pink-500 rounded-md hover:bg-pink-600 transition-colors"
                >
                  변경하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
