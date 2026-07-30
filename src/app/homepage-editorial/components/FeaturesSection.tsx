'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const FeaturesSection = () => {
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

  const features: Feature[] = [
    {
      id: '01',
      title: 'Intelligent Scheduling',
      description: 'Smart appointment booking with reminders and conflict detection.',
      icon: 'CalendarDaysIcon',
    },
    {
      id: '02',
      title: 'Secure Communication',
      description: 'FERPA-aligned messaging with priority handling for sensitive threads.',
      icon: 'ChatBubbleLeftRightIcon',
    },
    {
      id: '03',
      title: 'Resource Library',
      description: 'Guidance materials with recommendations tuned to each student.',
      icon: 'BookOpenIcon',
    },
    {
      id: '04',
      title: 'Progress Tracking',
      description: 'Visual goal-setting keeps students moving toward real deadlines.',
      icon: 'ChartBarIcon',
    },
    {
      id: '05',
      title: 'Academic Support',
      description: 'Study guides and planning tools aligned to each school’s curriculum.',
      icon: 'ShieldCheckIcon',
    },
    {
      id: '06',
      title: 'Analytics Dashboard',
      description: 'Counseling effectiveness and outcomes, read at a glance.',
      icon: 'PresentationChartLineIcon',
    },
  ];

  return (
    <section id="features" ref={sectionRef} className="relative bg-[var(--ed-white)] py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className={`mb-14 max-w-xl ed-animate ${isVisible ? 'ed-visible' : ''}`}>
          <h2 className="ed-display text-3xl font-bold uppercase sm:text-4xl">What&apos;s Inside</h2>
          <p className="mt-3 text-lg text-[rgba(17,17,16,0.65)]">
            Every tool a counselor actually reaches for, day to day.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden border border-[var(--ed-ink)] bg-[var(--ed-ink)] md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`group relative overflow-hidden bg-[var(--ed-paper)] p-7 transition-colors duration-300 hover:bg-[var(--ed-orange)] hover:text-[var(--ed-paper)] ed-animate ed-delay-${Math.min(index + 1, 5)} ${isVisible ? 'ed-visible' : ''}`}
            >
              <span
                className="ed-display pointer-events-none absolute -right-2 -top-3 text-[86px] font-extrabold leading-none text-[rgba(17,17,16,0.06)] transition-colors duration-300 group-hover:text-[rgba(239,236,228,0.25)]"
              >
                {feature.id}
              </span>
              <Icon name={feature.icon as any} size={26} variant="outline" className="relative mb-6" />
              <h3 className="ed-display relative mb-2 text-lg font-bold">{feature.title}</h3>
              <p className="relative text-sm leading-relaxed opacity-70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
