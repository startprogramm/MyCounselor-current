'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface TrustSignal {
  id: number;
  title: string;
  description: string;
  metric: string;
}

const TrustSignalsSection = () => {
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

  const signals: TrustSignal[] = [
    {
      id: 1,
      title: 'FERPA Alignment',
      description: 'Records and communications are structured around education privacy requirements.',
      metric: 'Policy-audited',
    },
    {
      id: 2,
      title: 'Encrypted Communications',
      description: 'Messages and appointment data are secured in transit and at rest.',
      metric: 'TLS protected',
    },
    {
      id: 3,
      title: 'Reliable Uptime',
      description: 'Monitoring and incident response keep support workflows available.',
      metric: '24/7 coverage',
    },
    {
      id: 4,
      title: 'Operational Review',
      description: 'Release controls maintain reliability across school-year demand spikes.',
      metric: 'Routine QA',
    },
  ];

  return (
    <section id="trust" ref={sectionRef} className="relative bg-[var(--ed-white)] py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className={`ed-display text-3xl font-bold uppercase sm:text-4xl ed-animate ${isVisible ? 'ed-visible' : ''}`}>
            Built On Trust
          </h2>
          <p className={`max-w-md text-[rgba(17,17,16,0.65)] ed-animate ed-delay-1 ${isVisible ? 'ed-visible' : ''}`}>
            Counseling depends on privacy and accountability — the platform is built around
            those expectations from day one.
          </p>
        </div>

        <div className="divide-y divide-[rgba(17,17,16,0.14)] border-y border-[rgba(17,17,16,0.14)]">
          {signals.map((signal, index) => (
            <div
              key={signal.id}
              className={`flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between ed-animate ed-delay-${Math.min(index + 1, 5)} ${isVisible ? 'ed-visible' : ''}`}
            >
              <div className="flex items-center gap-4">
                <Icon name="CheckCircleIcon" size={20} variant="solid" className="flex-shrink-0 text-[var(--ed-orange)]" />
                <div>
                  <h3 className="ed-display text-base font-bold">{signal.title}</h3>
                  <p className="text-sm text-[rgba(17,17,16,0.6)]">{signal.description}</p>
                </div>
              </div>
              <span className="w-fit rounded-full border border-[var(--ed-ink)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide sm:ml-4">
                {signal.metric}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSignalsSection;
