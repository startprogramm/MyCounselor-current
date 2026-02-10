import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Activity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity = ({ activities }: RecentActivityProps) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    violet: 'bg-violet-100 text-violet-600',
    amber: 'bg-amber-100 text-amber-600'
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
      </div>
      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity.id} className="p-4 hover:bg-muted/50 transition-colors duration-200">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${colorClasses[activity.color]} flex-shrink-0`}>
                <Icon name={activity.icon as any} size={20} variant="outline" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;