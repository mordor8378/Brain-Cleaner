import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useUser } from '@/contexts/UserContext';

export interface PostProps {
  postId: number;
  userId: number;
  userNickname: string;
  title: string;
  content: string;
  imageUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  verificationImageUrl: string;
  detoxTime: number;
  createdAt: string;
  updatedAt: string;
  onUpdate?: () => void;
  onLike: () => void;
  onUnlike: () => void;
  isLiked?: boolean;
  onDelete?: (postId: number) => void;
}

export default function Post({
  postId,
  userId,
  userNickname,
  title,
  content,
  imageUrl,
  viewCount,
  likeCount,
  commentCount,
  verificationImageUrl,
  detoxTime,
  createdAt,
  updatedAt,
  onUpdate,
  onLike,
  onUnlike,
  isLiked,
  onDelete,
}: PostProps) {
  const { user } = useUser();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedContent, setEditedContent] = useState(content);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const postRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Post component rendered with id:', postId);
  }, [postId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (postRef.current && !postRef.current.contains(event.target as Node)) {
        if (isEditingTitle) {
          setIsEditingTitle(false);
          setEditedTitle(title);
        }
        if (isEditingContent) {
          setIsEditingContent(false);
          setEditedContent(content);
        }
        setError(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditingTitle, isEditingContent, title, content]);

  const handleEditTitle = () => {
    if (user?.id !== userId) {
      alert('자신의 게시글만 수정할 수 있습니다.');
      return;
    }
    setIsEditingTitle(true);
    setEditedTitle(title);
  };

  const handleEditContent = () => {
    if (user?.id !== userId) {
      alert('자신의 게시글만 수정할 수 있습니다.');
      return;
    }
    setIsEditingContent(true);
    setEditedContent(content);
  };

  const handleSaveTitle = async () => {
    if (!postId) {
      console.error('Post ID is undefined');
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
            title: editedTitle,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('게시글 수정에 실패했습니다.');
      }

      setIsEditingTitle(false);
      if (onUpdate) {
        onUpdate();
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

  const handleSaveContent = async () => {
    if (!postId) {
      console.error('Post ID is undefined');
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
        onUpdate();
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

  return (
    <div className="p-5" ref={postRef}>
      <div className="flex items-start mb-3">
        <div className="mr-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-400"
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
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[14px] text-gray-900">
                {userNickname}
              </span>
              <span className="text-xs text-gray-500">• 3h</span>
              <span className="ml-1 text-xs text-green-500">
                <svg
                  className="w-3.5 h-3.5 inline"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </span>
            </div>
            <div className="group">
              {user?.id === userId && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="group relative">
            {isEditingTitle ? (
              <div className="flex items-start">
                <h3 className="flex-1">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full text-lg font-semibold text-gray-900 focus:outline-none [caret-color:#F742CD] bg-transparent"
                    style={{ minHeight: 'inherit', height: 'auto' }}
                    autoFocus
                  />
                </h3>
                <button
                  onClick={handleSaveTitle}
                  className="ml-2 text-sm text-pink-500 hover:text-pink-600"
                >
                  완료
                </button>
              </div>
            ) : (
              <div className="flex items-start">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">
                  {title}
                </h3>
                {user?.id === userId && (
                  <div className="group">
                    <button
                      onClick={handleEditTitle}
                      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="group relative mt-2">
            {isEditingContent ? (
              <div className="flex items-start">
                <div className="flex-1">
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full text-sm text-gray-700 focus:outline-none [caret-color:#F742CD] resize-none bg-transparent overflow-hidden"
                    style={{ minHeight: 'inherit', height: 'auto' }}
                    rows={1}
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleSaveContent}
                  className="ml-2 text-sm text-pink-500 hover:text-pink-600"
                >
                  완료
                </button>
              </div>
            ) : (
              <div className="flex items-start">
                <p className="text-sm text-gray-700 flex-1">{content}</p>
                {user?.id === userId && (
                  <button
                    onClick={handleEditContent}
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          {imageUrl && (
            <div className="rounded-lg overflow-hidden mb-3 mt-3">
              <Image
                src={imageUrl}
                alt="게시글 이미지"
                width={500}
                height={300}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={() => (isLiked ? onUnlike() : onLike())}
              className="flex items-center gap-1"
            >
              {isLiked ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-pink-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              )}
              <span className="text-sm text-gray-500">{likeCount}</span>
            </button>

            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 12h.01M12 12h.01M16 12h.01M3 12c0 4.97 4.03 9 9 9a9.863 9.863 0 004.255-.949L21 21l-1.395-4.72C20.488 15.042 21 13.574 21 12c0-4.97-4.03-9-9-9s-9 4.03-9 9z" />
              </svg>
              <span className="text-sm text-gray-500">{commentCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowDeleteConfirm(false)}
          ></div>
          <div className="relative bg-white rounded-2xl w-[320px] overflow-hidden">
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold text-black mb-2">
                게시글을 삭제하시겠어요?
              </h3>
              <p className="text-sm text-gray-500">
                계정 설정에서 30일 이내에 이 게시물을 복원할 수 있으며, 이후에는
                게시물이 영구적으로 삭제됩니다. 게시물을 복원하면 해당 콘텐츠도
                복원됩니다.
              </p>
            </div>
            <div className="border-t divide-y">
              <button
                onClick={() => {
                  if (onDelete) {
                    onDelete(postId);
                  }
                  setShowDeleteConfirm(false);
                }}
                className="w-full py-3 text-sm font-semibold text-red-500 hover:bg-gray-50"
              >
                삭제
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-3 text-sm text-black hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
