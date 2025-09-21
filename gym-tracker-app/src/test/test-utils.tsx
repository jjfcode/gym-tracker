import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Custom render function that can be extended with providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, options);

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