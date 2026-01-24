import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface ResourceStatsProps {
  stats: {
    totalResources: number;
    totalDownloads: number;
    averageRating: number;
    newThisWeek: number;
  };
}

const ResourceStats = ({ stats }: ResourceStatsProps) => {
  const statItems = [
    {
      icon: 'FolderIcon',
      label: 'Total Resources',
      value: stats.totalResources.toLocaleString(),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: 'ArrowDownTrayIcon',
      label: 'Total Downloads',
      value: stats.totalDownloads.toLocaleString(),
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: 'StarIcon',
      label: 'Average Rating',
      value: stats.averageRating.toFixed(1),
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      icon: 'SparklesIcon',
      label: 'New This Week',
      value: stats.newThisWeek.toString(),
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems.map((stat) => (
        <div key={stat.label} className="bg-card rounded-xl shadow-md p-5 hover:shadow-brand transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 ${stat.bgColor} rounded-lg`}>
              <Icon name={stat.icon as any} size={20} variant="solid" className={stat.color} />
            </div>
          </div>
          <p className="text-2xl font-heading font-bold text-foreground mb-1">{stat.value}</p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default ResourceStats;