import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const SupabaseTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Not tested');

  const testConnection = async () => {
    try {
      setStatus('Testing...');
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setStatus(`Error: ${error.message}`);
      } else {
        setStatus(`Success: ${data.session ? 'Has session' : 'No session'}`);
      }
    } catch (error) {
      setStatus(`Connection failed: ${error}`);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 10, 
      right: 10, 
      background: 'lightblue', 
      border: '1px solid blue', 
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <h4>Supabase Test</h4>
      <p>Status: {status}</p>
      <button onClick={testConnection}>Test Connection</button>
    </div>
  );
};