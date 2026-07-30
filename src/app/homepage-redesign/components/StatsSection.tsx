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
    const duration = 1800;
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
    { id: 1, value: 15000, suffix: '+', label: 'Active students' },
    { id: 2, value: 98, suffix: '%', label: 'Satisfaction rate' },
    { id: 3, value: 50000, suffix: '+', label: 'Sessions completed' },
    { id: 4, value: 24, suffix: '/7', label: 'Support available' },
  ];

  return (
    <section ref={sectionRef} className="relative bg-[var(--rd-ink)] py-20 text-[var(--rd-paper)] lg:py-24">
      <div className="rd-grain opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`mb-12 rd-animate ${isVisible ? 'rd-visible' : ''}`}>
          <p className="rd-mono mb-2 text-xs uppercase tracking-[0.16em] text-[var(--rd-seal-bright)]">
            The Ledger
          </p>
          <h2 className="rd-display text-3xl font-semibold sm:text-4xl">Trusted by thousands, entry by entry</h2>
        </div>

        <div className="grid divide-y rd-hairline-light border-y rd-hairline-light sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className={`py-8 pr-4 sm:px-6 rd-animate rd-delay-${Math.min(index + 1, 5)} ${isVisible ? 'rd-visible' : ''}`}
            >
              <p className="rd-display text-4xl font-semibold tabular-nums text-[var(--rd-seal-bright)] lg:text-5xl">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} isVisible={isVisible} />
              </p>
              <p className="rd-mono mt-2 text-xs uppercase tracking-[0.1em] text-[rgba(251,249,244,0.6)]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
