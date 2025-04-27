"use client";

import { useState, useEffect, useRef } from "react";
import { fetchPurchasedEmojis, Emoji } from "@/utils/emojiUtils";

interface EmojiPickerProps {
  onEmojiSelect: (emojiCode: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmojiPicker({
  onEmojiSelect,
  isOpen,
  onClose,
}: EmojiPickerProps) {
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // 구매한 이모티콘 목록 불러오기
  useEffect(() => {
    const loadEmojis = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const purchasedEmojis = await fetchPurchasedEmojis();
        setEmojis(purchasedEmojis);
      } catch (err) {
        setError("이모티콘을 불러오는데 실패했습니다.");
        console.error("이모티콘 로드 오류:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadEmojis();
    }
  }, [isOpen]);

  // 외부 클릭 감지하여 picker 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // 이모티콘이 없을 때 상점으로 이동
  const navigateToStore = () => {
    window.location.href = "/point-store";
  };

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-12 left-0 z-20 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">내 이모티콘</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 text-sm py-4">{error}</div>
      ) : emojis.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 mb-3">
            구매한 이모티콘이 없습니다.
          </p>
          <button
            onClick={navigateToStore}
            className="text-pink-500 text-sm font-medium hover:text-pink-600"
          >
            포인트 상점 가기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto py-1">
          {emojis.map((emoji) => (
            <button
              key={emoji.id}
              onClick={() => onEmojiSelect(emoji.code)}
              className="flex items-center justify-center h-10 w-10 rounded hover:bg-gray-100 transition-colors"
              title={emoji.name}
            >
              <img
                src={emoji.imageUrl}
                alt={emoji.name}
                className="h-8 w-8 object-contain"
              />
            </button>
          ))}
        </div>
      )}

      {!isLoading && !error && emojis.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500 text-center">
          클릭하여 이모티콘을 추가하세요
        </div>
      )}
    </div>
  );
}
