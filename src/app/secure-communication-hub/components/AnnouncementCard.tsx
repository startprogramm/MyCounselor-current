import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  priority: 'urgent' | 'high' | 'normal';
  category: string;
  isRead: boolean;
}

interface AnnouncementCardProps {
  announcement: Announcement;
  onMarkAsRead: (id: string) => void;
}

const AnnouncementCard = ({ announcement, onMarkAsRead }: AnnouncementCardProps) => {
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-l-destructive bg-destructive/5';
      case 'high':
        return 'border-l-4 border-l-warning bg-warning/5';
      default:
        return 'border-l-4 border-l-muted';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'ExclamationTriangleIcon';
      case 'high':
        return 'ExclamationCircleIcon';
      default:
        return 'InformationCircleIcon';
    }
  };

  return (
    <div
      className={`p-4 rounded-lg ${getPriorityStyles(announcement.priority)} ${
        !announcement.isRead ? 'bg-primary/5' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon
            name={getPriorityIcon(announcement.priority) as any}
            size={20}
            variant="solid"
            className={
              announcement.priority === 'urgent' ?'text-destructive'
                : announcement.priority === 'high' ?'text-warning' :'text-primary'
            }
          />
          <h3 className="font-semibold text-foreground">{announcement.title}</h3>
        </div>
        {!announcement.isRead && (
          <button
            onClick={() => onMarkAsRead(announcement.id)}
            className="text-xs text-primary hover:underline"
          >
            Mark as read
          </button>
        )}
      </div>

      <p className="text-sm text-foreground mb-3 leading-relaxed">{announcement.content}</p>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Icon name="UserCircleIcon" size={14} variant="outline" />
            {announcement.author}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="ClockIcon" size={14} variant="outline" />
            {announcement.timestamp}
          </span>
        </div>
        <span className="px-2 py-1 bg-muted rounded-full">{announcement.category}</span>
      </div>
    </div>
  );
};

export default AnnouncementCard;