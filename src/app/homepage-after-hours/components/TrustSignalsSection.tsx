'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { useReveal } from '../useReveal';

interface Signal {
  title: string;
  description: string;
  icon: string;
}

const SIGNALS: Signal[] = [
  {
    title: 'Every account is approved by a real counselor',
    description:
      'No one signs up and starts reading student records unchecked — the first counselor at a school approves everyone who joins after.',
    icon: 'CheckBadgeIcon',
  },
  {
    title: 'Parent access needs two confirmations',
    description:
      'A parent links to a student by name, the student confirms it, then the counselor approves it. Nothing is visible before both happen.',
    icon: 'LinkIcon',
  },
  {
    title: 'Data stays inside your school',
    description:
      'Every record is scoped to the school it belongs to at the database level — not just hidden in the interface.',
    icon: 'BuildingLibraryIcon',
  },
  {
    title: 'Access follows the role, not the account',
    description:
      'A teacher sees what a teacher needs to see; a parent sees only their own child. That boundary is enforced the same way everywhere.',
    icon: 'LockClosedIcon',
  },
];

const TrustSignalsSection = () => {
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section id="trust" ref={ref} className="ah-cream py-24">
      <div
        className={`ah-reveal mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[0.9fr,1.1fr] lg:items-start ${visible ? 'ah-visible' : ''}`}
      >
        <div className="ah-card ah-card-light bg-white p-8 lg:sticky lg:top-28">
          <span className="ah-badge ah-badge-ink h-12 w-12">
            <Icon name="ShieldCheckIcon" size={22} variant="solid" />
          </span>
          <p className="ah-mono mt-5 text-[12px] text-[var(--ah-lamp-deep)]">Kept quiet</p>
          <h2 className="mt-3 text-3xl">Built for records that shouldn&apos;t travel.</h2>
          <p className="mt-4 text-lg leading-relaxed text-[var(--ah-ink)]/68">
            A student&apos;s file — goals, essays, meetings, messages — is not something that
            should end up in the wrong inbox. The access rules are enforced where the data lives,
            not just in what the screen shows.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {SIGNALS.map((signal) => (
            <div key={signal.title} className="ah-card ah-card-light p-7">
              <span className="ah-badge ah-badge-ink h-11 w-11">
                <Icon name={signal.icon} size={20} variant="solid" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{signal.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ah-ink)]/62">
                {signal.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSignalsSection;
