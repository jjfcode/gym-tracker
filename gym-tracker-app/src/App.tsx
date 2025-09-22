import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ui/ThemeProvider';
import { PWAProvider } from './contexts/PWAContext';
import { OfflineIndicator } from './components/ui/OfflineIndicator/OfflineIndicator';
import { InstallPrompt } from './components/ui/InstallPrompt/InstallPrompt';
import { UpdatePrompt } from './components/ui/UpdatePrompt/UpdatePrompt';
import { LoadingSpinner } from './components/ui/LoadingSpinner/LoadingSpinner';
import { useAuth } from './features/auth/AuthContext';
import { AppLayout } from './components/layout/AppLayout/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load route components for code splitting
const AuthFlow = lazy(() => import('./features/auth/components/AuthFlow'));
const Dashboard = lazy(() => import('./features/dashboard/components/Dashboard'));
const WorkoutTracker = lazy(() => import('./features/workouts/components/WorkoutTracker'));
const ProgressTracking = lazy(() => import('./features/progress/components/ProgressTracking'));
const WorkoutPlanning = lazy(() => import('./features/planning/components/WorkoutPlanning'));
const ExerciseLibrary = lazy(() => import('./features/exercises/components/ExerciseLibrary'));
const Settings = lazy(() => import('./features/settings').then(module => ({ default: module.Settings })));
const Onboarding = lazy(() => import('./features/auth/components/Onboarding'));

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <PWAProvider>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/auth" element={
                  <PublicRoute>
                    <AuthFlow />
                  </PublicRoute>
                } />
                
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } />

                {/* Protected Routes with Layout */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="workouts" element={<WorkoutTracker />} />
                  <Route path="progress" element={<ProgressTracking />} />
                  <Route path="planning" element={<WorkoutPlanning />} />
                  <Route path="exercises" element={<ExerciseLibrary />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
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