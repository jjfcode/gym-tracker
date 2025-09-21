import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { useEffect } from 'react';

export function useTranslation() {
  const { t, i18n } = useI18nTranslation();
  const { language, setLanguage } = useAppStore();

  // Sync i18n language with store
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  // Update store when i18n language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      if (lng !== language && (lng === 'en' || lng === 'es')) {
        setLanguage(lng as 'en' | 'es');
      }
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [language, setLanguage, i18n]);

  const changeLanguage = (lng: 'en' | 'es') => {
    setLanguage(lng);
    i18n.changeLanguage(lng);
  };

  return {
    t,
    language,
    changeLanguage,
    isReady: i18n.isInitialized,
  };
}

// Helper hook for getting current locale
export function useLocale() {
  const { language } = useAppStore();
  return language;
}

// Helper hook for formatting dates with current locale
export function useDateFormatter() {
  const locale = useLocale();
  
  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const localeMap: Record<string, string> = {
      en: 'en-US',
      es: 'es-ES',
    };
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    
    return dateObj.toLocaleDateString(
      localeMap[locale] || 'en-US',
      { ...defaultOptions, ...options }
    );
  };

  const formatTime = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const localeMap: Record<string, string> = {
      en: 'en-US',
      es: 'es-ES',
    };
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };
    
    return dateObj.toLocaleTimeString(
      localeMap[locale] || 'en-US',
      { ...defaultOptions, ...options }
    );
  };

  const formatDateTime = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const localeMap: Record<string, string> = {
      en: 'en-US',
      es: 'es-ES',
    };
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    
    return dateObj.toLocaleString(
      localeMap[locale] || 'en-US',
      { ...defaultOptions, ...options }
    );
  };

  return {
    formatDate,
    formatTime,
    formatDateTime,
    locale,
  };
}

// Helper hook for formatting numbers with current locale
export function useNumberFormatter() {
  const locale = useLocale();
  
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    const localeMap: Record<string, string> = {
      en: 'en-US',
      es: 'es-ES',
    };
    
    return number.toLocaleString(localeMap[locale] || 'en-US', options);
  };

  const formatWeight = (weight: number, units: 'metric' | 'imperial') => {
    const unit = units === 'metric' ? 'kg' : 'lbs';
    const formattedNumber = formatNumber(weight, { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 1 
    });
    return `${formattedNumber} ${unit}`;
  };

  const formatPercentage = (value: number) => {
    return formatNumber(value, { 
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1 
    });
  };

  return {
    formatNumber,
    formatWeight,
    formatPercentage,
    locale,
  };
}