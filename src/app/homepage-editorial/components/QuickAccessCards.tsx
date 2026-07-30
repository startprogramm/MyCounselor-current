'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface RoleCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  ctaLabel: string;
  filled?: boolean;
}

const QuickAccessCards = () => {
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

  const roles: RoleCard[] = [
    {
      id: '01',
      title: 'Student Portal',
      description: 'Track goals, view recommendations, and keep every appointment in one place.',
      icon: 'AcademicCapIcon',
      href: '/student-portal-dashboard',
      ctaLabel: 'Open student view',
      filled: true,
    },
    {
      id: '02',
      title: 'Counselor Desk',
      description: 'Coordinate caseloads, prioritize outreach, and move between messages and plans.',
      icon: 'UserGroupIcon',
      href: '/counselor-command-center',
      ctaLabel: 'Open counselor view',
    },
    {
      id: '03',
      title: 'Family Resources',
      description: 'Access trusted guidance materials and stay aligned with school plans.',
      icon: 'HomeIcon',
      href: '/resource-discovery-center',
      ctaLabel: 'Explore family resources',
    },
    {
      id: '04',
      title: 'Communication Hub',
      description: 'Use secure, FERPA-aligned messaging to keep conversations organized.',
      icon: 'ChatBubbleLeftEllipsisIcon',
      href: '/secure-communication-hub',
      ctaLabel: 'Enter communication hub',
    },
  ];

  return (
    <section id="roles" ref={sectionRef} className="relative bg-[var(--ed-paper)] py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className={`mb-14 max-w-xl ed-animate ${isVisible ? 'ed-visible' : ''}`}>
          <h2 className="ed-display text-3xl font-bold uppercase sm:text-4xl">Choose Your Path</h2>
          <p className="mt-3 text-lg text-[rgba(17,17,16,0.65)]">
            Each role opens straight to the workflow it actually needs.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role, index) => (
            <Link
              key={role.id}
              href={role.href}
              className={`group flex flex-col justify-between p-6 transition-transform duration-300 hover:-translate-y-1.5 ed-animate ed-delay-${Math.min(index + 1, 5)} ${isVisible ? 'ed-visible' : ''} ${
                role.filled
                  ? 'bg-[var(--ed-orange)] text-[var(--ed-paper)]'
                  : 'border border-[var(--ed-ink)] bg-[var(--ed-white)] text-[var(--ed-ink)]'
              }`}
            >
              <div>
                <div className="mb-8 flex items-center justify-between">
                  <span className="ed-display text-2xl font-extrabold">{role.id}</span>
                  <Icon name={role.icon as any} size={22} variant="outline" />
                </div>
                <h3 className="ed-display mb-2 text-xl font-bold">{role.title}</h3>
                <p className={`text-sm leading-relaxed ${role.filled ? 'text-[rgba(239,236,228,0.85)]' : 'text-[rgba(17,17,16,0.65)]'}`}>
                  {role.description}
                </p>
              </div>
              <div className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold">
                {role.ctaLabel}
                <Icon name="ArrowUpRightIcon" size={15} variant="outline" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickAccessCards;
