import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, hasModuleClass } from '../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    // Button type is set via props spread, so it should be 'button'
    expect(button.tagName).toBe('BUTTON');
  });

  it('renders different variants correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(hasModuleClass(screen.getByRole('button'), 'primary')).toBe(true);

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(hasModuleClass(screen.getByRole('button'), 'secondary')).toBe(true);

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(hasModuleClass(screen.getByRole('button'), 'ghost')).toBe(true);

    rerender(<Button variant="danger">Danger</Button>);
    expect(hasModuleClass(screen.getByRole('button'), 'danger')).toBe(true);
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(hasModuleClass(screen.getByRole('button'), 'sm')).toBe(true);

    rerender(<Button size="md">Medium</Button>);
    expect(hasModuleClass(screen.getByRole('button'), 'md')).toBe(true);

    rerender(<Button size="lg">Large</Button>);
    expect(hasModuleClass(screen.getByRole('button'), 'lg')).toBe(true);
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state correctly', () => {
    render(<Button loading>Loading</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(hasModuleClass(button, 'loading')).toBe(true);
    expect(button.querySelector('[class*="spinner"]')).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders with full width', () => {
    render(<Button fullWidth>Full Width</Button>);
    
    const button = screen.getByRole('button');
    expect(hasModuleClass(button, 'fullWidth')).toBe(true);
  });

  it('renders with left and right icons', () => {
    const leftIcon = <span data-testid="left-icon">←</span>;
    const rightIcon = <span data-testid="right-icon">→</span>;
    
    render(
      <Button leftIcon={leftIcon} rightIcon={rightIcon}>
        With Icons
      </Button>
    );
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('hides icons when loading', () => {
    const leftIcon = <span data-testid="left-icon">←</span>;
    const rightIcon = <span data-testid="right-icon">→</span>;
    
    render(
      <Button loading leftIcon={leftIcon} rightIcon={rightIcon}>
        Loading
      </Button>
    );
    
    expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
  });

  it('forwards additional props', () => {
    render(
      <Button data-testid="custom-button" aria-label="Custom button">
        Custom
      </Button>
    );
    
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-label', 'Custom button');
  });

  it('prevents click when disabled or loading', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    const { rerender } = render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
    
    rerender(
      <Button loading onClick={handleClick}>
        Loading
      </Button>
    );
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});