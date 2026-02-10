import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Goal {
  id: string;
  title: string;
  category: string;
  progress: number;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

interface GoalProgressCardProps {
  goals: Goal[];
  onViewAll: () => void;
}

const GoalProgressCard = ({ goals, onViewAll }: GoalProgressCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-error';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-brand">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-bold text-foreground">Goal Progress</h2>
        <button
          onClick={onViewAll}
          className="text-primary text-sm font-medium hover:underline"
        >
          View All
        </button>
      </div>
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="FlagIcon" size={48} variant="outline" className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active goals</p>
          </div>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-heading font-semibold text-sm text-foreground">
                      {goal.title}
                    </h3>
                    <Icon
                      name="FlagIcon"
                      size={14}
                      variant="solid"
                      className={getPriorityColor(goal.priority)}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {goal.category} • Due: {goal.dueDate}
                  </div>
                </div>
                <div className="text-sm font-bold text-primary">{goal.progress}%</div>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GoalProgressCard;