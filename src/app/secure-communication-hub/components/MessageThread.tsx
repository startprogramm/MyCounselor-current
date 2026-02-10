import React from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'counselor' | 'parent';
  senderAvatar: string;
  senderAvatarAlt: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    size: string;
    type: string;
  }>;
}

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
}

const MessageThread = ({ messages, currentUserId }: MessageThreadProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((message) => {
        const isCurrentUser = message.senderId === currentUserId;
        
        return (
          <div
            key={message.id}
            className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                <AppImage
                  src={message.senderAvatar}
                  alt={message.senderAvatarAlt}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className={`flex-1 max-w-2xl ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-foreground">
                  {message.senderName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {message.timestamp}
                </span>
                {message.isRead && isCurrentUser && (
                  <Icon name="CheckCircleIcon" size={14} variant="solid" className="text-success" />
                )}
              </div>
              
              <div
                className={`rounded-2xl px-4 py-3 ${
                  isCurrentUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className={`flex items-center gap-2 p-2 rounded-lg ${
                          isCurrentUser ? 'bg-primary/20' : 'bg-background'
                        }`}
                      >
                        <Icon name="PaperClipIcon" size={16} variant="outline" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{attachment.name}</p>
                          <p className="text-xs opacity-70">{attachment.size}</p>
                        </div>
                        <Icon name="ArrowDownTrayIcon" size={16} variant="outline" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageThread;