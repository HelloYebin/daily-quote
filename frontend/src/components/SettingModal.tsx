import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { STORAGE_KEYS } from '../constants/storageKeys';

// 부모(HomeScreen)로부터 받아올 스위치와 기능들의 타입 정의
interface SettingModalProps {
  isVisible: boolean; // 모달이 켜졌는가?
  onClose: () => void; // 모달을 닫는 함수
}

export const SettingModal: React.FC<SettingModalProps> = ({
  isVisible,
  onClose,
}) => {
  const { t, i18n } = useTranslation(); // 👈 t 함수와 i18n 객체 추출

  const changeAppLanguage = async (lang: 'ko' | 'en' | 'zh-HK') => {
    i18n.changeLanguage(lang);
    await AsyncStorage.setItem(STORAGE_KEYS.APP_LANGUAGE, lang);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      {/* 바깥 어두운 배경 영역 */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          {/* 팝업 몸통 */}
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* 모달 제목 */}
              <Text style={styles.modalTitle}>⚙️ {t('settings')}</Text>

              <View style={styles.menuContainer}>
                {/* 1. 🔔 알림 설정 구역 */}
                <View style={styles.menuItem}>
                  <View style={styles.menuTextRow}>
                    <Text style={styles.menuIcon}>🔔</Text>
                    <Text style={styles.menuText}>
                      {t('notification_settings')}
                    </Text>
                  </View>
                  {/* iOS/안드로이드 네이티브 스위치 컴포넌트 */}
                  {/* <Switch
                    trackColor={{ false: '#767577', true: '#fc5c65' }} // 켜졌을 때 예빈 님 픽 무광 레드
                    thumbColor={isNotificationEnabled ? '#ffffff' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleNotification}
                    value={isNotificationEnabled}
                  /> */}
                </View>

                {/* 2. 🌐 언어 변경 구역 (세로 확장형 레이아웃) */}
                <View
                  style={[
                    styles.menuItem,
                    {
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      borderBottomWidth: 0,
                    },
                  ]}
                >
                  <View style={[styles.menuTextRow, { marginBottom: 16 }]}>
                    <Text style={styles.menuIcon}>🌐</Text>
                    <Text style={styles.menuText}>
                      {t('language_settings')}
                    </Text>
                  </View>

                  {/* 🚀 향후 무한 확장이 가능한 세로형 언어 리스트 */}
                  <View style={styles.langListGroup}>
                    {/* 대한민국 (KO) */}
                    <TouchableOpacity
                      style={[
                        styles.langRow,
                        i18n.language === 'ko' && styles.activeLangRow,
                      ]}
                      onPress={() => changeAppLanguage('ko')}
                    >
                      <Text
                        style={[
                          styles.langText,
                          i18n.language === 'ko' && styles.activeLangText,
                        ]}
                      >
                        한국어 (KO)
                      </Text>
                      {i18n.language === 'ko' && (
                        <Text style={styles.checkIcon}>✓</Text>
                      )}
                    </TouchableOpacity>

                    {/* 미국/영국 (EN) */}
                    <TouchableOpacity
                      style={[
                        styles.langRow,
                        i18n.language === 'en' && styles.activeLangRow,
                      ]}
                      onPress={() => changeAppLanguage('en')}
                    >
                      <Text
                        style={[
                          styles.langText,
                          i18n.language === 'en' && styles.activeLangText,
                        ]}
                      >
                        English (EN)
                      </Text>
                      {i18n.language === 'en' && (
                        <Text style={styles.checkIcon}>✓</Text>
                      )}
                    </TouchableOpacity>

                    {/* 홍콩/마카오 광동어 (zh-HK) */}
                    <TouchableOpacity
                      style={[
                        styles.langRow,
                        i18n.language === 'zh-HK' && styles.activeLangRow,
                      ]}
                      onPress={() => changeAppLanguage('zh-HK')}
                    >
                      <Text
                        style={[
                          styles.langText,
                          i18n.language === 'zh-HK' && styles.activeLangText,
                        ]}
                      >
                        廣東話 (zh-HK)
                      </Text>
                      {i18n.language === 'zh-HK' && (
                        <Text style={styles.checkIcon}>✓</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* 닫기 버튼 */}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>{t('close')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#1e1e1e', // 고급스러운 어두운 회색
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 24,
  },
  menuContainer: {
    width: '100%',
    backgroundColor: '#262626', // 메뉴 섹션을 감싸는 더 딥한 다크 배경
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  menuItem: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  menuTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  menuText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  /* 🌐 언어 선택 버튼 스타일 */
  langButtonGroup: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 3,
  },
  langButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  activeLangButton: {
    backgroundColor: '#fc5c65', // 선택된 언어 하이라이트 배경
  },
  langButtonText: {
    color: '#888888',
    fontSize: 13,
    fontWeight: '600',
  },
  activeLangButtonText: {
    color: '#ffffff', // 선택된 언어 화이트 처리
  },
  closeButton: {
    backgroundColor: '#333333', // 닫기 버튼은 튀지 않게 차분한 다크그레이로 변경
    paddingVertical: 12,
    width: '100%', // 하단에 꽉 차게 변경해서 안정감 부여
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  /* 🌐 세로 확장형 언어 리스트 스타일 */
  langListGroup: {
    width: '100%',
    backgroundColor: '#1e1e1e', // 배경과 분리되는 딥한 다크 그레이 내부 박스
    borderRadius: 10,
    paddingVertical: 4,
  },
  langRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a', // 리스트 구분선
  },
  activeLangRow: {
    backgroundColor: '#2a2a2a', // 선택된 언어 라인은 살짝 더 밝게 음영 처리
  },
  langText: {
    color: '#aaaaaa',
    fontSize: 15,
    fontWeight: '500',
  },
  activeLangText: {
    color: '#fc5c65', // 선택된 언어 텍스트는 예빈 님 픽 무광 레드 처리
    fontWeight: '700',
  },
  checkIcon: {
    color: '#fc5c65',
    fontSize: 16,
    fontWeight: '700',
  },
});
