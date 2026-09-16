import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEY = '@my_liked_quotes';

export function useLike() {
  const toggleLike = async (
    itemId: number,
    currentLiked: boolean,
    serverUrl: string = 'http://localhost:3000', // 기본 서버 주소
  ) => {
    try {
      // 1. 내 스마트폰 저장소(AsyncStorage) 업데이트
      const savedLikes = await AsyncStorage.getItem(STORAGE_KEY);
      let likedIds: number[] = savedLikes ? JSON.parse(savedLikes) : [];

      if (currentLiked) {
        likedIds = likedIds.filter(id => id !== itemId); // 좋아요 취소 -> 배열에서 삭제
      } else {
        likedIds.push(itemId); // 좋아요 추가 -> 배열에 추가
      }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(likedIds));

      // 2. 📡 서버에 좋아요 증감 요청 보내기
      const res = await fetch(`${serverUrl}/quote/${itemId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: currentLiked ? 'unlike' : 'like',
        }),
      });

      if (!res.ok) throw new Error('서버 반영 실패');

      return true; // 성공 시 true 반환
    } catch (error) {
      console.log('좋아요 서버 통신 실패:', error);
      return false; // 실패 시 false 반환
    }
  };

  return { toggleLike, STORAGE_KEY };
}
