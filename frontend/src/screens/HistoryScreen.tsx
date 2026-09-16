import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Quote } from '../types/quote';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { toggleLikeQuote, getLikedQuoteIds } from '../services/likeService';

// UI 렌더링에 필요한 isLiked 상태가 추가된 확장 타입
interface HistoryQuoteItem extends Quote {
  isLiked?: boolean;
}

export default function HistoryScreen() {
  const { t, i18n } = useTranslation();
  const [historyQuotes, setHistoryQuotes] = useState<HistoryQuoteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 최근 7일 데이터 가져오기 (캐시 + 좋아요 상태 합치기)
  const fetch7DaysHistory = useCallback(async () => {
    try {
      setLoading(true);

      // 1. AsyncStorage에서 캐시 데이터와 좋아요된 ID 목록 읽기
      const cachedData = await AsyncStorage.getItem(
        STORAGE_KEYS.HISTORY_7DAYS_CACHE_KEY,
      );
      const likedIds = await getLikedQuoteIds(); // Set<string> 가져오기

      // 캐시 데이터가 있으면 좋아요 상태(isLiked)를 합성하여 우선 화면에 표시
      if (cachedData !== null) {
        const parsedCache: Quote[] = JSON.parse(cachedData);
        const mappedCache = parsedCache.map(q => ({
          ...q,
          isLiked: likedIds.has(String(q.id)),
        }));
        setHistoryQuotes(mappedCache);
        setLoading(false);
      }

      // 2. 서버에서 최신 7일치 데이터 요청
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const localDateStr = `${year}-${month}-${day}`;

      // ⚠️ 개발 환경 가이드: Android 에뮬레이터는 http://10.0.2.2:3000 사용 권장
      const response = await fetch(
        `http://localhost:3000/quote/history?today=${localDateStr}&limit=7`,
      );
      const serverData: Quote[] = await response.json();

      if (serverData && Array.isArray(serverData)) {
        const slicedData = serverData.slice(0, 7);
        await AsyncStorage.setItem(
          STORAGE_KEYS.HISTORY_7DAYS_CACHE_KEY,
          JSON.stringify(slicedData),
        );

        // 최신 데이터에도 좋아요 상태(isLiked)를 합성하여 상태 업데이트
        const mappedServerData = slicedData.map(q => ({
          ...q,
          isLiked: likedIds.has(String(q.id)),
        }));
        setHistoryQuotes(mappedServerData);
      }
    } catch (e) {
      console.log('7일치 히스토리 데이터 로드 실패:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch7DaysHistory();
  }, [fetch7DaysHistory]);

  // 좋아요 클릭 핸들러
  const handleLikePress = async (item: HistoryQuoteItem) => {
    const nextState = await toggleLikeQuote(item);

    // 단일 아이템의 isLiked 상태만 배열 내에서 토글해 전체 리렌더링
    setHistoryQuotes(prevQuotes =>
      prevQuotes.map(q =>
        q.id === item.id ? { ...q, isLiked: nextState } : q,
      ),
    );
  };

  const renderHistoryItem = ({ item }: { item: HistoryQuoteItem }) => {
    // 현재 앱 언어에 맞춰 텍스트 선택
    const currentLang = i18n.language ? i18n.language.split('-')[0] : 'ko';
    const translation =
      item.translations?.[currentLang] ||
      item.translations?.[i18n.language] ||
      item.translations?.['ko'] ||
      item.translations?.['en'];

    const quoteText = translation?.quote || '';
    const authorText = translation?.author || '';

    return (
      <View style={styles.historyCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.dateText}>{item.display_date}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => handleLikePress(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={item.isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={item.isLiked ? '#f43f5e' : '#94a3b8'}
            />
          </Pressable>
        </View>

        <Text style={styles.quoteText}>"{quoteText}"</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.authorText}>- {authorText}</Text>
          {item.category && item.category.length > 0 && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {t(`category.${item.category[0]}`)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading && historyQuotes.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {historyQuotes.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>{t('historyScreen.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={historyQuotes}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b111e' },
  listContainer: { padding: 16, paddingBottom: 40 },
  historyCard: {
    backgroundColor: '#16223f',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderTopColor: '#23355f',
    borderBottomColor: '#0f182c',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dateText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  categoryBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryText: { fontSize: 11, fontWeight: '600', color: '#38bdf8' },
  quoteText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f8fafc',
    lineHeight: 24,
    marginBottom: 14,
  },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#475569', fontSize: 15 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 4,
  },
  authorText: { fontSize: 13, color: '#94a3b8', fontStyle: 'italic', flex: 1 },
  saveButton: {
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
