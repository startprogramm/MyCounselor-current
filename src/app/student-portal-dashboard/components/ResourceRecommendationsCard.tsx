import React from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface Resource {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  thumbnailAlt: string;
  description: string;
  readTime: string;
  rating: number;
}

interface ResourceRecommendationsCardProps {
  resources: Resource[];
  onResourceClick: (resourceId: string) => void;
  onViewAll: () => void;
}

const ResourceRecommendationsCard = ({ resources, onResourceClick, onViewAll }: ResourceRecommendationsCardProps) => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-brand">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-bold text-foreground">Recommended Resources</h2>
        <button
          onClick={onViewAll}
          className="text-primary text-sm font-medium hover:underline"
        >
          View All
        </button>
      </div>
      <div className="space-y-3">
        {resources.map((resource) => (
          <button
            key={resource.id}
            onClick={() => onResourceClick(resource.id)}
            className="w-full flex items-start space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
          >
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <AppImage
                src={resource.thumbnail}
                alt={resource.thumbnailAlt}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-heading font-semibold text-sm text-foreground mb-1">
                {resource.title}
              </div>
              <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {resource.description}
              </div>
              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                <span className="flex items-center space-x-1">
                  <Icon name="BookOpenIcon" size={12} variant="outline" />
                  <span>{resource.readTime}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Icon name="StarIcon" size={12} variant="solid" className="text-warning" />
                  <span>{resource.rating}</span>
                </span>
                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">
                  {resource.category}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ResourceRecommendationsCard;