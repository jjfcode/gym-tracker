import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WelcomeStep } from '../components/WelcomeStep';

// Simple test for the welcome step component
const mockProps = {
  data: {},
  onNext: () => {},
  onBack: () => {},
  isFirstStep: true,
  isLastStep: false
};

describe('WelcomeStep', () => {
  it('renders welcome content', () => {
    render(<WelcomeStep {...mockProps} />);

    expect(screen.getByText('Welcome to Gym Tracker!')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
    expect(screen.getByText('Track your progress')).toBeInTheDocument();
    expect(screen.getByText('Personalized workouts')).toBeInTheDocument();
    expect(screen.getByText('Works offline')).toBeInTheDocument();
  });

  it('renders time estimate', () => {
    render(<WelcomeStep {...mockProps} />);
    
    expect(screen.getByText('This setup will take about 2 minutes.')).toBeInTheDocument();
  });
});