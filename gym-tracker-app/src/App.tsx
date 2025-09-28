import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ui/ThemeProvider';
import { PWAProvider } from './contexts/PWAContext';
import { OfflineIndicator } from './components/ui/OfflineIndicator/OfflineIndicator';
import { InstallPrompt } from './components/ui/InstallPrompt/InstallPrompt';
import { UpdatePrompt } from './components/ui/UpdatePrompt/UpdatePrompt';
import { LoadingSpinner } from './components/ui/LoadingSpinner/LoadingSpinner';
import { AppLayout } from './components/layout/AppLayout/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './features/auth';

// Load profile diagnostics in development
if (import.meta.env.DEV) {
  import('./lib/profileDiagnostics');
}

// Lazy load route components for code splitting
const AuthFlow = lazy(() => import('./features/auth/components/AuthFlow'));
const Dashboard = lazy(() => import('./features/dashboard/components/Dashboard'));
const WorkoutTracker = lazy(() => import('./features/workouts/components/WorkoutTracker'));
const ProgressTracking = lazy(() => import('./features/progress/components/ProgressTracking'));
const WorkoutPlanning = lazy(() => import('./features/planning/components/WorkoutPlanning'));
const ExerciseLibrary = lazy(() => import('./features/exercises/components/ExerciseLibrary'));
const Settings = lazy(() => import('./features/settings/components/Settings'));
const Onboarding = lazy(() => import('./features/auth/components/Onboarding'));

// Create a separate component for routes that uses auth context
const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthFlow />
      } />
      
      <Route path="/onboarding" element={
        isAuthenticated ? <Onboarding /> : <Navigate to="/auth" replace />
      } />

      {/* Protected Routes with Layout */}
      <Route path="/" element={
        isAuthenticated ? <AppLayout /> : <Navigate to="/auth" replace />
      }>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="workouts" element={<WorkoutTracker />} />
        <Route path="progress" element={<ProgressTracking />} />
        <Route path="planning" element={<WorkoutPlanning />} />
        <Route path="exercises" element={<ExerciseLibrary />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Default route */}
      <Route path="/" element={
        <Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />
      } />

      {/* Fallback route */}
      <Route path="*" element={
        <Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />
      } />
    </Routes>
  );
};



function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <PWAProvider>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <AppRoutes />
            </Suspense>
            

            
            {/* PWA Components */}
            <OfflineIndicator />
            <InstallPrompt />
            <UpdatePrompt />
          </ErrorBoundary>
        </PWAProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;