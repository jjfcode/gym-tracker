import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './features/auth';
import { performanceMonitor } from './lib/performance-monitor';
import { SecurityService } from './lib/security';
import { initializePerformanceMonitoring } from './lib/performance';
import './lib/i18n'; // Initialize i18n
import './styles/globals.css';
import App from './App.tsx';

// Service worker is handled by Vite PWA plugin

// Create a client with optimized caching strategies
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Initialize services in development mode only to reduce console noise
if (import.meta.env.DEV) {
  // Initialize security service
  SecurityService.initialize().catch(error => {
    console.error('Failed to initialize security service:', error);
  });

  // Initialize performance monitoring
  initializePerformanceMonitoring();
} else {
  // Production initialization
  SecurityService.initialize();
  initializePerformanceMonitoring();
  
  // Log performance report after app loads
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.logPerformanceReport();
    }, 2000);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
