import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
}

interface QuickActionsCardProps {
  actions: QuickAction[];
  onActionClick: (actionId: string) => void;
}

const QuickActionsCard = ({ actions, onActionClick }: QuickActionsCardProps) => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-brand">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-bold text-foreground">Quick Actions</h2>
        <Icon name="BoltIcon" size={20} variant="solid" className="text-warning" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action.id)}
            className={`${action.color} rounded-lg p-4 text-left hover:opacity-90 transition-opacity duration-300`}
          >
            <Icon name={action.icon as any} size={24} variant="outline" className="mb-2" />
            <div className="font-heading font-semibold text-sm mb-1">{action.label}</div>
            <div className="text-xs opacity-80">{action.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsCard;