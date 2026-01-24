import React from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface PriorityItem {
  id: number;
  studentName: string;
  studentImage: string;
  studentImageAlt: string;
  issue: string;
  priority: 'urgent' | 'high' | 'medium';
  timestamp: string;
  category: string;
}

interface PriorityQueueProps {
  items: PriorityItem[];
  onItemClick: (id: number) => void;
}

const PriorityQueue = ({ items, onItemClick }: PriorityQueueProps) => {
  const priorityConfig = {
    urgent: { color: 'bg-destructive', textColor: 'text-destructive-foreground', label: 'Urgent' },
    high: { color: 'bg-warning', textColor: 'text-warning-foreground', label: 'High' },
    medium: { color: 'bg-accent', textColor: 'text-accent-foreground', label: 'Medium' }
  };

  const categoryIcons: Record<string, string> = {
    'Academic': 'AcademicCapIcon',
    'Mental Health': 'HeartIcon',
    'Career': 'BriefcaseIcon',
    'College': 'BuildingLibraryIcon',
    'Personal': 'UserIcon'
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Priority Queue</h2>
          <span className="px-3 py-1 bg-destructive/10 text-destructive text-sm font-semibold rounded-full">
            {items.length} Items
          </span>
        </div>
      </div>
      <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className="p-4 hover:bg-muted/50 cursor-pointer transition-colors duration-200"
          >
            <div className="flex items-start space-x-4">
              <div className="relative flex-shrink-0">
                <AppImage
                  src={item.studentImage}
                  alt={item.studentImageAlt}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className={`absolute -top-1 -right-1 w-4 h-4 ${priorityConfig[item.priority].color} rounded-full border-2 border-card`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{item.studentName}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.timestamp}</p>
                  </div>
                  <span className={`px-2 py-1 ${priorityConfig[item.priority].color} ${priorityConfig[item.priority].textColor} text-xs font-semibold rounded`}>
                    {priorityConfig[item.priority].label}
                  </span>
                </div>
                <p className="text-sm text-foreground mb-2 line-clamp-2">{item.issue}</p>
                <div className="flex items-center space-x-2">
                  <Icon name={categoryIcons[item.category] as any} size={16} variant="outline" className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{item.category}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriorityQueue;