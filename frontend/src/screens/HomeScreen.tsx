import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Alert, Button } from 'react-native';
import { Quote } from '../types/quote';
import QuoteCard from '../components/QuoteCard';
import BottomBar from '../components/BottomBar';
import AddQuoteModal from '../components/AddQuoteModal';
import { SettingModal } from '../components/SettingModal';
import { useTranslation } from 'react-i18next';
import { fetchQuote } from '../api/quoteApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function HomeScreen() {
  const { t } = useTranslation();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAddQuoteModalOpen, setIsAddQuoteModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    loadDailyQuote();
  }, []);

  const loadDailyQuote = async () => {
    try {
      setLoading(true);
      const today = getTodayString();

      // 1. 캐시 확인
      const cachedData = await AsyncStorage.getItem(
        STORAGE_KEYS.DAILY_QUOTE_CACHE,
      );
      if (cachedData !== null) {
        const parsedData = JSON.parse(cachedData);
        if (parsedData.display_date === today) {
          setQuote(parsedData);
          setLoading(false);
          return;
        }
      }

      // 2. 캐시 없으면 서버 요청
      const response = await fetchQuote();

      if (response) {
        setQuote(response);
        await AsyncStorage.setItem(
          STORAGE_KEYS.DAILY_QUOTE_CACHE,
          JSON.stringify(response),
        );
      }
      console.log('response', response);
    } catch (error) {
      console.error('명언 로딩 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. 입력된 명언을 저장하는 로직 (부모에 있어야 함)
  const handleSaveQuote = (data: {
    text: string;
    nickname: string;
    source: string;
    category: string;
  }) => {
    console.log('--- 신규 명언 등록 데이터 ---');
    console.log('카테고리:', data.category);
    console.log('닉네임:', data.nickname);
    console.log('출처:', data.source ? data.source : '없음');
    console.log('내용:', data.text);

    setIsAddQuoteModalOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* 메인 콘텐츠 영역 (상단 타이틀 + 명언 카드) */}
      <View style={styles.content}>
        <Text style={styles.title}>{t('title')}</Text>
        <Text style={styles.subtitle}>{t('subtitle')}</Text>

        <View style={styles.cardWrapper}>
          <QuoteCard data={quote} />
        </View>
      </View>

      <BottomBar
        loading={loading}
        onPressAdd={() => setIsAddQuoteModalOpen(true)}
        onPressSettings={() => setIsSettingsModalOpen(true)}
      />

      <AddQuoteModal
        isVisible={isAddQuoteModalOpen}
        onClose={() => setIsAddQuoteModalOpen(false)}
        onSave={handleSaveQuote}
      />

      <SettingModal
        isVisible={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1220', // 다크 네이비
  },

  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center', // 명언 카드를 화면 중앙 쪽에 배치
    marginBottom: 60, // 하단 바가 가리지 않도록 여백 확보
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 40,
  },

  cardWrapper: {
    marginBottom: 40,
  },

  // 🎨 여기서부터 하단 바 스타일 스타일링
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90, // 아이폰 하단 홈 바(인디케이터) 영역까지 감안한 높이
    backgroundColor: '#111a2e', // container보다 살짝 더 밝은 네이비로 입체감 부여
    flexDirection: 'row', // 버튼들을 가로로 나열
    justifyContent: 'space-around', // 버튼 간격을 일정하게 배분
    paddingTop: 12,
    paddingBottom: 20, // 아이폰 하단 여백 반영
    borderTopWidth: 1,
    borderTopColor: '#1e293b', // 미세한 구분선
  },

  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },

  navText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
    fontWeight: '500',
  },
});
