'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
  benefits: string[];
  color: string;
}

const FeaturesSection = () => {
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

  const features: Feature[] = [
    {
      id: 1,
      title: 'Intelligent Scheduling',
      description: 'Smart appointment booking with reminders and conflict detection.',
      icon: 'CalendarDaysIcon',
      benefits: ['Automated reminders', 'Conflict detection', 'Calendar sync'],
      color: '#b9862e',
    },
    {
      id: 2,
      title: 'Secure Communication',
      description: 'FERPA-aligned messaging with priority handling for sensitive threads.',
      icon: 'ChatBubbleLeftRightIcon',
      benefits: ['Encrypted in transit', 'Priority flagging', 'Document sharing'],
      color: '#1f6f5c',
    },
    {
      id: 3,
      title: 'Resource Library',
      description: 'Guidance materials with recommendations tuned to each student.',
      icon: 'BookOpenIcon',
      benefits: ['Searchable content', 'Smart recommendations', 'Mobile access'],
      color: '#3e6e93',
    },
    {
      id: 4,
      title: 'Progress Tracking',
      description: 'Visual goal-setting keeps students moving toward real deadlines.',
      icon: 'ChartBarIcon',
      benefits: ['Goal visualization', 'Milestone tracking', 'Achievement markers'],
      color: '#8b3a3a',
    },
    {
      id: 5,
      title: 'Academic Support',
      description: 'Study guides and planning tools aligned to each school’s curriculum.',
      icon: 'ShieldCheckIcon',
      benefits: ['Study resources', 'Academic planning', 'Curriculum-aware'],
      color: '#b9862e',
    },
    {
      id: 6,
      title: 'Analytics Dashboard',
      description: 'Counseling effectiveness and outcomes, read at a glance.',
      icon: 'PresentationChartLineIcon',
      benefits: ['Usage metrics', 'Outcome tracking', 'Custom reports'],
      color: '#1f6f5c',
    },
  ];

  return (
    <section id="features" ref={sectionRef} className="relative bg-[rgba(242,234,217,0.5)] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`mb-14 max-w-2xl rd-animate ${isVisible ? 'rd-visible' : ''}`}>
          <p className="rd-mono mb-3 text-xs uppercase tracking-[0.16em] text-[rgba(20,33,61,0.5)]">
            Inside the file
          </p>
          <h2 className="rd-display text-3xl font-semibold text-[var(--rd-ink)] sm:text-4xl">
            Every tool a counselor actually reaches for
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`group rounded-xl border rd-hairline bg-[var(--rd-paper)] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg rd-animate rd-delay-${Math.min(index + 1, 5)} ${isVisible ? 'rd-visible' : ''}`}
            >
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-full"
                style={{ background: `${feature.color}1f`, color: feature.color }}
              >
                <Icon name={feature.icon as any} size={22} variant="solid" />
              </div>
              <h3 className="rd-display mb-2 text-lg font-semibold text-[var(--rd-ink)]">{feature.title}</h3>
              <p className="mb-4 text-sm leading-relaxed text-[rgba(20,33,61,0.6)]">{feature.description}</p>
              <ul className="space-y-1.5 border-t rd-hairline pt-4">
                {feature.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2 text-xs text-[rgba(20,33,61,0.55)]">
                    <span
                      className="h-1 w-1 rounded-full"
                      style={{ background: feature.color }}
                    />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
