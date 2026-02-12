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
    <section
      ref={sectionRef}
      className={`relative overflow-hidden bg-background py-16 lg:py-20 dark:bg-slate-900/50 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-campus-grid opacity-12" />

      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr,1.45fr] lg:items-stretch lg:px-8">
        <div
          className={`rounded-[1.6rem] border border-slate-200 bg-gradient-to-br from-[#eef4fa] to-[#ffffff] p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800/60 animate-on-scroll-left ${isVisible ? 'animate-visible' : ''}`}
        >
          <div className="mb-4 inline-flex items-center space-x-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent dark:bg-accent/20">
            <Icon name="ShieldCheckIcon" size={16} variant="solid" />
            <span>Trust & Compliance</span>
          </div>

          <h2 className="mb-4 text-2xl font-heading font-bold text-foreground sm:text-3xl">
            Built for Sensitive School Workflows
          </h2>
          <p className="mb-6 text-muted-foreground">
            School counseling depends on privacy, consistency, and clear accountability. The
            platform is designed around those expectations.
          </p>

          <div className="space-y-3">
            {[
              'Role-aware access controls across student and counselor views',
              'Security review checkpoints before production releases',
              'Incident monitoring and response procedures',
            ].map((point) => (
              <div
                key={point}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-700/35"
              >
                <Icon
                  name="CheckCircleIcon"
                  size={18}
                  variant="solid"
                  className="mt-0.5 text-secondary"
                />
                <p className="text-sm text-foreground">{point}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {trustSignals.map((signal, index) => (
            <div
              key={signal.id}
              className={`group rounded-[1.3rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-brand dark:border-slate-700 dark:bg-slate-800/60 animate-on-scroll-scale stagger-${Math.min(index + 1, 6)} ${isVisible ? 'animate-visible' : ''}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white transition-transform duration-300 group-hover:scale-110">
                  <Icon name={signal.icon as any} size={24} variant="solid" />
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary dark:bg-primary/20">
                  {signal.metric}
                </span>
              </div>

              <h3 className="mb-2 text-lg font-heading font-semibold text-foreground">
                {signal.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{signal.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSignalsSection;
