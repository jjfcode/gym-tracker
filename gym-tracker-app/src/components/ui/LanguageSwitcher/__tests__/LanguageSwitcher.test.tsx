import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { TestWrapper } from '../../../../test/test-utils';

// Mock the useTranslation hook
const mockChangeLanguage = vi.fn();
vi.mock('../../../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'settings.language': 'Language',
        'settings.english': 'English',
        'settings.spanish': 'Spanish',
      };
      return translations[key] || key;
    },
    language: 'en',
    changeLanguage: mockChangeLanguage,
  }),
}));

describe('LanguageSwitcher Component', () => {
  beforeEach(() => {
    mockChangeLanguage.mockClear();
  });

  describe('Dropdown Variant', () => {
    it('should render dropdown variant by default', () => {
      render(
        <TestWrapper>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      expect(select).toHaveAttribute('aria-label', 'Language');
    });

    it('should show current language as selected', () => {
      render(
        <TestWrapper>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('en');
    });

    it('should call changeLanguage when selection changes', () => {
      render(
        <TestWrapper>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'es' } });

      expect(mockChangeLanguage).toHaveBeenCalledWith('es');
    });

    it('should display language options', () => {
      render(
        <TestWrapper>
          <LanguageSwitcher />
        </TestWrapper>
      );

      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Spanish')).toBeInTheDocument();
    });
  });

  describe('Toggle Variant', () => {
    it('should render toggle variant when specified', () => {
      render(
        <TestWrapper>
          <LanguageSwitcher variant="toggle" />
        </TestWrapper>
      );

      const enButton = screen.getByRole('button', { name: 'English' });
      const esButton = screen.getByRole('button', { name: 'Spanish' });

      expect(enButton).toBeInTheDocument();
      expect(esButton).toBeInTheDocument();
    });

    it('should highlight current language button', () => {
      render(
        <TestWrapper>
          <LanguageSwitcher variant="toggle" />
        </TestWrapper>
      );

      const enButton = screen.getByRole('button', { name: 'English' });
      expect(enButton).toHaveClass('active');
    });

    it('should call changeLanguage when button is clicked', () => {
      render(
        <TestWrapper>
          <LanguageSwitcher variant="toggle" />
        </TestWrapper>
      );

      const esButton = screen.getByRole('button', { name: 'Spanish' });
      fireEvent.click(esButton);

      expect(mockChangeLanguage).toHaveBeenCalledWith('es');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for dropdown', () => {
      render(
        <TestWrapper>
          <LanguageSwitcher />
        </TestWrapper>
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-label', 'Language');
    });

    it('should have proper ARIA labels for toggle buttons', () => {
      render(
        <TestWrapper>
          <LanguageSwitcher variant="toggle" />
        </TestWrapper>
      );

      const enButton = screen.getByRole('button', { name: 'English' });
      const esButton = screen.getByRole('button', { name: 'Spanish' });

      expect(enButton).toHaveAttribute('aria-label', 'English');
      expect(esButton).toHaveAttribute('aria-label', 'Spanish');
    });
  });

  describe('Custom Props', () => {
    it('should apply custom className', () => {
      render(
        <TestWrapper>
          <LanguageSwitcher className="custom-class" />
        </TestWrapper>
      );

      const container = screen.getByRole('combobox').parentElement;
      expect(container).toHaveClass('custom-class');
    });
  });
});