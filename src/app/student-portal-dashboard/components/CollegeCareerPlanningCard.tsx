import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface PlanningTask {
  id: string;
  title: string;
  category: 'college' | 'career';
  deadline: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface CollegeCareerPlanningCardProps {
  tasks: PlanningTask[];
  onTaskClick: (taskId: string) => void;
  onViewAll: () => void;
}

const CollegeCareerPlanningCard = ({ tasks, onTaskClick, onViewAll }: CollegeCareerPlanningCardProps) => {
  const completedCount = tasks.filter(t => t.completed).length;
  const completionPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="bg-card rounded-xl p-6 shadow-brand">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-bold text-foreground">College & Career Planning</h2>
        <button
          onClick={onViewAll}
          className="text-primary text-sm font-medium hover:underline"
        >
          View All
        </button>
      </div>
      <div className="bg-accent/10 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Overall Progress</span>
          <span className="text-sm font-bold text-accent">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-accent h-full rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => onTaskClick(task.id)}
            className={`w-full flex items-start space-x-3 p-3 rounded-lg transition-colors text-left ${
              task.completed ? 'bg-muted/30' : 'bg-muted/50 hover:bg-muted'
            }`}
          >
            <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
              task.completed ? 'bg-accent border-accent' : 'border-border'
            }`}>
              {task.completed && (
                <Icon name="CheckIcon" size={14} variant="outline" className="text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-heading font-semibold text-sm mb-1 ${
                task.completed ? 'text-muted-foreground line-through' : 'text-foreground'
              }`}>
                {task.title}
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span className={`px-2 py-0.5 rounded ${
                  task.category === 'college' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                }`}>
                  {task.category === 'college' ? 'College' : 'Career'}
                </span>
                <span className="flex items-center space-x-1">
                  <Icon name="CalendarIcon" size={12} variant="outline" />
                  <span>{task.deadline}</span>
                </span>
                {task.priority === 'high' && !task.completed && (
                  <span className="flex items-center space-x-1 text-error">
                    <Icon name="ExclamationCircleIcon" size={12} variant="solid" />
                    <span>High Priority</span>
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CollegeCareerPlanningCard;