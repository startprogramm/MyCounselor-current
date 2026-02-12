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
  cardTone: string;
  iconTone: string;
  iconGlow: string;
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
      cardTone:
        'from-[#edf6ff] via-[#f9fcff] to-[#eaf4ff] dark:from-[#1a2f47]/80 dark:via-[#203754]/70 dark:to-[#1a2f47]/80',
      iconTone: 'from-[#4b95d8] to-[#70b6ec]',
      iconGlow: 'shadow-[0_10px_22px_rgba(75,149,216,0.35)]',
    },
    {
      id: 2,
      title: 'Secure Communication',
      description:
        'FERPA-compliant messaging system with priority handling keeps all conversations private and organized.',
      icon: 'ChatBubbleLeftRightIcon',
      benefits: ['End-to-end encryption', 'Priority messaging', 'Document sharing'],
      cardTone:
        'from-[#eefaf6] via-[#f9fdfb] to-[#ebf8f2] dark:from-[#173a30]/75 dark:via-[#1e4438]/70 dark:to-[#173a30]/75',
      iconTone: 'from-[#4fb890] to-[#7ed7b8]',
      iconGlow: 'shadow-[0_10px_22px_rgba(79,184,144,0.30)]',
    },
    {
      id: 3,
      title: 'Resource Library',
      description:
        'Comprehensive collection of guidance materials with personalized recommendations based on student needs.',
      icon: 'BookOpenIcon',
      benefits: ['Searchable content', 'Smart recommendations', 'Mobile access'],
      cardTone:
        'from-[#fff7ec] via-[#fffdf8] to-[#fff3e2] dark:from-[#453117]/70 dark:via-[#4c371a]/70 dark:to-[#453117]/70',
      iconTone: 'from-[#f3a24c] to-[#f6cb79]',
      iconGlow: 'shadow-[0_10px_22px_rgba(243,162,76,0.28)]',
    },
    {
      id: 4,
      title: 'Progress Tracking',
      description:
        'Visual goal-setting and achievement monitoring helps students stay on track toward their objectives.',
      icon: 'ChartBarIcon',
      benefits: ['Goal visualization', 'Milestone tracking', 'Achievement badges'],
      cardTone:
        'from-[#f2efff] via-[#faf8ff] to-[#ece8ff] dark:from-[#30264a]/70 dark:via-[#3a2d57]/70 dark:to-[#30264a]/70',
      iconTone: 'from-[#7f79e2] to-[#b2aef5]',
      iconGlow: 'shadow-[0_10px_22px_rgba(127,121,226,0.3)]',
    },
    {
      id: 5,
      title: 'Academic Support',
      description:
        'Access educational resources, study guides, and academic planning tools to support student success.',
      icon: 'ShieldCheckIcon',
      benefits: ['Study resources', 'Academic planning', 'Educational tools'],
      cardTone:
        'from-[#f0fbff] via-[#f8feff] to-[#e7f9ff] dark:from-[#173746]/70 dark:via-[#1e4252]/70 dark:to-[#173746]/70',
      iconTone: 'from-[#3eaac4] to-[#7fd8de]',
      iconGlow: 'shadow-[0_10px_22px_rgba(62,170,196,0.30)]',
    },
    {
      id: 6,
      title: 'Analytics Dashboard',
      description:
        'Comprehensive insights into counseling effectiveness and student outcomes support data-driven decisions.',
      icon: 'PresentationChartLineIcon',
      benefits: ['Usage metrics', 'Outcome tracking', 'Custom reports'],
      cardTone:
        'from-[#eff8f4] via-[#f9fefc] to-[#e6f7ef] dark:from-[#1b3b32]/75 dark:via-[#23473d]/70 dark:to-[#1b3b32]/75',
      iconTone: 'from-[#4fab7f] to-[#8fdbb2]',
      iconGlow: 'shadow-[0_10px_22px_rgba(79,171,127,0.32)]',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden bg-vivid-wash py-16 lg:py-24 dark:bg-slate-900/50 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-campus-grid opacity-14" />
      <div className="pointer-events-none absolute -left-14 top-16 h-56 w-56 rounded-full bg-[#9ac9ff]/25 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-56 w-56 rounded-full bg-[#ffd3a5]/25 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-12 animate-on-scroll ${isVisible ? 'animate-visible' : ''}`}
        >
          <div className="mb-4 inline-flex items-center space-x-2 rounded-full border border-[#8abbe7]/35 bg-white/75 px-4 py-2 text-sm font-semibold text-[#2f6ea8] backdrop-blur-sm dark:border-primary/20 dark:bg-primary/15 dark:text-[#9fc8ee]">
            <Icon name="SparklesIcon" size={16} variant="solid" />
            <span>Powerful Features</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            Technology That Amplifies Connection
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            MyCounselor provides counselors with efficient tools to make meaningful impact while
            giving students accessible guidance when they need it most.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`group rounded-[1.4rem] border border-white/75 bg-gradient-to-br ${feature.cardTone} p-6 shadow-vivid transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_28px_rgba(52,100,154,0.2)] dark:border-slate-700 animate-on-scroll-scale stagger-${Math.min(index + 1, 6)} ${isVisible ? 'animate-visible' : ''}`}
            >
              {/* Icon */}
              <div
                className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.iconTone} text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${feature.iconGlow}`}
              >
                <Icon name={feature.icon} size={28} variant="solid" className="text-white" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-heading font-bold text-[#1e4265] mb-3 transition-colors group-hover:text-[#2f6ea8] dark:text-slate-100">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
                {feature.description}
              </p>

              {/* Benefits List */}
              <ul className="space-y-2">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li
                    key={benefitIndex}
                    className="flex items-center text-sm text-slate-600 transition-colors group-hover:text-slate-800 dark:text-slate-300 dark:group-hover:text-slate-100"
                  >
                    <Icon
                      name="CheckCircleIcon"
                      size={16}
                      variant="solid"
                      className="mr-2 flex-shrink-0 text-[#4faf89]"
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
