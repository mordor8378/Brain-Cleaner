import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Comment, CommentRequestDto } from '@/types/comment';
import Image from 'next/image';

interface CommentModalProps {
  postId: number;
  onClose: () => void;
  postImage?: string;
  postContent?: string;
  userNickname?: string;
  createdAt?: string;
  isOwnPost?: boolean;
  onUpdate?: (count: number) => void;
  onImageUpdate?: (newImage: File) => void;
}

export default function CommentModal({
  postId,
  onClose,
  postImage,
  postContent,
  userNickname,
  createdAt,
  isOwnPost,
  onUpdate,
  onImageUpdate,
}: CommentModalProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedTitle, setEditedTitle] = useState(postContent || '');
  const [editedContent, setEditedContent] = useState(postContent || '');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 댓글 목록 불러오기
  const fetchComments = async () => {
    try {
      const response = await fetch(
        `http://localhost:8090/api/v1/comments/${postId}`,
        {
          credentials: 'include',
        }
      );
      if (response.ok) {
        const data = await response.json();
        setComments(data);
        if (onUpdate) onUpdate(data.length);
      }
    } catch (error) {
      console.error('댓글 로드 중 오류:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  // 댓글 작성
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    const commentData: CommentRequestDto = {
      content: newComment.trim(),
      parentId: replyTo,
    };

    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:8090/api/v1/comments/${postId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(commentData),
        }
      );

      if (response.ok) {
        setNewComment('');
        setReplyTo(null);
        await fetchComments();
      }
    } catch (error) {
      console.error('댓글 작성 중 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8090/api/v1/comments/${commentId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (response.ok) {
        await fetchComments();
      }
    } catch (error) {
      console.error('댓글 삭제 중 오류:', error);
    }
  };

  // 시간 경과 표시 함수 수정
  const getTimeAgo = (dateString: string | undefined) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일`;
    if (hours > 0) return `${hours}시간`;
    if (minutes > 0) return `${minutes}분`;
    return '방금';
  };

  // 게시글 수정 함수
  const handleSaveContent = async () => {
    if (!postId) {
      setError('게시글 ID가 없습니다.');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8090/api/v1/posts/${postId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            content: editedContent,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('게시글 수정에 실패했습니다.');
      }

      setIsEditingContent(false);
      if (onUpdate) {
        onUpdate(comments.length);
      }
    } catch (error) {
      console.error('Error updating post:', error);
      setError(
        error instanceof Error
          ? error.message
          : '게시글 수정 중 오류가 발생했습니다.'
      );
    }
  };

  // 이미지 업데이트 핸들러
  const handleImageClick = () => {
    if (isOwnPost && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpdate) {
      onImageUpdate(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-3xl h-[80vh] max-h-[600px] flex rounded-md overflow-hidden">
        {/* 왼쪽: 게시글 이미지 */}
        {postImage && (
          <div className="w-[50%] bg-black flex items-center justify-center relative group">
            <Image
              src={postImage}
              alt="게시글 이미지"
              width={600}
              height={450}
              className="max-h-full max-w-full object-contain"
            />
            {isOwnPost && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                <button
                  onClick={handleImageClick}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-gray-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        )}

        {/* 오른쪽: 댓글 영역 */}
        <div
          className={`${
            postImage ? 'w-[50%]' : 'w-full'
          } flex flex-col bg-white`}
        >
          {/* 헤더 */}
          <div className="flex items-center p-3 border-b">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-gray-500"
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
            <span className="ml-3 font-bold text-[14px] text-black hover:text-gray-900">
              {userNickname}
            </span>
          </div>

          {/* 댓글 목록 */}
          <div className="flex-1 overflow-y-auto">
            {/* 원글 내용 */}
            <div className="p-3 border-b">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-gray-500"
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
                </div>
                <div className="flex-1 group">
                  <div className="flex items-baseline">
                    <span className="font-bold text-[14px] text-black hover:text-gray-900">
                      {userNickname}
                    </span>
                    {isOwnPost && !isEditingContent ? (
                      <div className="relative flex-1">
                        <p className="ml-2 text-[14px] text-gray-900">
                          {postContent}
                        </p>
                        <button
                          onClick={() => setIsEditingContent(true)}
                          className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-700"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : isEditingContent ? (
                      <div className="flex-1 ml-2">
                        <textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="w-full text-[14px] text-black border-none focus:ring-0 focus:outline-none resize-none bg-transparent [caret-color:#F742CD]"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            onClick={() => {
                              setIsEditingContent(false);
                              setEditedContent(postContent || '');
                            }}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            취소
                          </button>
                          <button
                            onClick={handleSaveContent}
                            className="text-sm text-[#F742CD] hover:text-pink-600"
                          >
                            완료
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="ml-2 text-[14px] text-gray-900">
                        {postContent}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    {getTimeAgo(createdAt)} 전
                  </div>
                </div>
              </div>
            </div>

            {/* 댓글 목록 */}
            <div className="px-3 py-2 space-y-4">
              {comments.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm">아직 댓글이 없습니다.</p>
                  <p className="text-xs mt-1">첫 댓글을 작성해보세요!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`flex space-x-3 ${
                      comment.parentId ? 'ml-8' : ''
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-gray-500"
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
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="font-bold text-[14px] text-black hover:text-gray-900">
                            {comment.userNickname}
                          </span>
                          <span className="ml-2 text-[14px] text-gray-900">
                            {comment.content}
                          </span>
                        </div>
                        {user?.id === comment.userId && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-xs text-gray-400 hover:text-red-500 ml-2"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                      <div className="flex items-center mt-1 space-x-3">
                        <span className="text-xs text-gray-400">
                          {getTimeAgo(comment.createdAt)} 전
                        </span>
                        <button
                          onClick={() => setReplyTo(comment.id)}
                          className="text-xs font-semibold text-gray-400 hover:text-gray-600"
                        >
                          답글 달기
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 댓글 입력 영역 */}
          <div className="border-t px-3 py-2">
            {replyTo && (
              <div className="flex items-center justify-between mb-2 bg-gray-50 p-2 rounded-sm text-xs">
                <span className="text-gray-600">답글 작성 중</span>
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  취소
                </button>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글 달기..."
                className="flex-1 text-sm text-black border-none focus:ring-0 focus:outline-none min-h-[36px] py-1 placeholder-gray-400 [caret-color:#F742CD] rounded-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
              />
              <button
                onClick={handleSubmitComment}
                disabled={isLoading || !newComment.trim()}
                className={`text-sm font-semibold px-2 rounded-sm ${
                  isLoading || !newComment.trim()
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-[#F742CD] hover:text-pink-600'
                }`}
              >
                게시
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
