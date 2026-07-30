'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface TrustSignal {
  id: number;
  title: string;
  description: string;
  icon: string;
  metric: string;
}

const TrustSignalsSection = () => {
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

  const signals: TrustSignal[] = [
    {
      id: 1,
      title: 'FERPA Alignment',
      description: 'Records and communications are structured around education privacy requirements.',
      icon: 'DocumentCheckIcon',
      metric: 'Policy-audited',
    },
    {
      id: 2,
      title: 'Encrypted Communications',
      description: 'Messages and appointment data are secured in transit and at rest.',
      icon: 'LockClosedIcon',
      metric: 'TLS protected',
    },
    {
      id: 3,
      title: 'Reliable Uptime',
      description: 'Monitoring and incident response keep support workflows available.',
      icon: 'ShieldCheckIcon',
      metric: '24/7 coverage',
    },
    {
      id: 4,
      title: 'Operational Review',
      description: 'Release controls maintain reliability across school-year demand spikes.',
      icon: 'ClipboardDocumentCheckIcon',
      metric: 'Routine QA',
    },
  ];

  return (
    <section id="trust" ref={sectionRef} className="relative bg-[rgba(242,234,217,0.5)] py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`mb-10 max-w-2xl rd-animate ${isVisible ? 'rd-visible' : ''}`}>
          <p className="rd-mono mb-3 text-xs uppercase tracking-[0.16em] text-[rgba(20,33,61,0.5)]">
            Compliance Ledger
          </p>
          <h2 className="rd-display text-3xl font-semibold text-[var(--rd-ink)] sm:text-4xl">
            Built for sensitive school workflows
          </h2>
          <p className="mt-3 text-lg text-[rgba(20,33,61,0.65)]">
            Counseling depends on privacy, consistency, and clear accountability — the platform is
            built around those expectations, not around them.
          </p>
        </div>

        <div className="divide-y rd-hairline overflow-hidden rounded-xl border rd-hairline bg-[var(--rd-paper)]">
          {signals.map((signal, index) => (
            <div
              key={signal.id}
              className={`flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between rd-animate rd-delay-${Math.min(index + 1, 5)} ${isVisible ? 'rd-visible' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(31,111,92,0.12)] text-[var(--rd-cambridge)]">
                  <Icon name={signal.icon} size={22} variant="solid" />
                </div>
                <div>
                  <h3 className="rd-display text-base font-semibold text-[var(--rd-ink)]">{signal.title}</h3>
                  <p className="text-sm text-[rgba(20,33,61,0.6)]">{signal.description}</p>
                </div>
              </div>
              <span className="rd-mono inline-flex w-fit items-center rounded-full bg-[rgba(20,33,61,0.05)] px-3 py-1.5 text-xs uppercase tracking-[0.08em] text-[rgba(20,33,61,0.6)] sm:ml-4">
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
