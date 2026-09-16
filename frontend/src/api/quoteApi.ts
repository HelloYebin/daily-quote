import { Quote } from '../types/quote';

// ⏳ 스마트폰의 현재 로컬 날짜를 "YYYY-MM-DD" 포맷으로 구하는 헬퍼 함수
const getFormattedToday = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const fetchQuote = async (): Promise<Quote> => {
  const todayStr = getFormattedToday();
  const res = await fetch(
    `http://127.0.0.1:3000/quote/today?today=${todayStr}`,
  );
  if (!res.ok) {
    throw new Error('서버에서 명언을 가져오는데 실패했습니다.');
  }
  return await res.json();
};
