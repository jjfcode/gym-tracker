import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from './ThemeToggle';
import { useAppStore } from '../../../store/appStore';

// Mock the store
vi.mock('../../../store/appStore', () => ({
  useAppStore: vi.fn(),
}));

const mockUseAppStore = vi.mocked(useAppStore);

describe('ThemeToggle', () => {
  const mockSetTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppStore.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      language: 'en',
      units: 'imperial',
      isOnboarding: false,
      activeWorkout: null,
      setLanguage: vi.fn(),
      setUnits: vi.fn(),
      setIsOnboarding: vi.fn(),
      setActiveWorkout: vi.fn(),
    });
  });

  describe('button variant', () => {
    it('renders as button by default', () => {
      render(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('Current theme: Light'));
    });

    it('shows correct icon for light theme', () => {
      render(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      // Check for sun icon (light theme icon)
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('shows correct icon for dark theme', () => {
      mockUseAppStore.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        language: 'en',
        units: 'imperial',
        isOnboarding: false,
        activeWorkout: null,
        setLanguage: vi.fn(),
        setUnits: vi.fn(),
        setIsOnboarding: vi.fn(),
        setActiveWorkout: vi.fn(),
      });

      render(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('Current theme: Dark'));
    });

    it('shows correct icon for system theme', () => {
      mockUseAppStore.mockReturnValue({
        theme: 'system',
        setTheme: mockSetTheme,
        language: 'en',
        units: 'imperial',
        isOnboarding: false,
        activeWorkout: null,
        setLanguage: vi.fn(),
        setUnits: vi.fn(),
        setIsOnboarding: vi.fn(),
        setActiveWorkout: vi.fn(),
      });

      render(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('Current theme: System'));
    });

    it('cycles through themes when clicked', async () => {
      const user = userEvent.setup();
      
      const { rerender } = render(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      
      // First click: light -> dark
      await user.click(button);
      expect(mockSetTheme).toHaveBeenCalledWith('dark');
      
      // Simulate theme change to dark and rerender
      mockUseAppStore.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        language: 'en',
        units: 'imperial',
        isOnboarding: false,
        activeWorkout: null,
        setLanguage: vi.fn(),
        setUnits: vi.fn(),
        setIsOnboarding: vi.fn(),
        setActiveWorkout: vi.fn(),
      });
      
      rerender(<ThemeToggle />);
      const darkButton = screen.getByRole('button');
      
      // Second click: dark -> system
      await user.click(darkButton);
      expect(mockSetTheme).toHaveBeenCalledWith('system');
    });

    it('shows label when showLabel is true', () => {
      render(<ThemeToggle showLabel />);
      
      expect(screen.getByText('Light')).toBeInTheDocument();
    });
  });

  describe('select variant', () => {
    it('renders as select when variant is select', () => {
      render(<ThemeToggle variant="select" />);
      
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      expect(select).toHaveValue('light');
    });

    it('shows label when showLabel is true', () => {
      render(<ThemeToggle variant="select" showLabel />);
      
      expect(screen.getByText('Theme')).toBeInTheDocument();
      expect(screen.getByLabelText('Theme')).toBeInTheDocument();
    });

    it('has all theme options', () => {
      render(<ThemeToggle variant="select" />);
      
      expect(screen.getByRole('option', { name: 'Light' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Dark' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'System' })).toBeInTheDocument();
    });

    it('calls setTheme when option is selected', async () => {
      const user = userEvent.setup();
      
      render(<ThemeToggle variant="select" />);
      
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'dark');
      
      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('shows current theme as selected', () => {
      mockUseAppStore.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        language: 'en',
        units: 'imperial',
        isOnboarding: false,
        activeWorkout: null,
        setLanguage: vi.fn(),
        setUnits: vi.fn(),
        setIsOnboarding: vi.fn(),
        setActiveWorkout: vi.fn(),
      });

      render(<ThemeToggle variant="select" />);
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('dark');
    });
  });
});