import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Quote } from '../types/quote';
import { getLikedQuotes, toggleLikeQuote } from '../services/likeService';

export default function SavedScreen() {
  const { t, i18n } = useTranslation();
  const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 저장된 명언 불러오기
  const loadSaved = async () => {
    try {
      setLoading(true);
      const list = await getLikedQuotes();
      setSavedQuotes(list || []);
    } catch (error) {
      console.log('저장된 명언 로드 실패:', error);
    } finally {
      setLoading(false); // 🚀 로딩 종료 처리 추가
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  console.log(savedQuotes);

  // 좋아요 취소(보관함 삭제) 처리
  const handleRemoveLike = async (item: Quote) => {
    await toggleLikeQuote(item);
    // 목록에서 즉시 제거
    setSavedQuotes(prev => prev.filter(q => String(q.id) !== String(item.id)));
  };

  // FlatList 랜더 아이템
  const renderItem = ({ item }: { item: Quote }) => {
    // 현재 언어 설정에 맞는 텍스트 선택
    const currentLang = i18n.language ? i18n.language.split('-')[0] : 'ko';
    const translation =
      item.translations?.[currentLang] ||
      item.translations?.[i18n.language] ||
      item.translations?.['ko'] ||
      item.translations?.['en'];

    // 번역 텍스트 안전하게 가져오기 (타입 정의와 완전 일치)
    const quoteText = translation?.quote ?? '';
    const authorText = translation?.author ?? '';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.dateText}>{item.display_date || ''}</Text>
          <TouchableOpacity
            onPress={() => handleRemoveLike(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="heart" size={24} color="#f43f5e" />
          </TouchableOpacity>
        </View>

        <Text style={styles.quoteText}>"{quoteText}"</Text>
        <Text style={styles.authorText}>- {authorText}</Text>

        {item.category && item.category.length > 0 && (
          <View style={styles.tagContainer}>
            {item.category.map((cat, idx) => (
              <View key={idx} style={styles.tag}>
                <Text style={styles.tagText}>{t(`category.${cat}`, cat)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // 로딩 중일 때 보여줄 인디케이터
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {savedQuotes.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="heart-dislike-outline" size={50} color="#64748b" />
          <Text style={styles.emptyText}>{t('savedScreen.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={savedQuotes}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b111e',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 40,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  quoteText: {
    fontSize: 16,
    color: '#e2e8f0',
    lineHeight: 24,
    fontWeight: '500',
  },
  authorText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 8,
    fontStyle: 'italic',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  tag: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    color: '#38bdf8',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
});
