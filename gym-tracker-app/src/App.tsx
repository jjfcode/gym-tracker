import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ui/ThemeProvider';

// Simple placeholder components for now
const Home = () => (
  <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
    <h1>🎯 Gym Tracker App</h1>
    <p>Welcome to your fitness journey!</p>
    <div style={{ marginTop: '2rem' }}>
      <h2>Available Pages:</h2>
      <ul>
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/onboarding">Onboarding</a></li>
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

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<OnboardingPlaceholder />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;