'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface RoleCard {
  id: number;
  title: string;
  tabLabel: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  ctaLabel: string;
}

const QuickAccessCards = () => {
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

  const roles: RoleCard[] = [
    {
      id: 1,
      title: 'Student Portal',
      tabLabel: 'For Students',
      description: 'Track goals, view recommendations, and keep every appointment in one file.',
      icon: 'AcademicCapIcon',
      href: '/student-portal-dashboard',
      color: '#1f6f5c',
      ctaLabel: 'Open student view',
    },
    {
      id: 2,
      title: 'Counselor Desk',
      tabLabel: 'For Counselors',
      description: 'Coordinate caseloads, prioritize outreach, and move between messages and plans.',
      icon: 'UserGroupIcon',
      href: '/counselor-command-center',
      color: '#b9862e',
      ctaLabel: 'Open counselor view',
    },
    {
      id: 3,
      title: 'Family Resources',
      tabLabel: 'For Families',
      description: 'Access trusted guidance materials and stay aligned with school plans.',
      icon: 'HomeIcon',
      href: '/resource-discovery-center',
      color: '#8b3a3a',
      ctaLabel: 'Explore family resources',
    },
    {
      id: 4,
      title: 'Communication Hub',
      tabLabel: 'For Everyone',
      description: 'Use secure, FERPA-aligned messaging to keep conversations organized.',
      icon: 'ChatBubbleLeftEllipsisIcon',
      href: '/secure-communication-hub',
      color: '#3e6e93',
      ctaLabel: 'Enter communication hub',
    },
  ];

  return (
    <section id="roles" ref={sectionRef} className="relative bg-[var(--rd-paper)] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`mb-14 max-w-2xl rd-animate ${isVisible ? 'rd-visible' : ''}`}>
          <p className="rd-mono mb-3 text-xs uppercase tracking-[0.16em] text-[rgba(20,33,61,0.5)]">
            02 — Role-based entry
          </p>
          <h2 className="rd-display text-3xl font-semibold text-[var(--rd-ink)] sm:text-4xl">
            Pick up the right folder
          </h2>
          <p className="mt-3 text-lg text-[rgba(20,33,61,0.65)]">
            Each role opens to the workflow it actually needs — nothing borrowed from a different
            job.
          </p>
        </div>

        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role, index) => (
            <Link
              key={role.id}
              href={role.href}
              className={`rd-tab group relative block rounded-xl border rd-hairline bg-white p-6 pt-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg rd-animate rd-delay-${Math.min(index + 1, 5)} ${isVisible ? 'rd-visible' : ''}`}
              style={{ background: `linear-gradient(180deg, ${role.color}0d, transparent 30%)` }}
            >
              <div
                className="rd-tab absolute inset-x-0 top-0 h-1.5 rounded-t-xl"
                style={{ background: role.color }}
              />
              <span
                className="rd-mono mb-4 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.1em]"
                style={{ background: `${role.color}1a`, color: role.color }}
              >
                {role.tabLabel}
              </span>
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
                style={{ background: role.color }}
              >
                <Icon name={role.icon as any} size={24} variant="solid" className="text-white" />
              </div>
              <h3 className="rd-display mb-2 text-lg font-semibold text-[var(--rd-ink)]">{role.title}</h3>
              <p className="mb-5 text-sm leading-relaxed text-[rgba(20,33,61,0.6)]">{role.description}</p>
              <div
                className="inline-flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: role.color }}
              >
                {role.ctaLabel}
                <Icon name="ArrowRightIcon" size={15} variant="outline" className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickAccessCards;
