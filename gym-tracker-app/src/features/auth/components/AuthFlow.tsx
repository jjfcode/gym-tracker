import React, { useState } from 'react';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { ResetPasswordForm } from './ResetPasswordForm';
import { Button } from '../../../components/ui/Button/Button';
import styles from './AuthFlow.module.css';

type AuthView = 'signin' | 'signup' | 'reset';

const AuthFlow: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>('signin');

  const renderAuthForm = () => {
    switch (currentView) {
      case 'signin':
        return (
          <SignInForm 
            onNavigateToSignUp={() => setCurrentView('signup')}
            onNavigateToReset={() => setCurrentView('reset')}
          />
        );
      case 'signup':
        return (
          <SignUpForm 
            onNavigateToSignIn={() => setCurrentView('signin')}
          />
        );
      case 'reset':
        return (
          <ResetPasswordForm 
            onNavigateToSignIn={() => setCurrentView('signin')}
          />
        );
      default:
        return <SignInForm />;
    }
  };



  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>🎯 Gym Tracker</h1>
          <p className={styles.subtitle}>
            Track your workouts, monitor progress, and achieve your fitness goals
          </p>
        </div>

        <div className={styles.formContainer}>
          {renderAuthForm()}
        </div>

        <div className={styles.features}>
          <h3>Why choose Gym Tracker?</h3>
          <ul>
            <li>📊 Track your workout progress</li>
            <li>📈 Visualize your improvements</li>
            <li>📅 Plan your training schedule</li>
            <li>💪 Comprehensive exercise library</li>
            <li>📱 Works offline on all devices</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;