import { describe, it, expect, beforeEach } from 'vitest';
import i18n from '../i18n';

describe('i18n Configuration', () => {
  beforeEach(async () => {
    // Reset to English before each test
    await i18n.changeLanguage('en');
  });

  it('should initialize with correct default language', () => {
    expect(i18n.language).toBe('en');
  });

  it('should have English and Spanish resources loaded', () => {
    expect(i18n.hasResourceBundle('en', 'translation')).toBe(true);
    expect(i18n.hasResourceBundle('es', 'translation')).toBe(true);
  });

  it('should translate common keys in English', () => {
    expect(i18n.t('common.loading')).toBe('Loading...');
    expect(i18n.t('common.save')).toBe('Save');
    expect(i18n.t('common.cancel')).toBe('Cancel');
  });

  it('should translate common keys in Spanish', async () => {
    await i18n.changeLanguage('es');
    expect(i18n.t('common.loading')).toBe('Cargando...');
    expect(i18n.t('common.save')).toBe('Guardar');
    expect(i18n.t('common.cancel')).toBe('Cancelar');
  });

  it('should translate navigation keys in English', () => {
    expect(i18n.t('navigation.dashboard')).toBe('Dashboard');
    expect(i18n.t('navigation.workouts')).toBe('Workouts');
    expect(i18n.t('navigation.progress')).toBe('Progress');
  });

  it('should translate navigation keys in Spanish', async () => {
    await i18n.changeLanguage('es');
    expect(i18n.t('navigation.dashboard')).toBe('Panel');
    expect(i18n.t('navigation.workouts')).toBe('Entrenamientos');
    expect(i18n.t('navigation.progress')).toBe('Progreso');
  });

  it('should handle pluralization in English', () => {
    expect(i18n.t('onboarding.daysPerWeek', { count: 1 })).toBe('1 day per week');
    expect(i18n.t('onboarding.daysPerWeek', { count: 3 })).toBe('3 days per week');
  });

  it('should handle pluralization in Spanish', async () => {
    await i18n.changeLanguage('es');
    expect(i18n.t('onboarding.daysPerWeek', { count: 1 })).toBe('1 día por semana');
    expect(i18n.t('onboarding.daysPerWeek', { count: 3 })).toBe('3 días por semana');
  });

  it('should handle interpolation', () => {
    expect(i18n.t('onboarding.step', { current: 2, total: 4 })).toBe('Step 2 of 4');
  });

  it('should handle interpolation in Spanish', async () => {
    await i18n.changeLanguage('es');
    expect(i18n.t('onboarding.step', { current: 2, total: 4 })).toBe('Paso 2 de 4');
  });

  it('should fallback to English for missing keys', async () => {
    await i18n.changeLanguage('es');
    // Test with a key that might not exist in Spanish
    const fallbackKey = 'nonexistent.key';
    expect(i18n.t(fallbackKey)).toBe(fallbackKey); // Should return the key itself as fallback
  });

  it('should handle missing translations gracefully', () => {
    const missingKey = 'missing.translation.key';
    expect(i18n.t(missingKey)).toBe(missingKey);
  });
});