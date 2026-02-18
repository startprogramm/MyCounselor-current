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
  badgeCls: string;
  ctaCls: string;
  hoverBorder: string;
  glowCls: string;
  cardAccentBg: string;
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
      iconShell: 'bg-[#1A73E8]',
      iconColor: 'text-white',
      accentBar: 'from-[#1A73E8] to-[#4285F4]',
      userType: 'For Students',
      ctaLabel: 'Open Student View',
      badgeCls: 'text-[#1A73E8] bg-[#1A73E8]/10 border-[#1A73E8]/25',
      ctaCls: 'text-[#1A73E8] bg-[#1A73E8]/10 border-[#1A73E8]/25 group-hover:bg-[#1A73E8]/20',
      hoverBorder: 'hover:border-[#1A73E8]/70',
      glowCls: 'from-[#1A73E8]/8 to-[#4285F4]/5',
      cardAccentBg: 'group-hover:bg-[#1A73E8]/4',
    },
    {
      id: 2,
      title: 'Counselor Center',
      description:
        'Coordinate caseloads, prioritize outreach, and move quickly between messaging and planning.',
      icon: 'UserGroupIcon',
      href: '/counselor-command-center',
      iconShell: 'bg-[#1E8E3E]',
      iconColor: 'text-white',
      accentBar: 'from-[#1E8E3E] to-[#34A853]',
      userType: 'For Counselors',
      ctaLabel: 'Open Counselor View',
      badgeCls: 'text-[#1E8E3E] bg-[#1E8E3E]/10 border-[#1E8E3E]/25',
      ctaCls: 'text-[#1E8E3E] bg-[#1E8E3E]/10 border-[#1E8E3E]/25 group-hover:bg-[#1E8E3E]/20',
      hoverBorder: 'hover:border-[#1E8E3E]/70',
      glowCls: 'from-[#1E8E3E]/8 to-[#34A853]/5',
      cardAccentBg: 'group-hover:bg-[#1E8E3E]/4',
    },
    {
      id: 3,
      title: 'Parent Resources',
      description:
        'Access trusted guidance materials and stay aligned with school plans and student milestones.',
      icon: 'HomeIcon',
      href: '/resource-discovery-center',
      iconShell: 'bg-rose-500',
      iconColor: 'text-white',
      accentBar: 'from-rose-500 to-rose-400',
      userType: 'For Families',
      ctaLabel: 'Explore Family Resources',
      badgeCls: 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/25',
      ctaCls: 'text-rose-600 bg-rose-50 border-rose-200 group-hover:bg-rose-100 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/25 dark:group-hover:bg-rose-500/20',
      hoverBorder: 'hover:border-rose-400/70',
      glowCls: 'from-rose-500/8 to-rose-400/5',
      cardAccentBg: 'group-hover:bg-rose-500/4',
    },
    {
      id: 4,
      title: 'Communication Hub',
      description:
        'Use secure FERPA-aligned messaging to keep important conversations organized and actionable.',
      icon: 'ChatBubbleLeftEllipsisIcon',
      href: '/secure-communication-hub',
      iconShell: 'bg-[#EA8600]',
      iconColor: 'text-white',
      accentBar: 'from-[#EA8600] to-[#FBBC04]',
      userType: 'For Everyone',
      ctaLabel: 'Enter Communication Hub',
      badgeCls: 'text-[#EA8600] bg-[#EA8600]/10 border-[#EA8600]/25',
      ctaCls: 'text-[#EA8600] bg-[#EA8600]/10 border-[#EA8600]/25 group-hover:bg-[#EA8600]/20',
      hoverBorder: 'hover:border-[#EA8600]/70',
      glowCls: 'from-[#EA8600]/8 to-[#FBBC04]/5',
      cardAccentBg: 'group-hover:bg-[#EA8600]/4',
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
              className={`group relative overflow-hidden rounded-[1.4rem] border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl focus-ring dark:border-slate-700 dark:bg-slate-800/70 ${card.hoverBorder} animate-on-scroll-scale stagger-${Math.min(index + 1, 6)} ${isVisible ? 'animate-visible' : ''}`}
            >
              {/* Accent bar — thicker and fully opaque */}
              <div
                className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${card.accentBar}`}
              />

              {/* Badge */}
              <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${card.badgeCls}`}>
                  {card.userType}
                </span>
              </div>

              {/* Icon — solid colored background, white icon */}
              <div
                className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${card.iconShell} shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                <Icon
                  name={card.icon as any}
                  size={32}
                  variant="solid"
                  className={card.iconColor}
                />
              </div>

              {/* Title */}
              <h3 className="text-xl font-heading font-bold text-foreground mb-2 transition-colors">
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                {card.description}
              </p>

              {/* CTA */}
              <div className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors duration-300 ${card.ctaCls}`}>
                <span>{card.ctaLabel}</span>
                <Icon name="ArrowRightIcon" size={16} variant="outline" className="ml-2 group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* Hover Glow Effect */}
              <div className={`pointer-events-none absolute inset-0 rounded-[1.4rem] bg-gradient-to-br ${card.glowCls} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickAccessCards;
