import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTranslation, useLocale, useDateFormatter, useNumberFormatter } from '../useTranslation';
import { TestWrapper } from '../../test/test-utils';
import '../../lib/i18n'; // Initialize i18n for tests

describe('useTranslation Hook', () => {
  beforeEach(async () => {
    // Wait for i18n to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  it('should return translation function and current language', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper: TestWrapper });
    
    expect(typeof result.current.t).toBe('function');
    expect(result.current.language).toBe('en');
    expect(typeof result.current.changeLanguage).toBe('function');
    expect(typeof result.current.isReady).toBe('boolean');
  });

  it('should translate keys correctly', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper: TestWrapper });
    
    expect(result.current.t('common.loading')).toBe('Loading...');
    expect(result.current.t('common.save')).toBe('Save');
  });

  it('should change language when requested', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper: TestWrapper });
    
    act(() => {
      result.current.changeLanguage('es');
    });
    
    expect(result.current.language).toBe('es');
    expect(result.current.t('common.loading')).toBe('Cargando...');
  });
});

describe('useLocale Hook', () => {
  it('should return current locale', () => {
    const { result } = renderHook(() => useLocale(), { wrapper: TestWrapper });
    
    expect(result.current).toBe('en');
  });
});

describe('useDateFormatter Hook', () => {
  it('should format dates with current locale', () => {
    const { result } = renderHook(() => useDateFormatter(), { wrapper: TestWrapper });
    
    const testDate = new Date('2024-01-15T12:00:00Z');
    const formatted = result.current.formatDate(testDate);
    
    expect(formatted).toMatch(/Jan/); // Should contain abbreviated month
    expect(formatted).toMatch(/2024/); // Should contain year
    expect(typeof formatted).toBe('string');
  });

  it('should format time with current locale', () => {
    const { result } = renderHook(() => useDateFormatter(), { wrapper: TestWrapper });
    
    const testDate = new Date('2024-01-15T14:30:00');
    const formatted = result.current.formatTime(testDate);
    
    expect(formatted).toMatch(/14:30|2:30/); // Should contain time (24h or 12h format)
  });

  it('should format datetime with current locale', () => {
    const { result } = renderHook(() => useDateFormatter(), { wrapper: TestWrapper });
    
    const testDate = new Date('2024-01-15T14:30:00');
    const formatted = result.current.formatDateTime(testDate);
    
    expect(formatted).toMatch(/Jan/); // Should contain month
    expect(formatted).toMatch(/15/); // Should contain day
    expect(formatted).toMatch(/14:30|2:30/); // Should contain time
  });
});

describe('useNumberFormatter Hook', () => {
  it('should format numbers with current locale', () => {
    const { result } = renderHook(() => useNumberFormatter(), { wrapper: TestWrapper });
    
    const formatted = result.current.formatNumber(1234.56);
    
    expect(formatted).toMatch(/1,234\.56|1\.234,56/); // Should be formatted with locale separators
  });

  it('should format weight with units', () => {
    const { result } = renderHook(() => useNumberFormatter(), { wrapper: TestWrapper });
    
    const metricWeight = result.current.formatWeight(70, 'metric');
    const imperialWeight = result.current.formatWeight(154, 'imperial');
    
    expect(metricWeight).toBe('70 kg');
    expect(imperialWeight).toBe('154 lbs');
  });

  it('should format percentages', () => {
    const { result } = renderHook(() => useNumberFormatter(), { wrapper: TestWrapper });
    
    const formatted = result.current.formatPercentage(0.75);
    
    expect(formatted).toMatch(/75%/);
  });
});