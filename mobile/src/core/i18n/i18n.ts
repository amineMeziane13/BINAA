import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import ar from './ar.json';
import fr from './fr.json';
import en from './en.json';

i18n.use(initReactI18next).init({
  resources: { ar: { translation: ar }, fr: { translation: fr }, en: { translation: en } },
  lng: 'fr',
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export function changeLanguage(lang: 'ar' | 'fr' | 'en') {
  i18n.changeLanguage(lang);
  I18nManager.forceRTL(lang === 'ar');
}

export default i18n;
