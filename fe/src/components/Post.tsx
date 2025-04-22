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
  verificationImageUrl: string;
  detoxTime: number;
  createdAt: string;
  updatedAt: string;
  onUpdate?: () => void;
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
  verificationImageUrl,
  detoxTime,
  createdAt,
  updatedAt,
  onUpdate,
}: PostProps) {
  const { user } = useUser();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedContent, setEditedContent] = useState(content);
  const [error, setError] = useState<string | null>(null);
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
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <span className="font-medium text-gray-900">@{userNickname}</span>
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
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">3h</span>
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

          <div className="flex items-center text-gray-500 text-sm pt-1">
            <button className="flex items-center mr-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{likeCount}</span>
            </button>
            <button className="flex items-center mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>10</span>
            </button>
            <span className="mx-1 text-gray-400">·</span>
            <span className="text-pink-500 font-medium">+50 포인트</span>
          </div>
        </div>
      </div>
    </div>
  );
}
