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
    <section
      ref={sectionRef}
      className={`relative overflow-hidden bg-background py-16 lg:py-24 dark:bg-slate-900/50 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-campus-grid opacity-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-12 animate-on-scroll ${isVisible ? 'animate-visible' : ''}`}
        >
          <div className="mb-4 inline-flex items-center space-x-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm font-medium text-primary dark:border-primary/20 dark:bg-primary/15">
            <Icon name="SparklesIcon" size={16} variant="solid" />
            <span>Powerful Features</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            Technology That Amplifies Connection
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            MyCounselor provides counselors with efficient tools to make meaningful impact while
            giving students accessible guidance when they need it most.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`group rounded-[1.4rem] border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-brand dark:border-slate-700 dark:bg-slate-800/60 animate-on-scroll-scale stagger-${Math.min(index + 1, 6)} ${isVisible ? 'animate-visible' : ''}`}
            >
              {/* Icon */}
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#3a6c9b] to-[#5f8fbf] shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Icon name={feature.icon as any} size={28} variant="solid" className="text-white" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-heading font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground mb-4 leading-relaxed">{feature.description}</p>

              {/* Benefits List */}
              <ul className="space-y-2">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li
                    key={benefitIndex}
                    className="flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors"
                  >
                    <Icon
                      name="CheckCircleIcon"
                      size={16}
                      variant="solid"
                      className="text-accent mr-2 flex-shrink-0"
                    />
                    <span>{benefit}</span>
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
