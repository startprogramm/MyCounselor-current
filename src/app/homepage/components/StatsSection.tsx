'use client';

import React, { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface Stat {
  id: number;
  value: number;
  suffix: string;
  label: string;
  icon: string;
  description: string;
}

interface StatsSectionProps {
  className?: string;
}

// Animated counter component
const AnimatedCounter = ({ end, suffix, isVisible }: { end: number; suffix: string; isVisible: boolean }) => {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out quart for smooth deceleration
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(end * easeOutQuart));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end]);

  return (
    <span>
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const StatsSection = ({ className = '' }: StatsSectionProps) => {
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.2 });

  const stats: Stat[] = [
    {
      id: 1,
      value: 15000,
      suffix: "+",
      label: "Active Students",
      icon: "UserGroupIcon",
      description: "Students using the platform daily"
    },
    {
      id: 2,
      value: 98,
      suffix: "%",
      label: "Satisfaction Rate",
      icon: "HeartIcon",
      description: "Positive feedback from users"
    },
    {
      id: 3,
      value: 50000,
      suffix: "+",
      label: "Appointments Completed",
      icon: "CalendarIcon",
      description: "Successful counseling sessions"
    },
    {
      id: 4,
      value: 24,
      suffix: "/7",
      label: "Support Available",
      icon: "ClockIcon",
      description: "Round-the-clock assistance"
    }
  ];

  return (
    <section
      ref={sectionRef}
      className={`py-16 lg:py-24 bg-gradient-to-br from-[#2D5A87] to-[#4A90B8] dark:from-slate-900 dark:to-[#2D5A87] text-white overflow-hidden ${className}`}
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-12 animate-on-scroll ${isVisible ? 'animate-visible' : ''}`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Our platform has helped countless students achieve their goals through organized, accessible counseling support.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className={`glass rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 group animate-on-scroll-scale stagger-${index + 1} ${isVisible ? 'animate-visible' : ''}`}
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300">
                <Icon name={stat.icon as any} size={32} variant="solid" />
              </div>

              {/* Animated Value */}
              <div className="text-4xl lg:text-5xl font-heading font-bold mb-2 tabular-nums">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} isVisible={isVisible} />
              </div>

              {/* Label */}
              <div className="text-lg font-semibold mb-2">
                {stat.label}
              </div>

              {/* Description */}
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
