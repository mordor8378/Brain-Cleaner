"use client";

import { useEffect, useState } from "react";

export interface Emoji {
  id: number;
  name: string;
  code: string;
  imageUrl: string;
}

// 이모티콘 캐시 (메모리 저장)
let emojisCache: Emoji[] = [];

// 이모티콘 목록 조회
export const fetchEmojis = async (): Promise<Emoji[]> => {
  try {
    // 캐시가 있으면 캐시 반환
    if (emojisCache.length > 0) {
      return emojisCache;
    }

    // 이모티콘 목록 조회
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}` + "/api/v1/pointstore/items",
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("이모티콘을 불러오는데 실패했습니다.");
    }

    const data = await response.json();

    const emojis: Emoji[] = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      imageUrl: item.imageUrl,
    }));

    emojisCache = emojis;
    return emojis;
  } catch (error) {
    console.error("이모티콘 목록 불러오기 실패:", error);
    return [];
  }
};

// 구매한 이모티콘 목록 조회
export const fetchPurchasedEmojis = async (): Promise<Emoji[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}` +
        "/api/v1/pointstore/my-purchases",
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("구매한 이모티콘을 불러오는데 실패했습니다.");
    }

    const data = await response.json();

    const emojis: Emoji[] = data.map((item: any) => ({
      id: item.itemId,
      name: item.name,
      code: item.code || `:${item.name.toLowerCase().replace(/\s+/g, "-")}:`, // 코드가 없는 경우 이름으로 생성
      imageUrl: item.imageUrl,
    }));

    return emojis;
  } catch (error) {
    console.error("구매한 이모티콘 목록 불러오기 실패:", error);
    return [];
  }
};

// 이모티콘 코드를 이미지로 변환
export const convertEmojiCodesToImages = (
  text: string,
  emojis: Emoji[]
): React.ReactNode[] => {
  if (!text) return [<span key="empty"></span>];

  // emojis가 없는 경우 전체 이모티콘 목록 조회
  if (!emojis || emojis.length === 0) {
    // 이미 불러온 이모티콘 캐시가 있으면 사용
    if (emojisCache.length > 0) {
      return convertWithEmojis(text, emojisCache);
    }

    // 비동기 처리를 위한 임시 반환 => 텍스트 그대로 표시
    return [<span key="content">{text}</span>];
  }

  return convertWithEmojis(text, emojis);
};

const convertWithEmojis = (
  text: string,
  emojis: Emoji[]
): React.ReactNode[] => {
  // 이모티콘 코드 정규식 (:code: 형식)
  const emojiCodeRegex = /:([\w-]+):/g;

  // 텍스트를 분할하여 이모티콘 코드는 이미지로, 나머지는 텍스트로 변환
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let partIndex = 0;

  while ((match = emojiCodeRegex.exec(text)) !== null) {
    // 이모티콘 코드 앞의 텍스트
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${partIndex}`}>
          {text.substring(lastIndex, match.index)}
        </span>
      );
      partIndex++;
    }

    // 이모티콘 코드를 이미지로 변환
    const emojiCode = match[0];
    const emoji = emojis.find((e) => e.code === emojiCode);

    if (emoji) {
      parts.push(
        <img
          key={`emoji-${partIndex}`}
          src={emoji.imageUrl}
          alt={emoji.name}
          title={emoji.name}
          className="inline-block h-6 w-6 align-text-bottom"
        />
      );
    } else {
      // 매칭되는 이모티콘이 없으면 코드 그대로 표시
      parts.push(<span key={`unknown-emoji-${partIndex}`}>{emojiCode}</span>);
    }

    lastIndex = match.index + match[0].length;
    partIndex++;
  }

  // 마지막 이모티콘 이후의 텍스트
  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-${partIndex}`}>{text.substring(lastIndex)}</span>
    );
  }

  return parts;
};

// 전체 이모티콘 로딩 (게시글 렌더링용)
export const useGlobalEmojis = () => {
  const [globalEmojis, setGlobalEmojis] = useState<Emoji[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEmojis = async () => {
      if (emojisCache.length > 0) {
        setGlobalEmojis(emojisCache);
        setIsLoading(false);
        return;
      }

      try {
        const allEmojis = await fetchEmojis();
        setGlobalEmojis(allEmojis);
        // 전역 캐시에도 저장
        emojisCache = allEmojis;
      } catch (error) {
        console.error("전체 이모티콘 로드 중 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmojis();
  }, []);

  return { globalEmojis, isLoading };
};

// 구매한 이모티콘 목록 조회
export const usePurchasedEmojis = () => {
  const [purchasedEmojis, setPurchasedEmojis] = useState<Emoji[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEmojis = async () => {
      setIsLoading(true);
      try {
        const emojis = await fetchPurchasedEmojis();
        setPurchasedEmojis(emojis);
      } catch (error) {
        console.error("구매한 이모티콘 로드 중 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmojis();
  }, []);

  return { purchasedEmojis, isLoading };
};

// 이모티콘 코드를 이미지로 변환
export const useEmojiConverter = (text: string) => {
  const [convertedContent, setConvertedContent] = useState<React.ReactNode[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const { globalEmojis, isLoading: isGlobalEmojisLoading } = useGlobalEmojis();

  useEffect(() => {
    const convertEmojis = () => {
      setIsLoading(true);
      try {
        // 항상 전체 이모티콘 목록을 사용하여 변환
        setConvertedContent(convertEmojiCodesToImages(text, globalEmojis));
      } catch (error) {
        console.error("이모티콘 변환 중 오류:", error);
        setConvertedContent([<span key="fallback">{text}</span>]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isGlobalEmojisLoading) {
      convertEmojis();
    }
  }, [text, globalEmojis, isGlobalEmojisLoading]);

  return { convertedContent, isLoading };
};
