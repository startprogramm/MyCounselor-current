import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

const StatCard = ({ title, value, change, trend, icon, color }: StatCardProps) => {
  const trendColors = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-muted-foreground'
  };

  const bgColors: Record<string, string> = {
    blue: 'bg-blue-50',
    emerald: 'bg-emerald-50',
    amber: 'bg-amber-50',
    violet: 'bg-violet-50'
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground mb-2">{value}</p>
          <div className="flex items-center space-x-1">
            <Icon 
              name={trend === 'up' ? 'ArrowTrendingUpIcon' : trend === 'down' ? 'ArrowTrendingDownIcon' : 'MinusIcon'} 
              size={16} 
              variant="solid"
              className={trendColors[trend]}
            />
            <span className={`text-sm font-medium ${trendColors[trend]}`}>{change}</span>
          </div>
        </div>
        <div className={`${bgColors[color]} p-3 rounded-lg`}>
          <Icon name={icon as any} size={24} variant="outline" className={`text-${color}-600`} />
        </div>
      </div>
    </div>
  );
};

interface DashboardStatsProps {
  stats: StatCardProps[];
}

const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;