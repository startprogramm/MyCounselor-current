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
  cardTone: string;
  iconTone: string;
}

interface StatsSectionProps {
  className?: string;
}

// Animated counter component
const AnimatedCounter = ({
  end,
  suffix,
  isVisible,
}: {
  end: number;
  suffix: string;
  isVisible: boolean;
}) => {
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
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const StatsSection = ({ className = '' }: StatsSectionProps) => {
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.2 });

  const stats: Stat[] = [
    {
      id: 1,
      value: 15000,
      suffix: '+',
      label: 'Active Students',
      icon: 'UserGroupIcon',
      description: 'Students using the platform daily',
      cardTone:
        'from-[#edf7ff] via-[#f8fcff] to-[#e9f3ff] dark:from-[#1a314b]/80 dark:via-[#1e3956]/70 dark:to-[#1a314b]/80',
      iconTone: 'from-[#4f96da] to-[#73b1eb]',
    },
    {
      id: 2,
      value: 98,
      suffix: '%',
      label: 'Satisfaction Rate',
      icon: 'HeartIcon',
      description: 'Positive feedback from users',
      cardTone:
        'from-[#fff3f4] via-[#fffaf9] to-[#ffecef] dark:from-[#472737]/75 dark:via-[#552f3f]/70 dark:to-[#472737]/75',
      iconTone: 'from-[#eb7194] to-[#f4a2ba]',
    },
    {
      id: 3,
      value: 50000,
      suffix: '+',
      label: 'Appointments Completed',
      icon: 'CalendarIcon',
      description: 'Successful counseling sessions',
      cardTone:
        'from-[#fff6eb] via-[#fffdf5] to-[#ffeee0] dark:from-[#473419]/75 dark:via-[#563f1f]/70 dark:to-[#473419]/75',
      iconTone: 'from-[#f2a250] to-[#f8ca79]',
    },
    {
      id: 4,
      value: 24,
      suffix: '/7',
      label: 'Support Available',
      icon: 'ClockIcon',
      description: 'Round-the-clock assistance',
      cardTone:
        'from-[#ebfbf4] via-[#f7fefb] to-[#e4f8ed] dark:from-[#183a32]/75 dark:via-[#1f463c]/70 dark:to-[#183a32]/75',
      iconTone: 'from-[#49b28d] to-[#7ed7b8]',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden bg-gradient-to-br from-[#def3ff] via-[#f3fbff] to-[#e8fcf2] py-16 text-[#1f466c] lg:py-24 dark:from-slate-900 dark:via-[#16283f] dark:to-[#1d405f] dark:text-white ${className}`}
    >
      <div className="absolute inset-0 bg-campus-grid opacity-16 dark:opacity-22" />

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-[#8fc4ff]/30 blur-3xl animate-float" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-[#9ee2c9]/30 blur-3xl animate-float-delayed" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-12 animate-on-scroll ${isVisible ? 'animate-visible' : ''}`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4 text-[#1f466c] dark:text-white">
            Trusted by Thousands
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-slate-600 dark:text-white/90">
            Our platform has helped countless students achieve their goals through organized,
            accessible counseling support.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className={`group rounded-[1.4rem] border border-white/80 bg-gradient-to-br ${stat.cardTone} p-6 text-center shadow-vivid transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_28px_rgba(52,100,154,0.18)] dark:border-slate-700 animate-on-scroll-scale stagger-${index + 1} ${isVisible ? 'animate-visible' : ''}`}
            >
              {/* Icon */}
              <div
                className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${stat.iconTone} text-white shadow-md transition-all duration-300 group-hover:scale-110`}
              >
                <Icon name={stat.icon} size={32} variant="solid" />
              </div>

              {/* Animated Value */}
              <div className="text-4xl lg:text-5xl font-heading font-bold mb-2 tabular-nums text-[#1f466c] dark:text-white">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} isVisible={isVisible} />
              </div>

              {/* Label */}
              <div className="text-lg font-semibold mb-2 text-[#24537a] dark:text-slate-100">
                {stat.label}
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 dark:text-slate-300">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
