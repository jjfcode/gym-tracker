import React from 'react';
import { AppLayout } from '../../../components/layout';
import { Card } from '../../../components/ui';
import styles from './Dashboard.module.css';

// Simple components without React Query for now
const QuickStats: React.FC = () => {
  return (
    <div className={styles.quickStats}>
      <h2 className={styles.title}>This Week</h2>
      
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statValue}>0</div>
          <div className={styles.statLabel}>Workouts Completed</div>
        </Card>
        
        <Card className={styles.statCard}>
          <div className={styles.statValue}>0%</div>
          <div className={styles.statLabel}>Weekly Goal</div>
        </Card>
        
        <Card className={styles.statCard}>
          <div className={styles.statValue}>○</div>
          <div className={styles.statLabel}>Today's Workout</div>
        </Card>
        
        <Card className={styles.statCard}>
          <div className={styles.statValue}>0</div>
          <div className={styles.statLabel}>Total Volume (lbs)</div>
        </Card>
      </div>
    </div>
  );
};

const TodayWorkout: React.FC = () => {
  return (
    <Card className={styles.todayWorkout}>
      <div className={styles.restDay}>
        <h3>Rest Day</h3>
        <p>No workout scheduled for today. Take some time to recover!</p>
      </div>
    </Card>
  );
};

const QuickActions: React.FC = () => {
  return (
    <div className={styles.quickActions}>
      <h2 className={styles.title}>Quick Actions</h2>
      
      <div className={styles.actionsGrid}>
        <Card className={styles.actionCard} hoverable>
          <button style={{ width: '100%', padding: '0.75rem', border: 'none', borderRadius: '6px', backgroundColor: '#f3f4f6', cursor: 'pointer' }}>
            Log Weight
          </button>
        </Card>
        
        <Card className={styles.actionCard} hoverable>
          <button style={{ width: '100%', padding: '0.75rem', border: 'none', borderRadius: '6px', backgroundColor: '#f3f4f6', cursor: 'pointer' }}>
            View Calendar
          </button>
        </Card>
        
        <Card className={styles.actionCard} hoverable>
          <button style={{ width: '100%', padding: '0.75rem', border: 'none', borderRadius: '6px', backgroundColor: '#f3f4f6', cursor: 'pointer' }}>
            View Progress
          </button>
        </Card>
        
        <Card className={styles.actionCard} hoverable>
          <button style={{ width: '100%', padding: '0.75rem', border: 'none', borderRadius: '6px', backgroundColor: '#f3f4f6', cursor: 'pointer' }}>
            Settings
          </button>
        </Card>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <AppLayout title="Dashboard">
      <div className={styles.dashboard}>
        <div className={styles.quickStats}>
          <QuickStats />
        </div>
        
        <div className={styles.todaySection}>
          <TodayWorkout />
        </div>
        
        <div className={styles.quickActions}>
          <QuickActions />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;