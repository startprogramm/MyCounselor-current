import React from 'react';
import Icon from '@/components/ui/AppIcon';

const CrisisResourcesBanner = () => {
  return (
    <div className="bg-destructive/10 border-2 border-destructive rounded-xl p-6 mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-3 bg-destructive rounded-lg">
            <Icon name="ExclamationTriangleIcon" size={28} variant="solid" className="text-destructive-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-bold text-foreground mb-1">
              Need Immediate Support?
            </h2>
            <p className="text-sm text-muted-foreground">
              Access crisis intervention resources and emergency guidance 24/7
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">
            <Icon name="PhoneIcon" size={20} variant="outline" />
            <span>Crisis Hotline</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-card text-foreground border-2 border-destructive rounded-lg font-semibold hover:bg-muted transition-colors whitespace-nowrap">
            <Icon name="ChatBubbleLeftRightIcon" size={20} variant="outline" />
            <span>Chat Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrisisResourcesBanner;