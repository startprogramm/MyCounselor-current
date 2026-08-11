'use client';

import React from 'react';
import { useReveal } from '../useReveal';

interface Tally {
  value: string;
  label: string;
  detail: string;
}

const TALLY: Tally[] = [
  {
    value: '1',
    label: 'school this started with',
    detail: 'Presidential School, Gulistan — where a real counselor said yes',
  },
  {
    value: '4',
    label: 'roles reading the same file',
    detail: 'Student, counselor, teacher, parent — no separate systems to reconcile',
  },
  {
    value: '2',
    label: 'confirmations before a parent sees anything',
    detail: 'The student confirms the link, then the counselor approves it',
  },
  {
    value: '0',
    label: 'spreadsheets to keep it straight',
    detail: 'No group chats, no paper folders, no “did you get my email”',
  },
];

const StatsSection = () => {
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="ah-dusk relative overflow-hidden py-24">
      <div className="ah-glow ah-glow-wide left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />

      <div className={`ah-reveal relative mx-auto max-w-6xl px-6 ${visible ? 'ah-visible' : ''}`}>
        <p className="ah-mono text-center text-[12px] text-[var(--ah-lamp)]">What&apos;s actually on the desk</p>
        <h2 className="mt-4 text-center text-3xl sm:text-4xl">
          Small numbers, on purpose.
        </h2>

        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {TALLY.map((item) => (
            <div key={item.label} className="border-t border-[var(--ah-line-dark)] pt-6">
              <span className="ah-display text-5xl italic text-[var(--ah-lamp)]">{item.value}</span>
              <p className="mt-3 text-[15px] font-medium leading-snug text-[var(--ah-paper)]/90">
                {item.label}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--ah-paper)]/55">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
