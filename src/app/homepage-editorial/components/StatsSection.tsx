'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface Stat {
  id: number;
  value: number;
  suffix: string;
  label: string;
}

const AnimatedCounter = ({ end, suffix, isVisible }: { end: number; suffix: string; isVisible: boolean }) => {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;
    hasAnimated.current = true;
    const duration = 1600;
    const start = Date.now();
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(end * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isVisible, end]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const StatsSection = () => {
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.2 });

  const stats: Stat[] = [
    { id: 1, value: 500, suffix: '+', label: 'School Communities' },
    { id: 2, value: 98, suffix: '%', label: 'Satisfaction Rate' },
    { id: 3, value: 50000, suffix: '+', label: 'Sessions Completed' },
    { id: 4, value: 24, suffix: '/7', label: 'Support Available' },
  ];

  return (
    <section ref={sectionRef} className="relative bg-[var(--ed-ink)] py-20 text-[var(--ed-paper)] lg:py-24">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid divide-y divide-[rgba(239,236,228,0.16)] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className={`py-8 pr-6 sm:px-6 ed-animate ed-delay-${Math.min(index + 1, 5)} ${isVisible ? 'ed-visible' : ''}`}
            >
              <p className="ed-display text-5xl font-extrabold tabular-nums text-[var(--ed-orange)] lg:text-6xl">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} isVisible={isVisible} />
              </p>
              <p className="mt-3 text-sm font-medium text-[rgba(239,236,228,0.65)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
