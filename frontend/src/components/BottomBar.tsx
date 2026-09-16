import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

interface BottomBarProps {
  loading: boolean;
  onPressAdd: () => void;
  onPressSettings: () => void;
}

export default function BottomBar({
  loading,
  onPressAdd,
  onPressSettings,
}: BottomBarProps) {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  return (
    <View style={styles.bottomBar}>
      {/* 1. 메뉴 버튼 */}
      <Pressable style={styles.navButton} onPress={onPressSettings}>
        {({ pressed }) => (
          <>
            <Ionicons
              name="settings-outline"
              size={26}
              color={pressed ? '#ffffff' : '#94a3b8'}
            />
            <Text style={[styles.navText, pressed && { color: '#ffffff' }]}>
              {t('settings')}
            </Text>
          </>
        )}
      </Pressable>

      {/* 2. 히스토리 버튼 */}
      <Pressable
        style={styles.navButton}
        disabled={loading}
        onPress={() => {
          navigation.navigate('History');
        }}
      >
        {({ pressed }) => (
          <>
            <Ionicons
              name="time-outline"
              size={26}
              color={loading ? '#38bdf8' : pressed ? '#ffffff' : '#94a3b8'}
            />
            <Text
              style={[
                styles.navText,
                {
                  color: loading ? '#38bdf8' : pressed ? '#ffffff' : '#94a3b8',
                },
              ]}
            >
              {t('history')}
            </Text>
          </>
        )}
      </Pressable>

      {/* 3. 보관함 버튼 */}
      <Pressable
        style={styles.navButton}
        onPress={() => navigation.navigate('Saved')}
      >
        {({ pressed }) => (
          <>
            <Ionicons
              name="bookmark-outline"
              size={26}
              color={pressed ? '#ffffff' : '#94a3b8'}
            />
            <Text style={[styles.navText, pressed && { color: '#ffffff' }]}>
              {t('saved')}
            </Text>
          </>
        )}
      </Pressable>

      {/* 4. 추가 버튼 */}
      <Pressable style={styles.navButton} onPress={onPressAdd}>
        {({ pressed }) => (
          <>
            <Ionicons
              name="add-circle-outline"
              size={26}
              color={pressed ? '#ffffff' : '#38bdf8'}
            />
            <Text
              style={[
                styles.navText,
                { color: pressed ? '#ffffff' : '#38bdf8' },
              ]}
            >
              {t('add')}
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: '#111a2e',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
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
