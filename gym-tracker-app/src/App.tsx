import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Simple placeholder components
const Dashboard = () => (
  <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
    <h1>Dashboard</h1>
    <p>Dashboard - Coming Soon</p>
    <a href="/">← Back to Home</a>
  </div>
);

const OnboardingPlaceholder = () => (
  <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
    <h1>Onboarding Flow</h1>
    <p>Onboarding - Coming Soon</p>
    <a href="/">← Back to Home</a>
  </div>
);

const Home = () => (
  <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
    <h1>Gym Tracker App</h1>
    <p>Hello World! The app is working.</p>
    <div style={{ marginTop: '2rem' }}>
      <h2>Available Pages:</h2>
      <ul>
        <li><a href="/onboarding">Onboarding Flow</a></li>
        <li><a href="/dashboard">Dashboard</a></li>
      </ul>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<OnboardingPlaceholder />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;