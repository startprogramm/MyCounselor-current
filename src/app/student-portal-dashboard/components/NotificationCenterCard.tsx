import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Notification {
  id: string;
  type: 'appointment' | 'resource' | 'achievement' | 'message' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationCenterCardProps {
  notifications: Notification[];
  onNotificationClick: (notificationId: string) => void;
  onMarkAllRead: () => void;
}

const NotificationCenterCard = ({ notifications, onNotificationClick, onMarkAllRead }: NotificationCenterCardProps) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'CalendarIcon';
      case 'resource':
        return 'BookOpenIcon';
      case 'achievement':
        return 'TrophyIcon';
      case 'message':
        return 'ChatBubbleLeftRightIcon';
      case 'reminder':
        return 'BellIcon';
      default:
        return 'InformationCircleIcon';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'bg-primary/10 text-primary';
      case 'resource':
        return 'bg-accent/10 text-accent';
      case 'achievement':
        return 'bg-warning/10 text-warning';
      case 'message':
        return 'bg-secondary/10 text-secondary';
      case 'reminder':
        return 'bg-error/10 text-error';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="bg-card rounded-xl p-6 shadow-brand">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-heading font-bold text-foreground">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-error text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-primary text-sm font-medium hover:underline"
          >
            Mark All Read
          </button>
        )}
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="BellIcon" size={48} variant="outline" className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => onNotificationClick(notification.id)}
              className={`w-full flex items-start space-x-3 p-3 rounded-lg transition-colors text-left ${
                notification.isRead ? 'bg-muted/30' : 'bg-muted/70 hover:bg-muted'
              }`}
            >
              <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                <Icon name={getNotificationIcon(notification.type) as any} size={20} variant="outline" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-heading font-semibold text-sm mb-1 ${
                  notification.isRead ? 'text-muted-foreground' : 'text-foreground'
                }`}>
                  {notification.title}
                </div>
                <div className="text-xs text-muted-foreground mb-1 line-clamp-2">
                  {notification.message}
                </div>
                <div className="text-xs text-muted-foreground">{notification.timestamp}</div>
              </div>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenterCard;