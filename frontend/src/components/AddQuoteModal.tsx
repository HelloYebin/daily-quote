import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface AddQuoteModalProps {
  isVisible: boolean;
  onClose: () => void;
  // 부모에게 4개의 데이터를 객체로 묶어서 전달합니다.
  onSave: (data: {
    text: string;
    nickname: string;
    source: string;
    category: string;
  }) => void;
}

import { CATEGORIES } from '../constants/categories';

export default function AddQuoteModal({
  isVisible,
  onClose,
  onSave,
}: AddQuoteModalProps) {
  const [inputText, setInputText] = useState('');
  const [nickname, setNickname] = useState('');
  const [source, setSource] = useState(''); // 👈 출처 상태 추가
  const [selectedCategory, setSelectedCategory] = useState('healing');
  const { t } = useTranslation();

  const handleSave = () => {
    // 필수 값인 본문과 닉네임이 채워졌는지 검사 (출처는 선택사항으로 비워둘 수 있게 처리)
    if (inputText.trim() === '' || nickname.trim() === '') return;

    onSave({
      text: inputText,
      nickname: nickname,
      source: source.trim(), // 앞뒤 공백 제거
      category: selectedCategory,
    });

    // 저장 완료 후 입력 필드 전체 초기화
    setInputText('');
    setNickname('');
    setSource('');
    setSelectedCategory('healing');
  };

  // 등록 버튼 활성화 조건 (본문과 닉네임이 입력되었을 때)
  const isFormValid = inputText.trim() !== '' && nickname.trim() !== '';

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* 헤더 영역 */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('addQuote.title')}</Text>
                <Pressable onPress={onClose}>
                  <Ionicons name="close" size={24} color="#64748b" />
                </Pressable>
              </View>

              {/* 1. 카테고리 선택 */}
              <Text style={styles.inputLabel}>{t('addQuote.category')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryContainer}
              >
                {CATEGORIES.map(cat => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <Pressable
                      key={cat}
                      style={[
                        styles.categoryChip,
                        isSelected && styles.selectedChip,
                      ]}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          isSelected && styles.selectedCategoryText,
                        ]}
                      >
                        {/* 💡 카테고리 한글/영어 변환을 위해 i18n 키로 감싸서 출력 (선택사항) */}
                        {t(`category.${cat}`, { defaultValue: cat })}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* 2. 닉네임 입력창 */}
              <Text style={styles.inputLabel}>{t('addQuote.authorLabel')}</Text>
              <TextInput
                style={styles.inputField}
                placeholder={t('addQuote.authorPlaceholder')}
                placeholderTextColor="#94a3b8"
                value={nickname}
                onChangeText={setNickname}
              />

              {/* 3. 출처 입력창 */}
              <Text style={styles.inputLabel}>{t('addQuote.sourceLabel')}</Text>
              <TextInput
                style={styles.inputField}
                placeholder={t('addQuote.sourcePlaceholder')}
                placeholderTextColor="#94a3b8"
                value={source}
                onChangeText={setSource}
              />

              {/* 4. 명언 본문 입력창 */}
              <Text style={styles.inputLabel}>
                {t('addQuote.contentLabel')}
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder={t('addQuote.contentPlaceholder')}
                placeholderTextColor="#94a3b8"
                multiline={true}
                value={inputText}
                onChangeText={setInputText}
              />

              {/* 등록 버튼 */}
              <Pressable
                style={[
                  styles.submitButton,
                  !isFormValid && styles.disabledButton,
                ]}
                onPress={handleSave}
                disabled={!isFormValid}
              >
                <Text style={styles.submitButtonText}>
                  {t('addQuote.submit')}
                </Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0b1220' },

  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
  },

  // 카테고리 스타일
  categoryContainer: { flexDirection: 'row', marginBottom: 14 },
  categoryChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedChip: { backgroundColor: '#38bdf8', borderColor: '#38bdf8' },
  categoryText: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  selectedCategoryText: { color: '#ffffff', fontWeight: '700' },

  // 일반 한 줄 입력 필드 스타일 통합 (닉네임, 출처)
  inputField: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0b1220',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  // 여러 줄 본문 입력 필드 스타일
  textArea: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#0b1220',
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  // 버튼 스타일
  submitButton: {
    backgroundColor: '#38bdf8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: '#cbd5e1' },
  submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
