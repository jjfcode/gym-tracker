import { useTranslation } from '../../../hooks/useTranslation';
import styles from './LanguageSwitcher.module.css';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'toggle';
  className?: string;
}

export function LanguageSwitcher({ 
  variant = 'dropdown', 
  className = '' 
}: LanguageSwitcherProps) {
  const { t, language, changeLanguage } = useTranslation();

  if (variant === 'toggle') {
    return (
      <div className={`${styles.toggle} ${className}`}>
        <button
          className={`${styles.toggleButton} ${language === 'en' ? styles.active : ''}`}
          onClick={() => changeLanguage('en')}
          aria-label={t('settings.english')}
        >
          EN
        </button>
        <button
          className={`${styles.toggleButton} ${language === 'es' ? styles.active : ''}`}
          onClick={() => changeLanguage('es')}
          aria-label={t('settings.spanish')}
        >
          ES
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.dropdown} ${className}`}>
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value as 'en' | 'es')}
        className={styles.select}
        aria-label={t('settings.language')}
      >
        <option value="en">{t('settings.english')}</option>
        <option value="es">{t('settings.spanish')}</option>
      </select>
    </div>
  );
}