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
  userType: string;
  ctaLabel: string;
  dot: 'lt-dot-blue' | 'lt-dot-gold';
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
      userType: 'For Students',
      ctaLabel: 'Open Student View',
      dot: 'lt-dot-blue',
    },
    {
      id: 2,
      title: 'Counselor Center',
      description:
        'Coordinate caseloads, prioritize outreach, and move quickly between messaging and planning.',
      icon: 'UserGroupIcon',
      href: '/counselor-command-center',
      userType: 'For Counselors',
      ctaLabel: 'Open Counselor View',
      dot: 'lt-dot-blue',
    },
    {
      id: 3,
      title: 'Parent Resources',
      description:
        'Access trusted guidance materials and stay aligned with school plans and student milestones.',
      icon: 'HomeIcon',
      href: '/resource-discovery-center',
      userType: 'For Families',
      ctaLabel: 'Explore Family Resources',
      dot: 'lt-dot-gold',
    },
    {
      id: 4,
      title: 'Communication Hub',
      description:
        'Use secure FERPA-aligned messaging to keep important conversations organized and actionable.',
      icon: 'ChatBubbleLeftEllipsisIcon',
      href: '/secure-communication-hub',
      userType: 'For Everyone',
      ctaLabel: 'Enter Communication Hub',
      dot: 'lt-dot-gold',
    },
  ];

  return (
    <section id="roles" ref={sectionRef} className={`bg-[var(--lt-paper)] py-24 ${className}`}>
      <div className={`lt-reveal mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 ${isVisible ? 'lt-visible' : ''}`}>
        <div className="max-w-xl">
          <p className="lt-mono text-[12px] text-[var(--lt-blue)]">Who this letter is for</p>
          <h2 className="mt-4 text-4xl">Choose Your Path</h2>
          <p className="mt-4 text-lg leading-relaxed text-[var(--lt-ink-soft)]">
            Each experience is designed around the workflows people actually use every day in
            school communities.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {accessCards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="lt-card lt-focus group flex flex-col justify-between p-8"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`lt-dot ${card.dot} h-12 w-12`}>
                    <Icon name={card.icon} size={22} variant="solid" />
                  </span>
                  <span className="lt-mono text-[10px] text-[var(--lt-ink-soft)]">{card.userType}</span>
                </div>
                <h3 className="mt-6 text-2xl">{card.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--lt-ink-soft)]">
                  {card.description}
                </p>
              </div>
              <div className="lt-link mt-8 inline-flex w-fit items-center gap-2 text-sm font-semibold text-[var(--lt-blue)]">
                {card.ctaLabel}
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickAccessCards;
