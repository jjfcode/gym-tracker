import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from '../Skeleton';

describe('Skeleton Component', () => {
  it('should render with default props', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton).toBeInTheDocument();
    // CSS modules transform class names, so we check for the transformed versions
    expect(skeleton.className).toContain('skeleton');
    expect(skeleton.className).toContain('text');
    expect(skeleton.className).toContain('pulse');
  });

  it('should render with custom width and height', () => {
    const { container } = render(<Skeleton width="200px" height="50px" />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton).toHaveStyle({
      width: '200px',
      height: '50px',
    });
  });

  it('should render with numeric width and height', () => {
    const { container } = render(<Skeleton width={200} height={50} />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton).toHaveStyle({
      width: '200px',
      height: '50px',
    });
  });

  it('should render different variants', () => {
    const { container, rerender } = render(<Skeleton variant="rectangular" />);
    expect((container.firstChild as HTMLElement).className).toContain('rectangular');

    rerender(<Skeleton variant="circular" />);
    expect((container.firstChild as HTMLElement).className).toContain('circular');

    rerender(<Skeleton variant="text" />);
    expect((container.firstChild as HTMLElement).className).toContain('text');
  });

  it('should render different animations', () => {
    const { container, rerender } = render(<Skeleton animation="wave" />);
    expect((container.firstChild as HTMLElement).className).toContain('wave');

    rerender(<Skeleton animation="pulse" />);
    expect((container.firstChild as HTMLElement).className).toContain('pulse');

    rerender(<Skeleton animation="none" />);
    expect((container.firstChild as HTMLElement).className).toContain('none');
  });

  it('should apply custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should combine all props correctly', () => {
    const { container } = render(
      <Skeleton
        width="100px"
        height="20px"
        variant="circular"
        animation="wave"
        className="test-class"
      />
    );
    
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.className).toContain('skeleton');
    expect(skeleton.className).toContain('circular');
    expect(skeleton.className).toContain('wave');
    expect(skeleton.className).toContain('test-class');
    expect(skeleton).toHaveStyle({
      width: '100px',
      height: '20px',
    });
  });
});