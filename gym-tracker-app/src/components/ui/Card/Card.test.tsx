import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Card from './Card';

describe('Card', () => {
  it('renders with default props', () => {
    render(<Card>Card content</Card>);
    
    const card = screen.getByText('Card content').closest('div');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('card');
    expect(card).toHaveClass('default');
    expect(card).toHaveClass('padding-md');
  });

  it('renders different variants correctly', () => {
    const { rerender } = render(<Card variant="default">Content</Card>);
    expect(screen.getByText('Content').closest('div')).toHaveClass('default');

    rerender(<Card variant="outlined">Content</Card>);
    expect(screen.getByText('Content').closest('div')).toHaveClass('outlined');

    rerender(<Card variant="elevated">Content</Card>);
    expect(screen.getByText('Content').closest('div')).toHaveClass('elevated');
  });

  it('renders different padding variants correctly', () => {
    const { rerender } = render(<Card padding="none">Content</Card>);
    expect(screen.getByText('Content').closest('div')).toHaveClass('padding-none');

    rerender(<Card padding="sm">Content</Card>);
    expect(screen.getByText('Content').closest('div')).toHaveClass('padding-sm');

    rerender(<Card padding="md">Content</Card>);
    expect(screen.getByText('Content').closest('div')).toHaveClass('padding-md');

    rerender(<Card padding="lg">Content</Card>);
    expect(screen.getByText('Content').closest('div')).toHaveClass('padding-lg');
  });

  it('renders as hoverable', () => {
    render(<Card hoverable>Hoverable content</Card>);
    
    const card = screen.getByText('Hoverable content').closest('div');
    expect(card).toHaveClass('hoverable');
  });

  it('renders with header', () => {
    const header = <h2>Card Header</h2>;
    render(<Card header={header}>Card content</Card>);
    
    expect(screen.getByText('Card Header')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with footer', () => {
    const footer = <button>Action</button>;
    render(<Card footer={footer}>Card content</Card>);
    
    expect(screen.getByText('Card content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('renders with both header and footer', () => {
    const header = <h2>Header</h2>;
    const footer = <button>Footer</button>;
    
    render(
      <Card header={header} footer={footer}>
        Content
      </Card>
    );
    
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Footer' })).toBeInTheDocument();
  });

  it('handles click events when hoverable', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(
      <Card hoverable onClick={handleClick}>
        Clickable card
      </Card>
    );
    
    const card = screen.getByText('Clickable card').closest('div');
    await user.click(card!);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('forwards additional props', () => {
    render(
      <Card data-testid="custom-card" aria-label="Custom card">
        Content
      </Card>
    );
    
    const card = screen.getByTestId('custom-card');
    expect(card).toHaveAttribute('aria-label', 'Custom card');
  });

  it('applies custom className', () => {
    render(<Card className="custom-class">Content</Card>);
    
    const card = screen.getByText('Content').closest('div');
    expect(card).toHaveClass('custom-class');
    expect(card).toHaveClass('card'); // Should still have base class
  });

  it('renders content in correct structure', () => {
    const header = <span data-testid="header">Header</span>;
    const footer = <span data-testid="footer">Footer</span>;
    
    render(
      <Card header={header} footer={footer}>
        <span data-testid="content">Content</span>
      </Card>
    );
    
    // Check that all elements are present
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    
    // Check that header comes before content and content comes before footer
    const headerElement = screen.getByTestId('header');
    const contentElement = screen.getByTestId('content');
    const footerElement = screen.getByTestId('footer');
    
    expect(headerElement.compareDocumentPosition(contentElement)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(contentElement.compareDocumentPosition(footerElement)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});