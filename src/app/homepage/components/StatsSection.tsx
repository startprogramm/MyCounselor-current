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
    },
    {
      id: 2,
      value: 98,
      suffix: '%',
      label: 'Satisfaction Rate',
      icon: 'HeartIcon',
      description: 'Positive feedback from users',
    },
    {
      id: 3,
      value: 50000,
      suffix: '+',
      label: 'Appointments Completed',
      icon: 'CalendarIcon',
      description: 'Successful counseling sessions',
    },
    {
      id: 4,
      value: 24,
      suffix: '/7',
      label: 'Support Available',
      icon: 'ClockIcon',
      description: 'Round-the-clock assistance',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden bg-background py-16 lg:py-24 dark:bg-slate-900/50 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-campus-grid opacity-10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-12 animate-on-scroll ${isVisible ? 'animate-visible' : ''}`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4 text-foreground">
            Trusted by Thousands
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
            Our platform has helped countless students achieve their goals through organized,
            accessible counseling support.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className={`rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-brand dark:border-slate-700 dark:bg-slate-800/60 animate-on-scroll-scale stagger-${index + 1} ${isVisible ? 'animate-visible' : ''}`}
            >
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-[#8AB4F8]">
                <Icon name={stat.icon} size={28} variant="solid" />
              </div>

              <div className="text-4xl font-heading font-bold mb-2 tabular-nums text-foreground">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} isVisible={isVisible} />
              </div>

              <div className="text-lg font-semibold mb-2 text-foreground">{stat.label}</div>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
