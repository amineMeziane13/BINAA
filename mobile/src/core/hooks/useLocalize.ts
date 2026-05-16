import { useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';
import { changeLanguage } from '../i18n/i18n';

export function useLocalize() {
  const { t, i18n } = useTranslation();
  const isRTL = I18nManager.isRTL;
  const locale = i18n.language;

  const setLocale = (lang: 'ar' | 'fr' | 'en') => changeLanguage(lang);

  return { t, locale, isRTL, setLocale };
}
