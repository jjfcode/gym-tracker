import React from 'react';
import { Card } from '../../../../components/ui';
import { useAppStore } from '../../../../store/appStore';
import { 
  getWeightStats, 
  calculateWeightTrend, 
  getDisplayWeight, 
  formatWeight 
} from '../../../../lib/weight-utils';
import type { WeightLog } from '../../../../types/common';
import styles from './ProgressStats.module.css';

interface ProgressStatsProps {
  data: WeightLog[];
  className?: string;
}

const ProgressStats: React.FC<ProgressStatsProps> = ({ data, className = '' }) => {
  const { units } = useAppStore();

  const stats = getWeightStats(data);
  const trend = calculateWeightTrend(data);

  const displayStats = {
    current: stats.current ? getDisplayWeight(stats.current, units) : null,
    highest: stats.highest ? getDisplayWeight(stats.highest, units) : null,
    lowest: stats.lowest ? getDisplayWeight(stats.lowest, units) : null,
    average: stats.average ? getDisplayWeight(stats.average, units) : null,
  };

  const trendIcon = {
    increasing: '📈',
    decreasing: '📉',
    stable: '➡️',
  };

  const trendColor = {
    increasing: styles.trendIncreasing,
    decreasing: styles.trendDecreasing,
    stable: styles.trendStable,
  };

  const trendText = {
    increasing: 'Increasing',
    decreasing: 'Decreasing',
    stable: 'Stable',
  };

  if (stats.totalEntries === 0) {
    return (
      <Card className={`${styles.container} ${className}`}>
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>No weight data yet</p>
          <p className={styles.emptyDescription}>
            Start logging your weight to see your progress statistics.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Progress Statistics</h3>
        <div className={styles.entriesCount}>
          {stats.totalEntries} {stats.totalEntries === 1 ? 'entry' : 'entries'}
        </div>
      </div>

      <div className={styles.statsGrid}>
        {/* Current Weight */}
        <div className={styles.statItem}>
          <div className={styles.statLabel}>Current</div>
          <div className={styles.statValue}>
            {displayStats.current ? formatWeight(displayStats.current, units) : 'N/A'}
          </div>
        </div>

        {/* Highest Weight */}
        <div className={styles.statItem}>
          <div className={styles.statLabel}>Highest</div>
          <div className={styles.statValue}>
            {displayStats.highest ? formatWeight(displayStats.highest, units) : 'N/A'}
          </div>
        </div>

        {/* Lowest Weight */}
        <div className={styles.statItem}>
          <div className={styles.statLabel}>Lowest</div>
          <div className={styles.statValue}>
            {displayStats.lowest ? formatWeight(displayStats.lowest, units) : 'N/A'}
          </div>
        </div>

        {/* Average Weight */}
        <div className={styles.statItem}>
          <div className={styles.statLabel}>Average</div>
          <div className={styles.statValue}>
            {displayStats.average ? formatWeight(displayStats.average, units) : 'N/A'}
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      {stats.totalEntries >= 2 && (
        <div className={styles.trendSection}>
          <div className={styles.trendHeader}>
            <span className={styles.trendIcon}>{trendIcon[trend.trend]}</span>
            <span className={`${styles.trendLabel} ${trendColor[trend.trend]}`}>
              {trendText[trend.trend]}
            </span>
          </div>
          
          {trend.trend !== 'stable' && (
            <div className={styles.trendDetails}>
              <div className={styles.trendItem}>
                <span className={styles.trendDetailLabel}>Change:</span>
                <span className={styles.trendDetailValue}>
                  {formatWeight(getDisplayWeight(trend.changeAmount, units), units)}
                </span>
              </div>
              <div className={styles.trendItem}>
                <span className={styles.trendDetailLabel}>Percentage:</span>
                <span className={styles.trendDetailValue}>
                  {trend.changePercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default ProgressStats;