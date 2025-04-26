export const CUSTOM_EMOJI_MAP: Record<string, string> = {
  ':brain:': '/emojis/brain.gif',
  ':kirbyjam:': '/emojis/kirby_jam.gif',
  ':huhcat:': '/emojis/huh.gif',
  ':zeus:': '/emojis/zeus.png',
  ':panic:': '/emojis/mild-panic-intensifies.gif',
  ':catjam:': '/emojis/catjam.gif',
  ':crycat:': '/emojis/crycat.png',
  ':facepalm:': '/emojis/facepalm.gif',
  ':whew:': '/emojis/whew.gif',
  ':headbang:': '/emojis/headbang.gif',
};

export function getEmojiUrl(code: string): string | null {
  return CUSTOM_EMOJI_MAP[code] || null;
}

// 이모지 코드가 유효한지 확인하는 함수
export function isValidEmojiCode(code: string): boolean {
  return code in CUSTOM_EMOJI_MAP;
}

// 모든 사용 가능한 이모지 코드 목록 반환
export function getAllEmojiCodes(): string[] {
  return Object.keys(CUSTOM_EMOJI_MAP);
}
