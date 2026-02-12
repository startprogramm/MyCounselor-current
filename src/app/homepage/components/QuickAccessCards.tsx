'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface AccessCard {
  id: number;
  title: string;
  description: string;
  icon: string;
  href: string;
  iconShell: string;
  iconColor: string;
  accentBar: string;
  userType: string;
  ctaLabel: string;
}

interface QuickAccessCardsProps {
  className?: string;
}

const QuickAccessCards = ({ className = '' }: QuickAccessCardsProps) => {
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

  const accessCards: AccessCard[] = [
    {
      id: 1,
      title: 'Student Portal',
      description:
        'Track goals, view recommendations, and keep every appointment in one personalized space.',
      icon: 'AcademicCapIcon',
      href: '/student-portal-dashboard',
      iconShell: 'bg-[#35658f]/15 dark:bg-[#35658f]/30',
      iconColor: 'text-[#35658f] dark:text-[#8AB4F8]',
      accentBar: 'from-[#35658f] to-[#5f8fbf]',
      userType: 'For Students',
      ctaLabel: 'Open Student View',
    },
    {
      id: 2,
      title: 'Counselor Center',
      description:
        'Coordinate caseloads, prioritize outreach, and move quickly between messaging and planning.',
      icon: 'UserGroupIcon',
      href: '/counselor-command-center',
      iconShell: 'bg-[#2f5b84]/15 dark:bg-[#2f5b84]/30',
      iconColor: 'text-[#2f5b84] dark:text-[#9fc0de]',
      accentBar: 'from-[#2f5b84] to-[#6ca6cb]',
      userType: 'For Counselors',
      ctaLabel: 'Open Counselor View',
    },
    {
      id: 3,
      title: 'Parent Resources',
      description:
        'Access trusted guidance materials and stay aligned with school plans and student milestones.',
      icon: 'HomeIcon',
      href: '/resource-discovery-center',
      iconShell: 'bg-[#466f96]/15 dark:bg-[#466f96]/30',
      iconColor: 'text-[#466f96] dark:text-[#9cc3e6]',
      accentBar: 'from-[#466f96] to-[#7eb1d5]',
      userType: 'For Families',
      ctaLabel: 'Explore Family Resources',
    },
    {
      id: 4,
      title: 'Communication Hub',
      description:
        'Use secure FERPA-aligned messaging to keep important conversations organized and actionable.',
      icon: 'ChatBubbleLeftEllipsisIcon',
      href: '/secure-communication-hub',
      iconShell: 'bg-[#264f74]/15 dark:bg-[#264f74]/35',
      iconColor: 'text-[#264f74] dark:text-[#8AB4F8]',
      accentBar: 'from-[#264f74] to-[#5f8fbf]',
      userType: 'For Everyone',
      ctaLabel: 'Enter Communication Hub',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden bg-sky-wash py-16 lg:py-24 dark:bg-slate-900 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-campus-grid opacity-20" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 dark:from-primary/10 dark:via-transparent dark:to-primary/10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-12 animate-on-scroll ${isVisible ? 'animate-visible' : ''}`}
        >
          <div className="mb-4 inline-flex items-center space-x-2 rounded-full border border-primary/15 bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm dark:border-primary/20 dark:bg-slate-800">
            <Icon name="Squares2X2Icon" size={16} variant="solid" />
            <span>Role-Based Entry Points</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            Choose Your Path
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Each experience is designed around the workflows people actually use every day in school
            communities.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {accessCards.map((card, index) => (
            <Link
              key={card.id}
              href={card.href}
              className={`group relative overflow-hidden rounded-[1.4rem] border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#5f89b5]/60 hover:shadow-brand focus-ring dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-primary/50 animate-on-scroll-scale stagger-${Math.min(index + 1, 6)} ${isVisible ? 'animate-visible' : ''}`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-75 ${card.accentBar}`}
              />

              {/* Badge */}
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
                  {card.userType}
                </span>
              </div>

              {/* Icon */}
              <div
                className={`mb-4 flex h-16 w-16 items-center justify-center rounded-xl ${card.iconShell} shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                <Icon
                  name={card.icon as any}
                  size={32}
                  variant="solid"
                  className={card.iconColor}
                />
              </div>

              {/* Title */}
              <h3 className="text-xl font-heading font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {card.description}
              </p>

              {/* CTA */}
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary transition-colors duration-300 group-hover:bg-primary/10">
                <span>{card.ctaLabel}</span>
                <Icon name="ArrowRightIcon" size={16} variant="outline" className="ml-2" />
              </div>

              {/* Hover Glow Effect */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-primary/15" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickAccessCards;
