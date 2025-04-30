"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import { toast } from "react-hot-toast";
import { UserInfo } from "@/types/user";

const CUSTOM_PINK = "#F742CD";

export default function EditProfile() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: null,
    nickname: "",
    email: "",
    statusMessage: "",
    detoxGoal: 0,
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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}` + "/api/v1/users/me",
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Loaded user data:", data);
          setUserInfo({
            ...data,
            birthDate: data.birthDate ? new Date(data.birthDate) : null,
            profileImage: data.profileImageUrl,
            statusMessage: data.statusMessage || "",
            detoxGoal: data.detoxGoal || 0,
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

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}` + "/api/v1/s3/upload",
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

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
      [name]: name === "detoxGoal" ? parseInt(value) || 0 : value,
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

      // FormData 객체 생성
      const formData = new FormData();

      // profileData를 JSON 문자열로 변환하여 추가
      formData.append(
        "profileData",
        new Blob([JSON.stringify(updateData)], {
          type: "application/json",
        })
      );

      // 프로필 이미지가 변경된 경우에만 이미지 파일 추가
      if (
        userInfo.profileImage &&
        userInfo.profileImage !== "/placeholder-avatar.png" &&
        userInfo.profileImage.startsWith("http")
      ) {
        // 이미지가 URL인 경우는 FormData에 포함하지 않고 profileImageUrl로 전송
        console.log("프로필 이미지 URL이 전송됩니다:", userInfo.profileImage);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}` +
          `/api/v1/users/${userInfo.id}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData, // Content-Type은 자동으로 multipart/form-data로 설정됨
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}` +
          `/api/v1/users/${userInfo.id}/password`,
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}` +
          `/api/v1/users/${userInfo.id}`,
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
          `${process.env.NEXT_PUBLIC_API_BASE_URL}` + "/api/v1/users/logout",
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
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="flex items-center justify-between p-4 border-b">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            취소
          </button>
          <h1 className="text-base font-bold">프로필 수정</h1>
          <button
            onClick={handleSubmit}
            className="text-sm hover:opacity-80 transition-colors"
            style={{ color: CUSTOM_PINK }}
          >
            완료
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-0">
          {/* 프로필 이미지 */}
          <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-100">
            <div className="relative w-20 h-20 mb-2">
              {profileImage && profileImage !== "/placeholder-avatar.png" ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-gray-700"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 w-6 h-6 flex items-center justify-center text-white rounded-full cursor-pointer hover:opacity-80 transition-colors"
                style={{ backgroundColor: CUSTOM_PINK }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
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
                  (e.target as HTMLInputElement).value = "";
                }}
              />
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="space-y-6">
            <div className="pb-6 border-b border-gray-100">
              <label className="block text-xs text-gray-500 mb-1">닉네임</label>
              <input
                type="text"
                name="nickname"
                value={userInfo.nickname}
                onChange={handleChange}
                className="w-full px-0 py-1 bg-transparent border-0 focus:ring-0 text-sm"
                required
              />
            </div>

            <div className="pb-6 border-b border-gray-100">
              <label className="block text-xs text-gray-500 mb-1">
                상태 메시지
              </label>
              <textarea
                name="statusMessage"
                value={userInfo.statusMessage}
                onChange={handleChange}
                rows={2}
                className="w-full px-0 py-1 bg-transparent border-0 focus:ring-0 resize-none text-sm"
                placeholder="상태 메시지를 입력하세요"
              />
            </div>

            <div className="pb-6 border-b border-gray-100">
              <label className="block text-xs text-gray-500 mb-1">
                도파민 디톡스 목표
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  name="detoxGoal"
                  value={userInfo.detoxGoal || 0}
                  onChange={handleChange}
                  min="0"
                  className="w-24 px-0 py-1 bg-transparent border-0 focus:ring-0 text-sm"
                  placeholder="0"
                  inputMode="numeric"
                  onFocus={(e) => e.target.select()}
                />
                <span className="ml-2 text-sm">시간</span>
              </div>
            </div>

            <div className="pb-6 border-b border-gray-100">
              <label className="block text-xs text-gray-500 mb-1">이메일</label>
              <input
                type="email"
                name="email"
                value={userInfo.email}
                onChange={handleChange}
                className="w-full px-0 py-1 bg-transparent border-0 focus:ring-0 text-sm"
                required
              />
            </div>

            <div className="pb-6 border-b border-gray-100">
              <label className="block text-xs text-gray-500 mb-1">
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
                className="w-full px-0 py-1 bg-transparent border-0 focus:ring-0 text-sm"
              />
            </div>
          </div>

          {/* 계정 관리 */}
          <div className="pt-6">
            <div className="flex flex-col items-start gap-2">
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="text-gray-500 text-xs hover:text-gray-700 transition-colors"
              >
                비밀번호 변경
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-red-500 text-xs hover:text-red-700 transition-colors"
              >
                계정 삭제
              </button>
            </div>
          </div>
        </form>

        {/* 비밀번호 변경 모달 */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[640px] h-[400px] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordForm({
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setPasswordError("");
                  }}
                  className="text-gray-500 text-sm hover:text-gray-700 transition-colors"
                >
                  취소
                </button>
                <h2 className="text-base font-bold">비밀번호 변경</h2>
                <button
                  type="button"
                  onClick={handlePasswordChange}
                  className="text-sm hover:opacity-80 transition-colors"
                  style={{ color: CUSTOM_PINK }}
                >
                  완료
                </button>
              </div>
              <div className="flex-1 p-4 space-y-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    새 비밀번호
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="w-full px-0 py-1 bg-transparent border-0 focus:ring-0 focus:outline-none text-sm caret-[#F742CD] placeholder-shown:placeholder-gray-400 placeholder-transparent hover:placeholder-gray-400 transition-colors"
                    placeholder="새 비밀번호를 입력해주세요"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    비밀번호 확인
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="w-full px-0 py-1 bg-transparent border-0 focus:ring-0 focus:outline-none text-sm caret-[#F742CD] placeholder-shown:placeholder-gray-400 placeholder-transparent hover:placeholder-gray-400 transition-colors"
                    placeholder="비밀번호를 한 번 더 입력해주세요"
                  />
                </div>
                {passwordError && (
                  <p className="text-red-500 text-xs">{passwordError}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 계정 삭제 모달 */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[640px] h-[400px] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="text-gray-500 text-sm hover:text-gray-700 transition-colors"
                >
                  취소
                </button>
                <h2 className="text-base font-bold">계정 삭제</h2>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="text-sm hover:opacity-80 transition-colors"
                  style={{ color: CUSTOM_PINK }}
                >
                  완료
                </button>
              </div>
              <div className="flex-1 p-4">
                <div className="space-y-4">
                  <p className="text-base text-center">
                    정말로 계정을 삭제하시겠습니까?
                  </p>
                  <p className="text-sm text-gray-500 text-center">
                    계정을 삭제하면 모든 데이터가 영구적으로 삭제되며,
                    <br />이 작업은 되돌릴 수 없습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
