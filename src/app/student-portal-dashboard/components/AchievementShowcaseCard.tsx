import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate: string;
  category: string;
}

interface AchievementShowcaseCardProps {
  achievements: Achievement[];
  totalPoints: number;
  onViewAll: () => void;
}

const AchievementShowcaseCard = ({ achievements, totalPoints, onViewAll }: AchievementShowcaseCardProps) => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-brand">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-bold text-foreground">Recent Achievements</h2>
        <button
          onClick={onViewAll}
          className="text-primary text-sm font-medium hover:underline"
        >
          View All
        </button>
      </div>
      <div className="bg-gradient-to-r from-warning/20 to-warning/10 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Total Achievement Points</div>
            <div className="text-3xl font-heading font-bold text-foreground">{totalPoints}</div>
          </div>
          <Icon name="TrophyIcon" size={48} variant="solid" className="text-warning" />
        </div>
      </div>
      <div className="space-y-3">
        {achievements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="StarIcon" size={48} variant="outline" className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No achievements yet</p>
          </div>
        ) : (
          achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50"
            >
              <div className="bg-warning/20 p-2 rounded-lg">
                <Icon name={achievement.icon as any} size={24} variant="solid" className="text-warning" />
              </div>
              <div className="flex-1">
                <div className="font-heading font-semibold text-sm text-foreground mb-1">
                  {achievement.title}
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {achievement.description}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">
                    {achievement.category}
                  </span>
                  <span>Earned: {achievement.earnedDate}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AchievementShowcaseCard;