import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  notes?: string;
}

interface WeightChartProps {
  data?: WeightEntry[];
  timeRange: 'week' | 'month' | 'year';
  detailed?: boolean;
}

export const WeightChart: React.FC<WeightChartProps> = ({ 
  data = [], 
  timeRange, 
  detailed = false 
}) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        height: detailed ? 400 : 200, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--color-text-secondary)'
      }}>
        No weight data available
      </div>
    );
  }

  const chartData = data.map(entry => ({
    date: new Date(entry.date).toLocaleDateString(),
    weight: entry.weight,
    fullDate: entry.date
  }));

  return (
    <ResponsiveContainer width="100%" height={detailed ? 400 : 200}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          domain={['dataMin - 2', 'dataMax + 2']}
        />
        <Tooltip 
          labelFormatter={(label) => `Date: ${label}`}
          formatter={(value) => [`${value} kg`, 'Weight']}
        />
        <Line 
          type="monotone" 
          dataKey="weight" 
          stroke="var(--color-primary-500)" 
          strokeWidth={2}
          dot={{ fill: 'var(--color-primary-500)', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};