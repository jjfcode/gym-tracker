import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../components/ui/ThemeProvider';
import '../lib/i18n'; // Initialize i18n

// Test wrapper component that provides all necessary contexts
export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// Custom render function that can be extended with providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: TestWrapper, ...options });

// Helper to check if element has CSS Module class
export const hasModuleClass = (element: Element, className: string): boolean => {
  const classList = Array.from(element.classList);
  return classList.some(cls => cls.includes(className));
};

// Helper to get elements by CSS Module class
export const getByModuleClass = (container: Element, className: string): Element | null => {
  const selector = `[class*="${className}"]`;
  return container.querySelector(selector);
};

export * from '@testing-library/react';
export { customRender as render };