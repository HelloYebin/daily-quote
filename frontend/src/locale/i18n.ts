import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';

import en from './en.json';
import ko from './ko.json';
import zhHK from './zh-HK.json';

const resources = {
  en: { translation: en },
  ko: { translation: ko },
  'zh-HK': { translation: zhHK },
} as const;

const initI18n = async () => {
  const savedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.APP_LANGUAGE);
  console.log(savedLanguage);
  await i18n.use(initReactI18next).init({
    resources,

    // 저장된 언어가 있으면 사용하고,
    // 없으면 영어 사용
    lng: savedLanguage || 'en',

    fallbackLng: 'en',

    compatibilityJSON: 'v4',

    interpolation: {
      escapeValue: false,
    },
  });
};

initI18n();

export default i18n;
