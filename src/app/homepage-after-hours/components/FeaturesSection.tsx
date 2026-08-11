'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { useReveal } from '../useReveal';

interface Feature {
  tag: string;
  title: string;
  description: string;
  icon: string;
}

const FEATURES: Feature[] = [
  {
    tag: 'AI essay coach',
    title: 'Feedback before you send it, not after',
    description:
      'Paste a draft, get structured notes on clarity, voice, and structure — a second read at 1 a.m. when no one else is awake to give one.',
    icon: 'PencilSquareIcon',
  },
  {
    tag: 'Chance estimator',
    title: 'A realistic read on where you stand',
    description:
      'Built from the student’s own academic profile, not a generic quiz — grounded numbers instead of forum guesswork.',
    icon: 'ChartBarIcon',
  },
  {
    tag: 'Goals',
    title: 'A checklist that outlives the semester',
    description:
      'Every goal a counselor and student agree on stays visible until it’s actually done, not buried in an old email thread.',
    icon: 'FlagIcon',
  },
  {
    tag: 'Messaging',
    title: 'One inbox, scoped to who should see it',
    description:
      'Student, counselor, teacher, and parent messages stay inside the same school record — nothing routed through personal accounts.',
    icon: 'ChatBubbleLeftRightIcon',
  },
  {
    tag: 'Scheduling',
    title: 'Meetings booked against real availability',
    description:
      'No back-and-forth over email — students book directly into the slots a counselor has actually opened up.',
    icon: 'CalendarDaysIcon',
  },
  {
    tag: 'Parent access',
    title: 'Verified before it’s visible',
    description:
      'A parent only sees a student’s record after the student confirms the link and the counselor approves it — never by default.',
    icon: 'ShieldCheckIcon',
  },
];

const FeaturesSection = () => {
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section id="features" ref={ref} className="ah-cream py-24">
      <div className={`ah-reveal mx-auto max-w-6xl px-6 ${visible ? 'ah-visible' : ''}`}>
        <div className="max-w-xl">
          <p className="ah-mono text-[12px] text-[var(--ah-lamp-deep)]">Within reach of the lamp</p>
          <h2 className="mt-4 text-4xl">What’s actually on the desk.</h2>
          <p className="mt-4 text-lg leading-relaxed text-[var(--ah-ink)]/68">
            Not a feature wishlist — the tools built for the parts of this process that are
            genuinely hard to keep track of.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="ah-card ah-card-light p-7">
              <div className="flex items-center justify-between">
                <span className="ah-badge ah-badge-ink h-12 w-12">
                  <Icon name={feature.icon} size={22} variant="solid" />
                </span>
                <span className="ah-mono text-[10px] text-[var(--ah-ink)]/45">{feature.tag}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--ah-ink)]/62">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
