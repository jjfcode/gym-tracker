import React, { useState } from 'react';
import { Button } from '../../../../components/ui';
import { useWeightLogs } from '../../hooks/useWeightData';
import WeightLogger from '../WeightLogger/WeightLogger';
import WeightChart from '../WeightChart/WeightChart';
import ProgressStats from '../ProgressStats/ProgressStats';
import styles from './ProgressPage.module.css';

type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

const ProgressPage: React.FC = () => {
  const [showLogger, setShowLogger] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('3M');
  
  const { data: weightLogs = [], isLoading, error } = useWeightLogs();

  const handleLoggerSuccess = () => {
    setShowLogger(false);
  };

  const timeRangeOptions = [
    { value: '1M' as const, label: '1M' },
    { value: '3M' as const, label: '3M' },
    { value: '6M' as const, label: '6M' },
    { value: '1Y' as const, label: '1Y' },
    { value: 'ALL' as const, label: 'All' },
  ];

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <p>Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Failed to load progress data. This might be because Supabase isn't configured yet.</p>
          <p>To use the weight tracking feature, please set up your Supabase environment variables.</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Progress Tracking</h1>
          <p className={styles.subtitle}>
            Monitor your weight and track your fitness journey
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
          <WeightLogger
            onSuccess={handleLoggerSuccess}
            onCancel={() => setShowLogger(false)}
          />
        </div>
      )}

      <div className={styles.content}>
        {/* Statistics Section */}
        <div className={styles.statsSection}>
          <ProgressStats data={weightLogs} />
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
            data={weightLogs}
            timeRange={timeRange}
            showMovingAverage={true}
            height={350}
          />
        </div>

        {/* Recent Entries Section */}
        {weightLogs.length > 0 && (
          <div className={styles.recentSection}>
            <h2 className={styles.recentTitle}>Recent Entries</h2>
            <div className={styles.recentList}>
              {weightLogs.slice(0, 5).map((log) => (
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
        )}

        {/* Empty State */}
        {weightLogs.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📊</div>
            <h2 className={styles.emptyTitle}>Start Tracking Your Progress</h2>
            <p className={styles.emptyDescription}>
              Log your first weight entry to begin tracking your fitness journey.
              You'll be able to see trends, statistics, and visual progress over time.
            </p>
            <Button
              onClick={() => setShowLogger(true)}
              size="lg"
              className={styles.emptyButton}
            >
              Log Your First Weight
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressPage;