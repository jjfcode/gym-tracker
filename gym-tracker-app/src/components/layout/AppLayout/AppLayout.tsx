import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>Gym Tracker</h1>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <nav>{/* Navigation will be added in later tasks */}</nav>
      </footer>
    </div>
  );
};

export default AppLayout;
