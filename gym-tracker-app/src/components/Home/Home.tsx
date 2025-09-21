import React from 'react';
import styles from './Home.module.css';

const Home: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🎯 Gym Tracker App</h1>
      <p className={styles.subtitle}>Welcome to your fitness journey!</p>
      <div className={styles.navigation}>
        <h2>Available Pages:</h2>
        <ul className={styles.navList}>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/progress">Progress Tracking</a></li>
          <li><a href="/exercises">Exercise Library</a></li>
          <li><a href="/onboarding">Onboarding</a></li>
          <li><a href="/settings">Settings</a></li>
          <li><a href="/i18n-demo">🌍 I18n Demo</a></li>
          <li><a href="/pwa-demo">📱 PWA Demo</a></li>
        </ul>
      </div>
    </div>
  );
};

export default Home;