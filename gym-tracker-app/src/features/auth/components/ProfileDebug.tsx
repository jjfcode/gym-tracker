import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button/Button';
import { useAuth } from '../useAuth';
import { ProfileDiagnostics } from '../../../lib/profileDiagnostics';
import styles from './ProfileDebug.module.css';

interface ProfileDebugProps {
  className?: string;
}

export const ProfileDebug: React.FC<ProfileDebugProps> = ({ className }) => {
  const { user, refreshProfile } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const runDiagnostics = async () => {
    if (!user?.id) {
      setLastResult('❌ No user authenticated');
      return;
    }

    setIsRunning(true);
    setLastResult(null);

    try {
      const isComplete = await ProfileDiagnostics.runFullDiagnostic(user.id);
      
      if (isComplete) {
        setLastResult('✅ Profile is complete');
        await refreshProfile(); // Refresh the auth context
      } else {
        setLastResult('⚠️ Profile needs attention - check console for details');
      }
    } catch (error) {
      console.error('Profile diagnostics failed:', error);
      setLastResult('❌ Diagnostics failed - check console');
    } finally {
      setIsRunning(false);
    }
  };

  const forceRefresh = async () => {
    setIsRunning(true);
    try {
      await refreshProfile();
      setLastResult('🔄 Profile refreshed from database');
    } catch (error) {
      console.error('Profile refresh failed:', error);
      setLastResult('❌ Profile refresh failed');
    } finally {
      setIsRunning(false);
    }
  };

  // Only show in development or for incomplete profiles
  const shouldShow = import.meta.env.DEV || 
    (!user?.profile?.display_name || user?.profile?.display_name.trim() === '');

  if (!shouldShow) {
    return null;
  }

  return (
    <div className={`${styles['container']} ${className || ''}`}>
      <div className={styles['header']}>
        <h4>Profile Debug Tools</h4>
        <p>Tools to diagnose and fix profile completion issues</p>
      </div>

      <div className={styles['actions']}>
        <Button
          variant="outline"
          size="sm"
          onClick={runDiagnostics}
          loading={isRunning}
        >
          Run Profile Diagnostics
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={forceRefresh}
          loading={isRunning}
        >
          Force Profile Refresh
        </Button>
      </div>

      {lastResult && (
        <div className={styles['result']}>
          <pre>{lastResult}</pre>
        </div>
      )}

      {import.meta.env.DEV && (
        <div className={styles['devInfo']}>
          <small>
            💡 Dev mode: Open browser console and run <code>diagnoseProfile()</code> for detailed diagnostics
          </small>
        </div>
      )}
    </div>
  );
};