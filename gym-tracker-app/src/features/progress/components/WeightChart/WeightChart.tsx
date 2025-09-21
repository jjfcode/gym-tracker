import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card } from '../../../../components/ui';
import { useAppStore } from '../../../../store/appStore';
import { getDisplayWeight, formatWeight, formatDate, calculateMovingAverage } from '../../../../lib/weight-utils';
import type { WeightLog } from '../../../../types/common';
import styles from './WeightChart.module.css';

interface WeightChartProps {
  data: WeightLog[];
  showMovingAverage?: boolean;
  showTrendLine?: boolean;
  height?: number;
  className?: string;
  timeRange?: '1M' | '3M' | '6M' | '1Y' | 'ALL';
}

interface ChartDataPoint {
  date: string;
  weight: number;
  average?: number;
  formattedDate: string;
  originalDate: string;
}

const WeightChart: React.FC<WeightChartProps> = ({
  data,
  showMovingAverage = true,
  showTrendLine = false,
  height = 300,
  className = '',
  timeRange = 'ALL',
}) => {
  const { units } = useAppStore();

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Filter data based on time range
    let filteredData = [...data];
    if (timeRange !== 'ALL') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (timeRange) {
        case '1M':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case '3M':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case '6M':
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
        case '1Y':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filteredData = data.filter(log => new Date(log.measured_at) >= cutoffDate);
    }

    // Sort by date
    const sortedData = filteredData.sort((a, b) => 
      new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
    );

    // Convert weights to display units and calculate moving average
    const movingAverageData = showMovingAverage 
      ? calculateMovingAverage(sortedData, 7) 
      : sortedData.map(log => ({ 
          date: log.measured_at, 
          weight: log.weight, 
          average: log.weight 
        }));

    return movingAverageData.map(item => ({
      date: item.date,
      weight: getDisplayWeight(item.weight, units),
      average: showMovingAverage ? getDisplayWeight(item.average, units) : undefined,
      formattedDate: formatDate(item.date),
      originalDate: item.date,
    }));
  }, [data, units, showMovingAverage, timeRange]);

  const { minWeight, maxWeight, weightRange } = useMemo(() => {
    if (chartData.length === 0) return { minWeight: 0, maxWeight: 100, weightRange: 100 };

    const weights = chartData.map(d => d.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const range = max - min;
    
    // Add padding to the range
    const padding = Math.max(range * 0.1, 5);
    
    return {
      minWeight: Math.max(0, min - padding),
      maxWeight: max + padding,
      weightRange: range,
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipDate}>{data.formattedDate}</p>
          <div className={styles.tooltipContent}>
            <div className={styles.tooltipItem}>
              <span className={styles.tooltipLabel}>Weight:</span>
              <span className={styles.tooltipValue}>
                {formatWeight(data.weight, units)}
              </span>
            </div>
            {showMovingAverage && data.average && (
              <div className={styles.tooltipItem}>
                <span className={styles.tooltipLabel}>7-day avg:</span>
                <span className={styles.tooltipValue}>
                  {formatWeight(data.average, units)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const formatXAxisTick = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatYAxisTick = (value: number) => {
    return `${value.toFixed(0)}${units === 'metric' ? 'kg' : 'lbs'}`;
  };

  if (chartData.length === 0) {
    return (
      <Card className={`${styles.container} ${className}`}>
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>No weight data available</p>
          <p className={styles.emptyDescription}>
            Start logging your weight to see your progress chart.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Weight Progress</h3>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.weightColor}`} />
            <span>Weight</span>
          </div>
          {showMovingAverage && (
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.averageColor}`} />
              <span>7-day average</span>
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.chartContainer} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--color-border)"
              opacity={0.3}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxisTick}
              stroke="var(--color-text-secondary)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[minWeight, maxWeight]}
              tickFormatter={formatYAxisTick}
              stroke="var(--color-text-secondary)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Main weight line */}
            <Line
              type="monotone"
              dataKey="weight"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'var(--color-primary)', strokeWidth: 2 }}
            />
            
            {/* Moving average line */}
            {showMovingAverage && (
              <Line
                type="monotone"
                dataKey="average"
                stroke="var(--color-secondary)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 4, stroke: 'var(--color-secondary)', strokeWidth: 2 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default WeightChart;