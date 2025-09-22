import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WorkoutStats {
  totalWorkouts: number;
  averageDuration: number;
  totalVolume: number;
  consistency: number;
  workoutsByDay?: Array<{ date: string; count: number }>;
  volumeByWeek?: Array<{ week: string; volume: number }>;
}

interface WorkoutStatsChartProps {
  data?: WorkoutStats;
  timeRange: 'week' | 'month' | 'year';
  detailed?: boolean;
}

export const WorkoutStatsChart: React.FC<WorkoutStatsChartProps> = ({ 
  data, 
  timeRange, 
  detailed = false 
}) => {
  if (!data) {
    return (
      <div style={{ 
        height: detailed ? 400 : 200, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--color-text-secondary)'
      }}>
        No workout data available
      </div>
    );
  }

  // Use workoutsByDay for chart data, or create sample data
  const chartData = data.workoutsByDay || [
    { date: 'Mon', count: 1 },
    { date: 'Tue', count: 0 },
    { date: 'Wed', count: 1 },
    { date: 'Thu', count: 0 },
    { date: 'Fri', count: 1 },
    { date: 'Sat', count: 0 },
    { date: 'Sun', count: 0 },
  ];

  return (
    <ResponsiveContainer width="100%" height={detailed ? 400 : 200}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value) => [`${value}`, 'Workouts']}
        />
        <Bar 
          dataKey="count" 
          fill="var(--color-primary-500)" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};