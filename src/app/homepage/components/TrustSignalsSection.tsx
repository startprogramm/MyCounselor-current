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

interface TrustSignalsSectionProps {
  className?: string;
}

const TrustSignalsSection = ({ className = '' }: TrustSignalsSectionProps) => {
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

  const trustSignals: TrustSignal[] = [
    {
      id: 1,
      title: 'FERPA Alignment',
      description:
        'Student records and communications are structured around education privacy requirements.',
      icon: 'DocumentCheckIcon',
      metric: 'Policy-Audited',
    },
    {
      id: 2,
      title: 'Encrypted Communications',
      description:
        'Messages and appointment data are secured in transit and while stored on platform systems.',
      icon: 'LockClosedIcon',
      metric: 'TLS Protected',
    },
    {
      id: 3,
      title: 'Reliable Uptime',
      description:
        'Infrastructure monitoring and incident response keep student support workflows consistently available.',
      icon: 'ShieldCheckIcon',
      metric: '24/7 Coverage',
    },
    {
      id: 4,
      title: 'Operational Review',
      description:
        'Regular platform checks and release controls maintain reliability across school-year demand spikes.',
      icon: 'ClipboardDocumentCheckIcon',
      metric: 'Routine QA',
    },
  ];

  return (
    <section id="trust" ref={sectionRef} className={`bg-[var(--lt-paper-alt)] py-24 ${className}`}>
      <div
        className={`lt-reveal mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr,1.1fr] lg:items-start lg:px-8 ${isVisible ? 'lt-visible' : ''}`}
      >
        <div className="lt-card p-8 lg:sticky lg:top-28">
          <span className="lt-dot lt-dot-blue h-12 w-12">
            <Icon name="ShieldCheckIcon" size={22} variant="solid" />
          </span>
          <p className="lt-mono mt-5 text-[12px] text-[var(--lt-blue)]">The fine print</p>
          <h2 className="mt-3 text-3xl">Built for Sensitive School Workflows</h2>
          <p className="mt-4 text-lg leading-relaxed text-[var(--lt-ink-soft)]">
            School counseling depends on privacy, consistency, and clear accountability. The
            platform is designed around those expectations.
          </p>
          <ul className="mt-8 space-y-4 border-t border-[var(--lt-paper-alt)] pt-6">
            {[
              'Role-aware access controls across student and counselor views',
              'Security review checkpoints before production releases',
              'Incident monitoring and response procedures',
            ].map((point) => (
              <li key={point} className="flex gap-3 text-[15px] text-[var(--lt-ink-soft)]">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[var(--lt-blue)]" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {trustSignals.map((signal) => (
            <div key={signal.id} className="lt-card p-7">
              <div className="flex items-center justify-between">
                <span className="lt-dot lt-dot-blue h-11 w-11">
                  <Icon name={signal.icon} size={20} variant="solid" />
                </span>
                <span className="lt-mono text-[11px] text-[var(--lt-ink-soft)]">{signal.metric}</span>
              </div>
              <h3 className="mt-5 text-lg">{signal.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--lt-ink-soft)]">
                {signal.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSignalsSection;
