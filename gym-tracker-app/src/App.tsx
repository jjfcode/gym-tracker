import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ui/ThemeProvider';
import { PWAProvider } from './contexts/PWAContext';
import { OfflineIndicator } from './components/ui/OfflineIndicator/OfflineIndicator';
import { InstallPrompt } from './components/ui/InstallPrompt/InstallPrompt';
import { UpdatePrompt } from './components/ui/UpdatePrompt/UpdatePrompt';

// Simple placeholder components for now
const Home = () => (
  <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
    <h1>🎯 Gym Tracker App</h1>
    <p>Welcome to your fitness journey!</p>
    <div style={{ marginTop: '2rem' }}>
      <h2>Available Pages:</h2>
      <ul>
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/progress">Progress Tracking</a></li>
        <li><a href="/exercises">Exercise Library</a></li>
        <li><a href="/onboarding">Onboarding</a></li>
        <li><a href="/settings">Settings</a></li>
        <li><a href="/i18n-demo">🌍 I18n Demo</a></li>
        <li><a href="/pwa-demo">📱 PWA Demo</a></li>
      </ul>
    </div>
  </div>
);

const OnboardingPlaceholder = () => (
  <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
    <h1>Onboarding Flow</h1>
    <p>Onboarding - Coming Soon</p>
    <a href="/">← Back to Home</a>
  </div>
);

import Dashboard from './features/dashboard/components/Dashboard';
import { ProgressPage } from './features/progress';
import ProgressDemo from './features/progress/components/ProgressDemo';
import { PlanningView } from './features/planning';
import ExerciseLibraryDemo from './features/exercises/components/ExerciseLibraryDemo';
import { Settings } from './features/settings';
import ErrorBoundary from './components/ErrorBoundary';
import { I18nDemo } from './components/I18nDemo';
import { PWADemo } from './components/PWADemo';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <PWAProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/onboarding" element={<OnboardingPlaceholder />} />
            <Route path="/dashboard" element={<Dashboard />} />
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