import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface WelcomeCardProps {
  studentName: string;
  lastLogin: string;
}

const WelcomeCard = ({ studentName, lastLogin }: WelcomeCardProps) => {
  return (
    <div className="bg-gradient-brand rounded-xl p-6 text-white shadow-brand-lg">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold mb-2">
            Welcome back, {studentName}!
          </h1>
          <p className="text-white/90 text-sm">
            Last login: {lastLogin}
          </p>
        </div>
        <div className="bg-white/20 rounded-lg p-3">
          <Icon name="AcademicCapIcon" size={32} variant="outline" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <div className="text-2xl font-bold">12</div>
          <div className="text-xs text-white/80">Upcoming Tasks</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <div className="text-2xl font-bold">3</div>
          <div className="text-xs text-white/80">New Messages</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <div className="text-2xl font-bold">85%</div>
          <div className="text-xs text-white/80">Goal Progress</div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;