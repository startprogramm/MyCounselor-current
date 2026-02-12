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
  cardTone: string;
  iconTone: string;
  metricTone: string;
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
      cardTone:
        'from-[#eef7ff] via-[#f9fcff] to-[#eaf3ff] dark:from-[#1a3048]/80 dark:via-[#203651]/70 dark:to-[#1a3048]/80',
      iconTone: 'from-[#5b9cde] to-[#7fc0ef]',
      metricTone: 'bg-[#e9f3ff] text-[#2f6ea8] dark:bg-slate-700 dark:text-[#a7ccf0]',
    },
    {
      id: 2,
      title: 'Encrypted Communications',
      description:
        'Messages and appointment data are secured in transit and while stored on platform systems.',
      icon: 'LockClosedIcon',
      metric: 'TLS Protected',
      cardTone:
        'from-[#f1f7ff] via-[#f8fbff] to-[#edf4ff] dark:from-[#1c2f49]/80 dark:via-[#23385a]/70 dark:to-[#1c2f49]/80',
      iconTone: 'from-[#4f96da] to-[#72b4eb]',
      metricTone: 'bg-[#edf4ff] text-[#3a6e9a] dark:bg-slate-700 dark:text-[#a7ccf0]',
    },
    {
      id: 3,
      title: 'Reliable Uptime',
      description:
        'Infrastructure monitoring and incident response keep student support workflows consistently available.',
      icon: 'ShieldCheckIcon',
      metric: '24/7 Coverage',
      cardTone:
        'from-[#eefaf6] via-[#f8fdfb] to-[#e8f7f0] dark:from-[#19372f]/75 dark:via-[#1f4339]/70 dark:to-[#19372f]/75',
      iconTone: 'from-[#4fb890] to-[#7ed7b8]',
      metricTone: 'bg-[#ecfaf4] text-[#2f8e6d] dark:bg-slate-700 dark:text-[#9fe6cb]',
    },
    {
      id: 4,
      title: 'Operational Review',
      description:
        'Regular platform checks and release controls maintain reliability across school-year demand spikes.',
      icon: 'ClipboardDocumentCheckIcon',
      metric: 'Routine QA',
      cardTone:
        'from-[#fff6ec] via-[#fffdf7] to-[#fff1e1] dark:from-[#443116]/75 dark:via-[#503a1c]/70 dark:to-[#443116]/75',
      iconTone: 'from-[#f3a34f] to-[#f7c670]',
      metricTone: 'bg-[#fff3e5] text-[#bc7123] dark:bg-slate-700 dark:text-[#ffd38f]',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden bg-gradient-to-b from-[#e4f4ff] via-[#f5fbff] to-[#ecfff4] py-16 lg:py-20 dark:from-[#0f1725] dark:via-[#111b2b] dark:to-[#162234] ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-campus-grid opacity-20 dark:opacity-25" />
      <div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-[#93b7ff]/32 blur-3xl dark:bg-[#4f78a3]/25" />
      <div className="pointer-events-none absolute -right-20 bottom-16 h-72 w-72 rounded-full bg-[#a2f0c3]/26 blur-3xl dark:bg-[#4f8a76]/20" />

      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr,1.45fr] lg:items-stretch lg:px-8">
        <div
          className={`rounded-[1.75rem] border border-[#dce8f5] bg-gradient-to-br from-white via-[#f8fcff] to-[#f2f9ff] p-8 shadow-[0_14px_30px_rgba(24,66,105,0.10)] backdrop-blur-sm dark:border-slate-600 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 animate-on-scroll-left ${isVisible ? 'animate-visible' : ''}`}
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
                className="flex items-start gap-3 rounded-xl border border-[#dde9f6] bg-gradient-to-r from-white to-[#f7fbff] p-3 shadow-[0_4px_10px_rgba(24,66,105,0.07)] dark:border-slate-600 dark:bg-slate-800/85"
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
              className={`group rounded-[1.3rem] border border-[#dce8f5] bg-gradient-to-br ${signal.cardTone} p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#7aa8cf] hover:shadow-[0_12px_24px_rgba(24,66,105,0.16)] dark:border-slate-700 dark:hover:border-[#6a97c0] animate-on-scroll-scale stagger-${Math.min(index + 1, 6)} ${isVisible ? 'animate-visible' : ''}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white transition-transform duration-300 group-hover:scale-110 ${signal.iconTone}`}
                >
                  <Icon name={signal.icon} size={24} variant="solid" />
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${signal.metricTone}`}
                >
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
