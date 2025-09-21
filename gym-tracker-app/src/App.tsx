import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ui/ThemeProvider';
import { PWAProvider } from './contexts/PWAContext';
import { OfflineIndicator } from './components/ui/OfflineIndicator/OfflineIndicator';
import { InstallPrompt } from './components/ui/InstallPrompt/InstallPrompt';
import { UpdatePrompt } from './components/ui/UpdatePrompt/UpdatePrompt';
import { LoadingSpinner } from './components/ui/LoadingSpinner/LoadingSpinner';

// Lazy load route components for code splitting
const Home = lazy(() => import('./components/Home/Home'));
const Dashboard = lazy(() => import('./features/dashboard/components/Dashboard'));
const ProgressDemo = lazy(() => import('./features/progress/components/ProgressDemo'));
const PlanningView = lazy(() => import('./features/planning').then(module => ({ default: module.PlanningView })));
const ExerciseLibraryDemo = lazy(() => import('./features/exercises/components/ExerciseLibraryDemo'));
const Settings = lazy(() => import('./features/settings').then(module => ({ default: module.Settings })));
const OnboardingPlaceholder = lazy(() => import('./components/OnboardingPlaceholder/OnboardingPlaceholder'));
const I18nDemo = lazy(() => import('./components/I18nDemo').then(module => ({ default: module.I18nDemo })));
const PWADemo = lazy(() => import('./components/PWADemo').then(module => ({ default: module.PWADemo })));

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <PWAProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/onboarding" element={
                <ErrorBoundary>
                  <OnboardingPlaceholder />
                </ErrorBoundary>
              } />
              <Route path="/dashboard" element={
                <ErrorBoundary>
                  <Dashboard />
                </ErrorBoundary>
              } />
              <Route path="/progress" element={
                <ErrorBoundary>
                  <ProgressDemo />
                </ErrorBoundary>
              } />
              <Route path="/planning" element={
                <ErrorBoundary>
                  <PlanningView />
                </ErrorBoundary>
              } />
              <Route path="/exercises" element={
                <ErrorBoundary>
                  <ExerciseLibraryDemo />
                </ErrorBoundary>
              } />
              <Route path="/settings" element={
                <ErrorBoundary>
                  <Settings />
                </ErrorBoundary>
              } />
              <Route path="/i18n-demo" element={
                <ErrorBoundary>
                  <I18nDemo />
                </ErrorBoundary>
              } />
              <Route path="/pwa-demo" element={
                <ErrorBoundary>
                  <PWADemo />
                </ErrorBoundary>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          
          {/* PWA Components */}
          <OfflineIndicator />
          <InstallPrompt />
          <UpdatePrompt />
        </PWAProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;