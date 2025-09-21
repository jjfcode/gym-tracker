import React from 'react';
import styles from './OnboardingPlaceholder.module.css';

const OnboardingPlaceholder: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Onboarding Flow</h1>
      <p className={styles.subtitle}>Onboarding - Coming Soon</p>
      <a href="/" className={styles.backLink}>← Back to Home</a>
    </div>
  );
};

export default OnboardingPlaceholder;