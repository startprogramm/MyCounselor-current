import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartData {
  name: string;
  appointments: number;
  messages: number;
  resources: number;
}

interface AnalyticsChartProps {
  data: ChartData[];
}

const AnalyticsChart = ({ data }: AnalyticsChartProps) => {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <h2 className="text-xl font-bold text-foreground mb-6">Weekly Activity Overview</h2>
      <div className="w-full h-80" aria-label="Weekly Activity Bar Chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="appointments" fill="#2563eb" name="Appointments" radius={[8, 8, 0, 0]} />
            <Bar dataKey="messages" fill="#7c3aed" name="Messages" radius={[8, 8, 0, 0]} />
            <Bar dataKey="resources" fill="#059669" name="Resources Shared" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsChart;