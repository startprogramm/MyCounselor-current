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
}

interface FeaturesSectionProps {
  className?: string;
}

const FeaturesSection = ({ className = '' }: FeaturesSectionProps) => {
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

  const features: Feature[] = [
    {
      id: 1,
      title: 'Intelligent Scheduling',
      description:
        'Smart appointment booking with automated reminders and conflict detection ensures efficient time management.',
      icon: 'CalendarDaysIcon',
      benefits: ['Automated reminders', 'Conflict detection', 'Calendar integration'],
    },
    {
      id: 2,
      title: 'Secure Communication',
      description:
        'FERPA-compliant messaging system with priority handling keeps all conversations private and organized.',
      icon: 'ChatBubbleLeftRightIcon',
      benefits: ['End-to-end encryption', 'Priority messaging', 'Document sharing'],
    },
    {
      id: 3,
      title: 'Resource Library',
      description:
        'Comprehensive collection of guidance materials with personalized recommendations based on student needs.',
      icon: 'BookOpenIcon',
      benefits: ['Searchable content', 'Smart recommendations', 'Mobile access'],
    },
    {
      id: 4,
      title: 'Progress Tracking',
      description:
        'Visual goal-setting and achievement monitoring helps students stay on track toward their objectives.',
      icon: 'ChartBarIcon',
      benefits: ['Goal visualization', 'Milestone tracking', 'Achievement badges'],
    },
    {
      id: 5,
      title: 'Academic Support',
      description:
        'Access educational resources, study guides, and academic planning tools to support student success.',
      icon: 'ShieldCheckIcon',
      benefits: ['Study resources', 'Academic planning', 'Educational tools'],
    },
    {
      id: 6,
      title: 'Analytics Dashboard',
      description:
        'Comprehensive insights into counseling effectiveness and student outcomes support data-driven decisions.',
      icon: 'PresentationChartLineIcon',
      benefits: ['Usage metrics', 'Outcome tracking', 'Custom reports'],
    },
  ];

  return (
    <section id="platform" ref={sectionRef} className={`bg-[var(--lt-paper-alt)] py-24 ${className}`}>
      <div className={`lt-reveal mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 ${isVisible ? 'lt-visible' : ''}`}>
        <div className="max-w-xl">
          <p className="lt-mono text-[12px] text-[var(--lt-blue)]">What&rsquo;s enclosed</p>
          <h2 className="mt-4 text-4xl">Technology That Amplifies Connection</h2>
          <p className="mt-4 text-lg leading-relaxed text-[var(--lt-ink-soft)]">
            MyCounselor provides counselors with efficient tools to make meaningful impact while
            giving students accessible guidance when they need it most.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.id} className="lt-card p-7">
              <span className="lt-dot lt-dot-blue h-11 w-11">
                <Icon name={feature.icon} size={20} variant="solid" />
              </span>
              <h3 className="mt-5 text-xl">{feature.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--lt-ink-soft)]">
                {feature.description}
              </p>
              <ul className="mt-5 space-y-2">
                {feature.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-baseline gap-2 text-sm text-[var(--lt-ink-soft)]"
                  >
                    <span className="text-[var(--lt-blue)]">&middot;</span>
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
