'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface Stat {
  id: number;
  value: number;
  suffix: string;
  label: string;
  description: string;
  dot: 'lt-dot-blue' | 'lt-dot-gold';
}

interface StatsSectionProps {
  className?: string;
}

const Counter = ({ end, suffix, start }: { end: number; suffix: string; start: boolean }) => {
  const [count, setCount] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    if (!start || done.current) return;
    done.current = true;
    const duration = 1600;
    const t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / duration, 1);
      setCount(Math.floor(end * (1 - Math.pow(1 - p, 4))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [start, end]);

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
      description: 'Students using the platform daily',
      dot: 'lt-dot-gold',
    },
    {
      id: 2,
      value: 98,
      suffix: '%',
      label: 'Satisfaction Rate',
      description: 'Positive feedback from users',
      dot: 'lt-dot-blue',
    },
    {
      id: 3,
      value: 50000,
      suffix: '+',
      label: 'Appointments Completed',
      description: 'Successful counseling sessions',
      dot: 'lt-dot-blue',
    },
    {
      id: 4,
      value: 24,
      suffix: '/7',
      label: 'Support Available',
      description: 'Round-the-clock assistance',
      dot: 'lt-dot-gold',
    },
  ];

  return (
    <section ref={sectionRef} className={`bg-[var(--lt-blue)] py-20 ${className}`}>
      <div className={`lt-reveal mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 ${isVisible ? 'lt-visible' : ''}`}>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id}>
              <span className={`lt-dot ${stat.dot} mb-4 h-2 w-2`} />
              <div className="text-4xl text-white">
                <Counter end={stat.value} suffix={stat.suffix} start={isVisible} />
              </div>
              <div className="mt-2 text-[15px] font-medium text-white/90">{stat.label}</div>
              <p className="mt-1 text-sm text-white/60">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
