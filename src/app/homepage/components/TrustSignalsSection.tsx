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
      className={`relative overflow-hidden bg-gradient-to-b from-[#eaf2fb] via-[#f8fbff] to-[#eef6ff] py-16 lg:py-20 dark:from-[#0f1725] dark:via-[#111b2b] dark:to-[#162234] ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-campus-grid opacity-20 dark:opacity-25" />
      <div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-[#93b7d9]/30 blur-3xl dark:bg-[#4f78a3]/25" />
      <div className="pointer-events-none absolute -right-20 bottom-16 h-72 w-72 rounded-full bg-[#a2d4c6]/25 blur-3xl dark:bg-[#4f8a76]/20" />

      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr,1.45fr] lg:items-stretch lg:px-8">
        <div
          className={`rounded-[1.75rem] border border-[#dce8f5] bg-white/90 p-8 shadow-[0_14px_30px_rgba(24,66,105,0.10)] backdrop-blur-sm dark:border-slate-600 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 animate-on-scroll-left ${isVisible ? 'animate-visible' : ''}`}
        >
          <div className="mb-4 inline-flex items-center space-x-2 rounded-full border border-[#e1ebf7] bg-[#f3f8ff] px-4 py-2 text-sm font-medium text-[#2e6ea2] dark:border-slate-600 dark:bg-slate-700/70 dark:text-[#ffd77a]">
            <Icon name="ShieldCheckIcon" size={16} variant="solid" />
            <span>Trust & Compliance</span>
          </div>

          <h2 className="mb-4 text-2xl font-heading font-bold text-[#173a59] sm:text-3xl dark:text-slate-100">
            Built for Sensitive School Workflows
          </h2>
          <p className="mb-6 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
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
                className="flex items-start gap-3 rounded-xl border border-[#dde9f6] bg-white p-3 shadow-[0_4px_10px_rgba(24,66,105,0.07)] dark:border-slate-600 dark:bg-slate-800/85"
              >
                <Icon
                  name="CheckCircleIcon"
                  size={18}
                  variant="solid"
                  className="mt-0.5 text-[#64b37a]"
                />
                <p className="text-sm text-slate-700 dark:text-slate-200">{point}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {trustSignals.map((signal, index) => (
            <div
              key={signal.id}
              className={`group rounded-[1.3rem] border border-[#dce8f5] bg-white/85 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#7aa8cf] hover:shadow-[0_12px_24px_rgba(24,66,105,0.16)] dark:border-slate-700 dark:bg-slate-800/85 dark:hover:border-[#6a97c0] animate-on-scroll-scale stagger-${Math.min(index + 1, 6)} ${isVisible ? 'animate-visible' : ''}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#79a9cf] to-[#8fd0b9] text-white transition-transform duration-300 group-hover:scale-110 dark:from-[#4e78a5] dark:to-[#5ca38b]">
                  <Icon name={signal.icon} size={24} variant="solid" />
                </div>
                <span className="rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-semibold text-[#35648c] dark:bg-slate-700 dark:text-[#9ec3e5]">
                  {signal.metric}
                </span>
              </div>

              <h3 className="mb-2 text-xl font-heading font-semibold text-[#1b3f61] dark:text-slate-100">
                {signal.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
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
