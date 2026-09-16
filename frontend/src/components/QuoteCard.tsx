import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { toggleLikeQuote, isQuoteLiked } from '../services/likeService';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Quote } from '../types/quote';

type Props = {
  data: Quote | null;
};

export default function QuoteCard({ data }: Props) {
  const { i18n, t } = useTranslation();
  const [isLiked, setIsLiked] = useState(false);

  // 1. data가 변경되거나 로드될 때 저장된 좋아요 상태 불러오기
  const checkLikeStatus = useCallback(async () => {
    if (!data?.id) return;
    const liked = await isQuoteLiked(data.id);
    setIsLiked(liked);
  }, [data?.id]);

  useFocusEffect(
    useCallback(() => {
      checkLikeStatus();
    }, [checkLikeStatus]),
  );
  // 2. 좋아요 클릭 시 상태 반영 및 서비스 호출
  const handleLikePress = async () => {
    if (!data) return;
    const nextState = await toggleLikeQuote(data);
    setIsLiked(nextState);
  };

  if (!data) return null;

  // 1. 현재 언어에 맞는 translations 객체 안전하게 추출
  const currentLang = i18n.language ? i18n.language.split('-')[0] : 'ko';

  const translation =
    data.translations?.[currentLang] ||
    data.translations?.[i18n.language] ||
    data.translations?.['ko'] ||
    data.translations?.['en'];

  if (!translation) return null;

  return (
    <View style={styles.card}>
      {/* 명언 본문 & 작가 */}
      <Text style={styles.quote}>“{translation.quote}”</Text>
      <Text style={styles.author}>- {translation.author}</Text>

      {/* 하단 영역 */}
      <View style={styles.footer}>
        {/* 카테고리 (중앙 정렬) */}
        {data.category && data.category.length > 0 && (
          <Text style={styles.category}>
            {t(`category.${data.category[0]}`, data.category[0])}
          </Text>
        )}

        {/* 좋아요 버튼 (우측 고정) */}
        <TouchableOpacity
          onPress={handleLikePress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.likeButton}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={22}
            color={isLiked ? '#f43f5e' : '#94a3b8'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111c33',
    padding: 24,
    borderRadius: 20,
    minHeight: 180,
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  quote: {
    fontSize: 20,
    color: '#f8fafc',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 16,
  },
  author: {
    color: '#94a3b8',
    textAlign: 'center',
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative', // 우측 하트 버튼 배치를 위한 상대 좌표
    width: '100%',
  },
  category: {
    backgroundColor: '#1f2937',
    color: '#38bdf8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    overflow: 'hidden', // iOS용 borderRadius 보장
  },
  likeButton: {
    position: 'absolute',
    right: 0,
    padding: 2,
  },
});
