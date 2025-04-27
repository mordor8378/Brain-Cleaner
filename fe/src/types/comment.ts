export interface Comment {
  id: number;
  postId: number;
  userId: number;
  userNickname: string;
  content: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  detoxTime?: number;
}

export interface CommentRequestDto {
  content: string;
  parentId?: number | null;
  postId: number;
}

export interface CommentResponseDto {
  id: number;
  postId: number;
  userId: number;
  userNickname: string;
  content: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommentUpdateResponseDto {
  id: number;
  content: string;
  updatedAt: string;
}
