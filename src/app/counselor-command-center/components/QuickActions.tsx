import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface QuickAction {
  id: number;
  label: string;
  icon: string;
  color: string;
  count?: number;
}

interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick: (id: number) => void;
}

const QuickActions = ({ actions, onActionClick }: QuickActionsProps) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
    violet: 'bg-violet-50 text-violet-600 hover:bg-violet-100',
    amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
    rose: 'bg-rose-50 text-rose-600 hover:bg-rose-100'
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action.id)}
            className={`relative p-4 rounded-lg ${colorClasses[action.color]} transition-all duration-200 hover:shadow-md`}
          >
            {action.count !== undefined && action.count > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                {action.count}
              </span>
            )}
            <div className="flex flex-col items-center space-y-2">
              <Icon name={action.icon as any} size={28} variant="outline" />
              <span className="text-xs font-semibold text-center">{action.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;