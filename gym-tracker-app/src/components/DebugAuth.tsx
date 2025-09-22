import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const DebugAuth: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testConnection = async () => {
    try {
      setStatus('Testing connection...');
      setError('');
      
      // Test basic connection
      const { data, error: connError } = await supabase
        .from('profile')
        .select('count')
        .limit(1);
      
      if (connError && connError.code !== 'PGRST116') {
        throw connError;
      }
      
      setStatus('✅ Database connection successful');
    } catch (err: any) {
      setError(`❌ Connection failed: ${err.message}`);
      setStatus('');
    }
  };

  const testSignUp = async () => {
    try {
      setStatus('Testing sign up...');
      setError('');
      
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });
      
      if (signUpError) {
        throw signUpError;
      }
      
      setStatus(`✅ Sign up test successful. User: ${data.user?.email}`);
    } catch (err: any) {
      setError(`❌ Sign up failed: ${err.message}`);
      setStatus('');
    }
  };

  const checkEnvVars = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    setStatus(`
      Supabase URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}
      Supabase Key: ${supabaseKey ? '✅ Set' : '❌ Missing'}
    `);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'white', 
      padding: '20px', 
      border: '1px solid #ccc',
      borderRadius: '8px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h3>Auth Debug</h3>
      
      <button onClick={checkEnvVars} style={{ margin: '5px', padding: '5px 10px' }}>
        Check Env Vars
      </button>
      
      <button onClick={testConnection} style={{ margin: '5px', padding: '5px 10px' }}>
        Test Connection
      </button>
      
      <button onClick={testSignUp} style={{ margin: '5px', padding: '5px 10px' }}>
        Test Sign Up
      </button>
      
      {status && (
        <div style={{ marginTop: '10px', whiteSpace: 'pre-line', fontSize: '12px' }}>
          {status}
        </div>
      )}
      
      {error && (
        <div style={{ marginTop: '10px', color: 'red', fontSize: '12px' }}>
          {error}
        </div>
      )}
    </div>
  );
};