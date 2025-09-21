import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  es: {
    translation: esTranslations,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'gym-tracker-language',
    },
    
    // Namespace configuration
    defaultNS: 'translation',
    ns: ['translation'],
    
    // React specific options
    react: {
      useSuspense: false,
    },
  });

export default i18n;

// Helper function to format dates with locale
export const formatDate = (date: Date | string, locale: string = 'en'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const localeMap: Record<string, string> = {
    en: 'en-US',
    es: 'es-ES',
  };
  
  return dateObj.toLocaleDateString(localeMap[locale] || 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Helper function to format numbers with locale
export const formatNumber = (number: number, locale: string = 'en'): string => {
  const localeMap: Record<string, string> = {
    en: 'en-US',
    es: 'es-ES',
  };
  
  return number.toLocaleString(localeMap[locale] || 'en-US');
};

// Helper function to format weight with units
export const formatWeight = (
  weight: number, 
  units: 'metric' | 'imperial', 
  locale: string = 'en'
): string => {
  const unit = units === 'metric' ? 'kg' : 'lbs';
  const formattedNumber = formatNumber(weight, locale);
  return `${formattedNumber} ${unit}`;
};