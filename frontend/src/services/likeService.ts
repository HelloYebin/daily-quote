import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { Quote } from '../types/quote';

// 1. 전체 좋아요 목록 가져오기
export const getLikedQuotes = async (): Promise<Quote[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.LIKED_QUOTES);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to fetch liked quotes', e);
    return [];
  }
};

// 2. 좋아요 토글 (추가 / 삭제)
export const toggleLikeQuote = async (item: Quote): Promise<boolean> => {
  try {
    const currentLikes = await getLikedQuotes();
    const exists = currentLikes.some(q => q.id === item.id);

    let updatedLikes: Quote[];
    if (exists) {
      // 이미 좋아요 되어있으면 삭제
      updatedLikes = currentLikes.filter(q => q.id !== item.id);
    } else {
      // 없으면 추가
      const { isLiked, ...pureQuote } = item as any;
      updatedLikes = [pureQuote, ...currentLikes];
    }

    await AsyncStorage.setItem(
      STORAGE_KEYS.LIKED_QUOTES,
      JSON.stringify(updatedLikes),
    );

    return !exists; // 변경된 좋아요 상태 반환 (true: 추가됨, false: 삭제됨)
  } catch (e) {
    console.error('Failed to toggle like', e);
    return false;
  }
};

// 3. 특정 ID 목록만 추출 (속도 최적화용)
export const getLikedQuoteIds = async (): Promise<Set<string>> => {
  const likes = await getLikedQuotes();
  // String(q.id)로 타입을 string으로 통일합니다.
  return new Set(likes.map(q => String(q.id)));
};

// 4. 특정 명언(ID)이 좋아요 상태인지 확인
export const isQuoteLiked = async (id: string | number): Promise<boolean> => {
  try {
    const likes = await getLikedQuotes();
    return likes.some(q => String(q.id) === String(id));
  } catch (e) {
    console.error('Failed to check like status', e);
    return false;
  }
};
