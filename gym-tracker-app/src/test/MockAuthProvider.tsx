import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import type { AuthUser } from '../types/auth';

// Mock auth context provider
export interface MockAuthContextProps {
  children: React.ReactNode;
  initialUser?: AuthUser | null | undefined;
}

export function MockAuthProvider({ children }: MockAuthContextProps) {
  return (
    <BrowserRouter>
      <div data-testid="mock-auth-provider">
        {children}
      </div>
    </BrowserRouter>
  );
}