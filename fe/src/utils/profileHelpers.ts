import { User } from "@/contexts/UserContext";

/**
 * 프로필 페이지 경로를 생성합니다.
 * 현재 로그인한 사용자(currentUser)와 접근하려는 프로필 사용자(targetUserId)가 동일하면
 * /profile/me로 이동하고, 다른 사용자면 /profile/{targetUserId}로 이동합니다.
 */
export function getProfilePath(
  currentUser: User | null,
  targetUserId: number
): string {
  // 사용자가 로그인한 상태이고, 현재 사용자 ID와 대상 사용자 ID가 일치하면
  if (currentUser && currentUser.id === targetUserId) {
    return "/profile/me";
  }
  // 그렇지 않으면 ID로 프로필 접근
  return `/profile/${targetUserId}`;
}
