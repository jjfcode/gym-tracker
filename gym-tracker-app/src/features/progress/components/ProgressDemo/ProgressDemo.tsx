import React, { useState } from 'react';
import { Button } from '../../../../components/ui';
import WeightChart from '../WeightChart/WeightChart';
import ProgressStats from '../ProgressStats/ProgressStats';
import WeightLogger from '../WeightLogger/WeightLogger';
import type { WeightLog } from '../../../../types/common';
import styles from '../ProgressPage/ProgressPage.module.css';

// Demo data for development
const generateDemoData = (): WeightLog[] => {
  const data: WeightLog[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90); // 90 days ago

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i * 3); // Every 3 days
    
    // Simulate weight loss trend with some variation
    const baseWeight = 200 - (i * 0.5); // Gradual weight loss
    const variation = (Math.random() - 0.5) * 4; // ±2 lbs variation
    const weight = Math.max(baseWeight + variation, 180);

    data.push({
      id: i + 1,
      user_id: 'demo-user',
      weight: Math.round(weight * 10) / 10,
      measured_at: date.toISOString().split('T')[0],
      note: i % 5 === 0 ? 'Feeling great!' : null,
      created_at: date.toISOString(),
    });
  }

  return data.reverse(); // Most recent first
};

const ProgressDemo: React.FC = () => {
  const [showLogger, setShowLogger] = useState(false);
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('3M');
  const [demoData, setDemoData] = useState<WeightLog[]>(generateDemoData());

  const handleLoggerSuccess = (newLog: WeightLog) => {
    setDemoData(prev => [newLog, ...prev.filter(log => log.measured_at !== newLog.measured_at)]);
    setShowLogger(false);
  };

  const timeRangeOptions = [
    { value: '1M' as const, label: '1M' },
    { value: '3M' as const, label: '3M' },
    { value: '6M' as const, label: '6M' },
    { value: '1Y' as const, label: '1Y' },
    { value: 'ALL' as const, label: 'All' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Progress Tracking (Demo)</h1>
          <p className={styles.subtitle}>
            Monitor your weight and track your fitness journey - Demo with sample data
          </p>
        </div>
        
        <Button
          onClick={() => setShowLogger(true)}
          className={styles.logButton}
        >
          Log Weight
        </Button>
      </div>

      {showLogger && (
        <div className={styles.loggerSection}>
          <div style={{ 
            padding: '1rem', 
            background: 'var(--color-warning-50)', 
            border: '1px solid var(--color-warning-500)',
            borderRadius: 'var(--border-radius-md)',
            marginBottom: '1rem',
            color: 'var(--color-warning-600)'
          }}>
            <strong>Demo Mode:</strong> Weight logging is simulated. Set up Supabase to enable real data storage.
          </div>
          <WeightLogger
            onSuccess={handleLoggerSuccess}
            onCancel={() => setShowLogger(false)}
          />
        </div>
      )}

      <div className={styles.content}>
        {/* Statistics Section */}
        <div className={styles.statsSection}>
          <ProgressStats data={demoData} />
        </div>

        {/* Chart Section */}
        <div className={styles.chartSection}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Weight Trend</h2>
            <div className={styles.timeRangeSelector}>
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  className={`${styles.timeRangeButton} ${
                    timeRange === option.value ? styles.active : ''
                  }`}
                  onClick={() => setTimeRange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <WeightChart
            data={demoData}
            timeRange={timeRange}
            showMovingAverage={true}
            height={350}
          />
        </div>

        {/* Recent Entries Section */}
        <div className={styles.recentSection}>
          <h2 className={styles.recentTitle}>Recent Entries</h2>
          <div className={styles.recentList}>
            {demoData.slice(0, 5).map((log) => (
              <div key={log.id} className={styles.recentItem}>
                <div className={styles.recentDate}>
                  {new Date(log.measured_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                <div className={styles.recentWeight}>
                  {log.weight.toFixed(1)} lbs
                </div>
                {log.note && (
                  <div className={styles.recentNote}>{log.note}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressDemo;