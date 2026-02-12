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
      description: 'Track goals, view recommendations, and keep every appointment in one personalized space.',
      icon: 'AcademicCapIcon',
      href: '/student-portal-dashboard',
      iconShell: 'bg-primary/15 dark:bg-primary/25',
      iconColor: 'text-primary dark:text-[#8AB4F8]',
      accentBar: 'from-primary to-[#4285F4]',
      userType: 'For Students',
      ctaLabel: 'Open Student View'
    },
    {
      id: 2,
      title: 'Counselor Center',
      description: 'Coordinate caseloads, prioritize outreach, and move quickly between messaging and planning.',
      icon: 'UserGroupIcon',
      href: '/counselor-command-center',
      iconShell: 'bg-secondary/15 dark:bg-secondary/25',
      iconColor: 'text-secondary dark:text-[#81C995]',
      accentBar: 'from-secondary to-[#2A9D8F]',
      userType: 'For Counselors',
      ctaLabel: 'Open Counselor View'
    },
    {
      id: 3,
      title: 'Parent Resources',
      description: 'Access trusted guidance materials and stay aligned with school plans and student milestones.',
      icon: 'HomeIcon',
      href: '/resource-discovery-center',
      iconShell: 'bg-accent/15 dark:bg-accent/25',
      iconColor: 'text-accent dark:text-[#FDD663]',
      accentBar: 'from-accent to-[#FBBC04]',
      userType: 'For Families',
      ctaLabel: 'Explore Family Resources'
    },
    {
      id: 4,
      title: 'Communication Hub',
      description: 'Use secure FERPA-aligned messaging to keep important conversations organized and actionable.',
      icon: 'ChatBubbleLeftEllipsisIcon',
      href: '/secure-communication-hub',
      iconShell: 'bg-[#185ABC]/15 dark:bg-[#185ABC]/35',
      iconColor: 'text-[#185ABC] dark:text-[#8AB4F8]',
      accentBar: 'from-[#185ABC] to-primary',
      userType: 'For Everyone',
      ctaLabel: 'Enter Communication Hub'
    }
  ];

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden bg-background py-16 lg:py-24 dark:bg-slate-900 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-campus-grid opacity-25" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5 dark:from-primary/10 dark:via-transparent dark:to-secondary/10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-12 animate-on-scroll ${isVisible ? 'animate-visible' : ''}`}
        >
          <div className="mb-4 inline-flex items-center space-x-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary dark:bg-primary/20">
            <Icon name="Squares2X2Icon" size={16} variant="solid" />
            <span>Role-Based Entry Points</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            Choose Your Path
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Each experience is designed around the workflows people actually use every day in school communities.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {accessCards.map((card, index) => (
            <Link
              key={card.id}
              href={card.href}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-brand-lg focus-ring dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-primary/50 animate-on-scroll-scale stagger-${Math.min(index + 1, 6)} ${isVisible ? 'animate-visible' : ''}`}
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accentBar}`} />

              {/* Badge */}
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground dark:bg-slate-700">
                  {card.userType}
                </span>
              </div>

              {/* Icon */}
              <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-xl ${card.iconShell} shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <Icon name={card.icon as any} size={32} variant="solid" className={card.iconColor} />
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
              <div className="flex items-center text-primary font-medium text-sm group-hover:translate-x-2 transition-transform duration-300">
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
