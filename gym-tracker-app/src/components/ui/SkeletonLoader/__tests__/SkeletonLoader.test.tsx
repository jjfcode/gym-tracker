import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SkeletonLoader } from '../SkeletonLoader';

describe('SkeletonLoader Component', () => {
  it('should render dashboard skeleton without errors', () => {
    const { container } = render(<SkeletonLoader variant="dashboard" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render workout skeleton without errors', () => {
    const { container } = render(<SkeletonLoader variant="workout" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render progress skeleton without errors', () => {
    const { container } = render(<SkeletonLoader variant="progress" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render exercise-list skeleton without errors', () => {
    const { container } = render(<SkeletonLoader variant="exercise-list" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render settings skeleton without errors', () => {
    const { container } = render(<SkeletonLoader variant="settings" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render card skeleton without errors', () => {
    const { container } = render(<SkeletonLoader variant="card" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render multiple instances when count is specified', () => {
    const { container } = render(<SkeletonLoader variant="card" count={3} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render single instance by default', () => {
    const { container } = render(<SkeletonLoader variant="card" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle unknown variant gracefully', () => {
    // @ts-expect-error Testing unknown variant
    const { container } = render(<SkeletonLoader variant="unknown" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});