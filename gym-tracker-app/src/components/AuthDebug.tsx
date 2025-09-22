import React from 'react';
import { useAuth } from '../features/auth/AuthContext';

import { useAuthStore } from '../store/authStore';

export const AuthDebug: React.FC = () => {
  const { user, isLoading, isAuthenticated, error } = useAuth();
  const { setUser, setLoading } = useAuthStore();

  const forceStopLoading = () => {
    console.log('Manually stopping loading...');
    setLoading(false);
  };

  const forceSetUser = () => {
    console.log('Manually setting null user...');
    setUser(null);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'white', 
      border: '1px solid black', 
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '200px'
    }}>
      <h4>Auth Debug</h4>
      <p>Loading: {isLoading ? 'YES' : 'NO'}</p>
      <p>Authenticated: {isAuthenticated ? 'YES' : 'NO'}</p>
      <p>User: {user ? 'EXISTS' : 'NULL'}</p>
      <p>Error: {error || 'NONE'}</p>
      <p>User ID: {user?.id || 'N/A'}</p>
      <p>Email: {user?.email || 'N/A'}</p>
      <button onClick={forceStopLoading} style={{ fontSize: '10px', margin: '2px' }}>
        Stop Loading
      </button>
      <button onClick={forceSetUser} style={{ fontSize: '10px', margin: '2px' }}>
        Set Null User
      </button>
    </div>
  );
};