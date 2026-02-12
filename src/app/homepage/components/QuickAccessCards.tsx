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
  cardTone: string;
  iconShell: string;
  accentBar: string;
  ctaTone: string;
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
      cardTone:
        'from-[#edf6ff] via-[#f7fbff] to-[#eaf3ff] dark:from-[#17304a]/80 dark:via-[#1c3856]/70 dark:to-[#1a3250]/80',
      iconShell: 'bg-gradient-to-br from-[#4f96da] to-[#73b1eb] text-white',
      accentBar: 'from-[#4f96da] to-[#73b1eb]',
      ctaTone: 'border-[#4f96da]/25 bg-[#4f96da]/10 text-[#2f6ea8] dark:text-[#9ec9f0]',
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
      cardTone:
        'from-[#eefaf6] via-[#f8fdfa] to-[#e8f7ef] dark:from-[#16392f]/75 dark:via-[#1a4336]/70 dark:to-[#183b31]/75',
      iconShell: 'bg-gradient-to-br from-[#49b28d] to-[#78d3b4] text-white',
      accentBar: 'from-[#49b28d] to-[#78d3b4]',
      ctaTone: 'border-[#49b28d]/30 bg-[#49b28d]/12 text-[#2d8d6b] dark:text-[#9fe6cb]',
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
      cardTone:
        'from-[#fff6ec] via-[#fffaf3] to-[#fff1df] dark:from-[#3f2e17]/70 dark:via-[#49351c]/70 dark:to-[#3b2a15]/70',
      iconShell: 'bg-gradient-to-br from-[#f3a34f] to-[#f7c36e] text-white',
      accentBar: 'from-[#f3a34f] to-[#f7c36e]',
      ctaTone: 'border-[#f3a34f]/30 bg-[#f3a34f]/12 text-[#ba6d1d] dark:text-[#ffd38f]',
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
      cardTone:
        'from-[#f1eeff] via-[#f8f5ff] to-[#ebe7ff] dark:from-[#2d2445]/70 dark:via-[#352b51]/70 dark:to-[#2b2340]/70',
      iconShell: 'bg-gradient-to-br from-[#7b79df] to-[#a7a4f3] text-white',
      accentBar: 'from-[#7b79df] to-[#a7a4f3]',
      ctaTone: 'border-[#7b79df]/30 bg-[#7b79df]/12 text-[#5552bf] dark:text-[#cbc9ff]',
      userType: 'For Everyone',
      ctaLabel: 'Enter Communication Hub',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden bg-vivid-wash py-16 lg:py-24 dark:bg-slate-900 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-campus-grid opacity-20" />
      <div className="pointer-events-none absolute -left-14 top-12 h-56 w-56 rounded-full bg-[#91c4ff]/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-4 h-60 w-60 rounded-full bg-[#9de2cb]/30 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-12 animate-on-scroll ${isVisible ? 'animate-visible' : ''}`}
        >
          <div className="mb-4 inline-flex items-center space-x-2 rounded-full border border-[#74aee5]/30 bg-white/85 px-4 py-2 text-sm font-medium text-[#2f6ea8] shadow-sm backdrop-blur-sm dark:border-primary/20 dark:bg-slate-800">
            <Icon name="Squares2X2Icon" size={16} variant="solid" />
            <span>Role-Based Entry Points</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            Choose Your Path
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300">
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
              className={`group relative overflow-hidden rounded-[1.4rem] border border-slate-200/80 bg-gradient-to-br ${card.cardTone} p-6 shadow-vivid transition-all duration-300 hover:-translate-y-1 hover:border-white/80 hover:shadow-[0_16px_30px_rgba(52,100,154,0.18)] focus-ring dark:border-slate-700 dark:hover:border-primary/50 animate-on-scroll-scale stagger-${Math.min(index + 1, 6)} ${isVisible ? 'animate-visible' : ''}`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r opacity-85 ${card.accentBar}`}
              />

              {/* Badge */}
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
                  {card.userType}
                </span>
              </div>

              {/* Icon */}
              <div
                className={`mb-4 flex h-16 w-16 items-center justify-center rounded-xl ${card.iconShell} shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                <Icon name={card.icon} size={32} variant="solid" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-heading font-bold text-[#1f4264] mb-2 transition-colors group-hover:text-[#214f79] dark:text-slate-100">
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed mb-4 text-slate-600 dark:text-slate-300">
                {card.description}
              </p>

              {/* CTA */}
              <div
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold transition-colors duration-300 ${card.ctaTone}`}
              >
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
