import React from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface RecommendedResource {
  id: string;
  title: string;
  category: string;
  image: string;
  alt: string;
  reason: string;
}

interface RecommendedResourcesProps {
  resources: RecommendedResource[];
}

const RecommendedResources = ({ resources }: RecommendedResourcesProps) => {
  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon name="SparklesIcon" size={24} variant="solid" className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">Recommended For You</h2>
          <p className="text-sm text-muted-foreground">Based on your profile and recent activity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="bg-card rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex gap-3">
              <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                <AppImage
                  src={resource.image}
                  alt={resource.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                  {resource.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">{resource.category}</p>
                <div className="flex items-start gap-1">
                  <Icon name="LightBulbIcon" size={12} variant="solid" className="text-warning mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground line-clamp-2">{resource.reason}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedResources;