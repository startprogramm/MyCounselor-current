'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface ResourceCardProps {
  resource: {
    id: string;
    title: string;
    description: string;
    category: string;
    format: string;
    image: string;
    alt: string;
    rating: number;
    reviews: number;
    downloads: number;
    gradeLevel: string[];
    urgency: string;
    tags: string[];
  };
  onBookmark: (id: string) => void;
  onView: (id: string) => void;
  isBookmarked: boolean;
}

const ResourceCard = ({ resource, onBookmark, onView, isBookmarked }: ResourceCardProps) => {
  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'video':
        return 'VideoCameraIcon';
      case 'pdf':
        return 'DocumentTextIcon';
      case 'interactive':
        return 'CursorArrowRaysIcon';
      case 'article':
        return 'NewspaperIcon';
      default:
        return 'DocumentIcon';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'crisis':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-warning text-warning-foreground';
      case 'medium':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-md hover:shadow-brand transition-all duration-300 overflow-hidden group">
      <div className="relative h-48 overflow-hidden">
        <AppImage
          src={resource.image}
          alt={resource.alt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(resource.urgency)}`}>
            {resource.urgency}
          </span>
        </div>
        <button
          onClick={() => onBookmark(resource.id)}
          className="absolute top-3 left-3 p-2 bg-card/90 backdrop-blur-sm rounded-full hover:bg-card transition-colors"
          aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <Icon
            name="BookmarkIcon"
            size={20}
            variant={isBookmarked ? 'solid' : 'outline'}
            className={isBookmarked ? 'text-primary' : 'text-foreground'}
          />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
            {resource.category}
          </span>
          <div className="flex items-center gap-1">
            <Icon name={getFormatIcon(resource.format) as any} size={16} variant="outline" className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{resource.format}</span>
          </div>
        </div>

        <h3 className="text-lg font-heading font-bold text-foreground mb-2 line-clamp-2">
          {resource.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {resource.description}
        </p>

        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <Icon name="StarIcon" size={16} variant="solid" className="text-warning" />
            <span className="font-semibold text-foreground">{resource.rating}</span>
            <span className="text-muted-foreground">({resource.reviews})</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Icon name="ArrowDownTrayIcon" size={16} variant="outline" />
            <span>{resource.downloads}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {resource.gradeLevel.map((grade) => (
            <span key={grade} className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
              {grade}
            </span>
          ))}
        </div>

        <button
          onClick={() => onView(resource.id)}
          className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <span>View Resource</span>
          <Icon name="ArrowRightIcon" size={16} variant="outline" />
        </button>
      </div>
    </div>
  );
};

export default ResourceCard;