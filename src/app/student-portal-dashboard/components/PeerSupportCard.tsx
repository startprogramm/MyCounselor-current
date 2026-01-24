import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Discussion {
  id: string;
  title: string;
  category: string;
  replies: number;
  lastActivity: string;
  isActive: boolean;
}

interface PeerSupportCardProps {
  discussions: Discussion[];
  onDiscussionClick: (discussionId: string) => void;
  onViewAll: () => void;
}

const PeerSupportCard = ({ discussions, onDiscussionClick, onViewAll }: PeerSupportCardProps) => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-brand">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-heading font-bold text-foreground">Peer Support Community</h2>
          <span className="bg-success/10 text-success text-xs font-bold px-2 py-0.5 rounded-full">
            Moderated
          </span>
        </div>
        <button
          onClick={onViewAll}
          className="text-primary text-sm font-medium hover:underline"
        >
          View All
        </button>
      </div>
      <div className="space-y-2">
        {discussions.map((discussion) => (
          <button
            key={discussion.id}
            onClick={() => onDiscussionClick(discussion.id)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-heading font-semibold text-sm text-foreground truncate">
                  {discussion.title}
                </h3>
                {discussion.isActive && (
                  <span className="w-2 h-2 bg-success rounded-full flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">
                  {discussion.category}
                </span>
                <span className="flex items-center space-x-1">
                  <Icon name="ChatBubbleLeftIcon" size={12} variant="outline" />
                  <span>{discussion.replies} replies</span>
                </span>
                <span>{discussion.lastActivity}</span>
              </div>
            </div>
            <Icon name="ChevronRightIcon" size={20} variant="outline" className="text-muted-foreground flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default PeerSupportCard;