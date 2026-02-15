import React from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface Conversation {
  id: string;
  participantName: string;
  participantRole: 'student' | 'counselor' | 'parent';
  participantAvatar: string;
  participantAvatarAlt: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  priority: 'urgent' | 'high' | 'normal';
  isOnline: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

const priorityStyles: Record<Conversation['priority'], string> = {
  urgent: 'border-l-destructive',
  high: 'border-l-warning',
  normal: 'border-l-transparent',
};

const ConversationList = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) => {
  return (
    <div className="overflow-y-auto max-h-[520px]">
      {conversations.map((conversation) => {
        const isActive = selectedConversationId === conversation.id;

        return (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onSelectConversation(conversation.id)}
            className={`w-full p-4 text-left border-b border-border transition-colors border-l-2 ${priorityStyles[conversation.priority]} ${
              isActive ? 'bg-primary/10' : 'hover:bg-muted/40'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                  <AppImage
                    src={conversation.participantAvatar}
                    alt={conversation.participantAvatarAlt}
                    className="w-full h-full object-cover"
                  />
                </div>
                {conversation.isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border border-card" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-medium text-foreground truncate">{conversation.participantName}</p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {conversation.lastMessageTime}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground capitalize mb-1 flex items-center gap-1">
                  <Icon name="UserIcon" size={12} variant="outline" />
                  {conversation.participantRole}
                </p>

                <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
              </div>

              {conversation.unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-destructive text-destructive-foreground">
                  {conversation.unreadCount}
                </span>
              )}
            </div>
          </button>
        );
      })}

      {conversations.length === 0 && (
        <div className="p-6 text-center text-sm text-muted-foreground">No conversations found.</div>
      )}
    </div>
  );
};

export default ConversationList;
