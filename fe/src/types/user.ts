export interface UserInfo {
  id: number | null;
  nickname: string;
  email: string;
  remainingPoint?: number;
  totalPoint?: number;
  createdAt?: string | null;
  statusMessage?: string;
  detoxGoal?: string;
  birthDate?: Date | null;
  profileImage?: string | null;
} 