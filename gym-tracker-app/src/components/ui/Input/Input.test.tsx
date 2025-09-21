import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    // Input type defaults to 'text' but may not be explicitly set in DOM
    expect(input.tagName).toBe('INPUT');
  });

  it('renders with label', () => {
    render(<Input label="Email" />);
    
    const label = screen.getByText('Email');
    const input = screen.getByRole('textbox');
    
    expect(label).toBeInTheDocument();
    expect(input).toHaveAccessibleName('Email');
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<Input size="sm" />);
    expect(screen.getByRole('textbox')).toHaveClass('sm');

    rerender(<Input size="md" />);
    expect(screen.getByRole('textbox')).toHaveClass('md');

    rerender(<Input size="lg" />);
    expect(screen.getByRole('textbox')).toHaveClass('lg');
  });

  it('renders different variants correctly', () => {
    const { rerender } = render(<Input variant="default" />);
    expect(screen.getByRole('textbox')).toHaveClass('default');

    rerender(<Input variant="error" />);
    expect(screen.getByRole('textbox')).toHaveClass('error');

    rerender(<Input variant="success" />);
    expect(screen.getByRole('textbox')).toHaveClass('success');
  });

  it('shows error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    
    const input = screen.getByRole('textbox');
    const errorMessage = screen.getByText('Invalid email');
    
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveAttribute('role', 'alert');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('error');
  });

  it('shows helper text', () => {
    render(<Input label="Password" helperText="Must be at least 8 characters" />);
    
    const helperText = screen.getByText('Must be at least 8 characters');
    expect(helperText).toBeInTheDocument();
  });

  it('prioritizes error over helper text', () => {
    render(
      <Input 
        label="Email" 
        error="Invalid email" 
        helperText="Enter your email address" 
      />
    );
    
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    expect(screen.queryByText('Enter your email address')).not.toBeInTheDocument();
  });

  it('handles user input', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'test@example.com');
    
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('test@example.com');
  });

  it('can be disabled', () => {
    render(<Input disabled />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('renders with full width', () => {
    render(<Input fullWidth />);
    
    // The fullWidth class is applied to the outermost container
    const input = screen.getByRole('textbox');
    const outerContainer = input.closest('.container');
    expect(outerContainer).toHaveClass('fullWidth');
  });

  it('renders with icons', () => {
    const leftIcon = <span data-testid="left-icon">@</span>;
    const rightIcon = <span data-testid="right-icon">✓</span>;
    
    render(<Input leftIcon={leftIcon} rightIcon={rightIcon} />);
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('applies correct classes with icons', () => {
    const leftIcon = <span>@</span>;
    const rightIcon = <span>✓</span>;
    
    const { rerender } = render(<Input leftIcon={leftIcon} />);
    expect(screen.getByRole('textbox')).toHaveClass('hasLeftIcon');

    rerender(<Input rightIcon={rightIcon} />);
    expect(screen.getByRole('textbox')).toHaveClass('hasRightIcon');

    rerender(<Input leftIcon={leftIcon} rightIcon={rightIcon} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('hasLeftIcon');
    expect(input).toHaveClass('hasRightIcon');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('generates unique IDs when not provided', () => {
    render(
      <div>
        <Input label="First" />
        <Input label="Second" />
      </div>
    );
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveAttribute('id');
    expect(inputs[1]).toHaveAttribute('id');
    expect(inputs[0].getAttribute('id')).not.toBe(inputs[1].getAttribute('id'));
  });

  it('uses provided ID', () => {
    render(<Input id="custom-id" label="Custom" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'custom-id');
  });
});