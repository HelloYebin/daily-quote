// 1. 단일 언어 항목에 들어가는 텍스트 타입 (한국어/영어/중국어 등 각각 적용)
export interface QuoteTranslationItem {
  quote: string; // 해당 언어의 명언 본문
  author: string; // 해당 언어의 작가 이름
  source?: string; // 출처 (선택적)
}

// 2. 서버 및 캐시 전체에서 사용되는 메인 Quote 인터페이스
export interface Quote {
  id: number;
  display_date: string | null;
  created_at: string;
  category: string[]; // 카테고리 배열
  like?: number; // 좋아요 수 (선택적)
  translations: {
    [key: string]: QuoteTranslationItem;
  };
}
