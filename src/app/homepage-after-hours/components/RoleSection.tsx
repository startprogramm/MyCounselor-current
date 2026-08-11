'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useReveal } from '../useReveal';

interface Desk {
  label: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: string;
}

const DESKS: Desk[] = [
  {
    label: "Student's desk",
    title: 'Everything you’re working toward',
    description:
      'Goals, essay feedback, upcoming meetings, and messages — one place to see what’s next instead of five open tabs.',
    href: '/auth/signup/student',
    cta: 'Open the student view',
    icon: 'AcademicCapIcon',
  },
  {
    label: "Counselor's desk",
    title: 'A caseload you can actually see',
    description:
      'Every student’s goals and requests in one queue, with quick ways to message, schedule, and follow up before things slip.',
    href: '/auth/signup/counselor',
    cta: 'Open the counselor view',
    icon: 'UserGroupIcon',
  },
  {
    label: "Teacher's desk",
    title: 'Recommendation letters, without the scramble',
    description:
      'See exactly what each student needs, draft on the platform with AI-assisted first drafts, and send it straight through.',
    href: '/auth/signup/teacher',
    cta: 'Open the teacher view',
    icon: 'PencilSquareIcon',
  },
  {
    label: "Parent's desk",
    title: 'Real progress, not guesses at dinner',
    description:
      'Linked to your child’s account only after they confirm it and the counselor approves — then you see what’s actually happening.',
    href: '/auth/signup/parent',
    cta: 'Open the parent view',
    icon: 'HomeIcon',
  },
];

const RoleSection = () => {
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section id="desks" ref={ref} className="ah-night-2 py-24">
      <div className={`ah-reveal mx-auto max-w-6xl px-6 ${visible ? 'ah-visible' : ''}`}>
        <div className="max-w-xl">
          <p className="ah-mono text-[12px] text-[var(--ah-lamp)]">One room, four desks</p>
          <h2 className="mt-4 text-4xl">Everyone works from the same file.</h2>
          <p className="mt-4 text-lg leading-relaxed text-[var(--ah-paper)]/72">
            Not four separate apps pretending to talk to each other — four views into one shared
            record, scoped to what each person is actually allowed to see.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {DESKS.map((desk) => (
            <Link
              key={desk.title}
              href={desk.href}
              className="ah-card ah-card-dark ah-focus group flex flex-col justify-between p-8"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="ah-badge ah-badge-lamp h-12 w-12">
                    <Icon name={desk.icon} size={22} variant="solid" />
                  </span>
                  <span className="ah-mono text-[10px] text-[var(--ah-paper)]/40">{desk.label}</span>
                </div>
                <h3 className="mt-5 text-2xl">{desk.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--ah-paper)]/68">
                  {desk.description}
                </p>
              </div>
              <div className="ah-link mt-8 inline-flex w-fit items-center gap-2 text-sm font-semibold text-[var(--ah-lamp)]">
                {desk.cta}
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

export default RoleSection;
