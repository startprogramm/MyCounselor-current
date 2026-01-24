import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Stat {
  id: number;
  value: string;
  label: string;
  icon: string;
  description: string;
}

interface StatsSectionProps {
  className?: string;
}

const StatsSection = ({ className = '' }: StatsSectionProps) => {
  const stats: Stat[] = [
    {
      id: 1,
      value: "15,000+",
      label: "Active Students",
      icon: "UserGroupIcon",
      description: "Students using the platform daily"
    },
    {
      id: 2,
      value: "98%",
      label: "Satisfaction Rate",
      icon: "HeartIcon",
      description: "Positive feedback from users"
    },
    {
      id: 3,
      value: "50,000+",
      label: "Appointments Completed",
      icon: "CalendarIcon",
      description: "Successful counseling sessions"
    },
    {
      id: 4,
      value: "24/7",
      label: "Support Available",
      icon: "ClockIcon",
      description: "Round-the-clock assistance"
    }
  ];

  return (
    <section className={`py-16 lg:py-24 bg-gradient-to-br from-[#2D5A87] to-[#4A90B8] text-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Our platform has helped countless students achieve their goals through organized, accessible counseling support.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
                <Icon name={stat.icon as any} size={32} variant="solid" />
              </div>
              
              <div className="text-4xl font-heading font-bold mb-2">
                {stat.value}
              </div>
              
              <div className="text-lg font-semibold mb-2">
                {stat.label}
              </div>
              
              <p className="text-sm text-white/80">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;