'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const CHECKLIST = [
  { label: 'Reply to Dr. Wang about the essay draft', done: true },
  { label: 'Finish Common App activities list', done: false },
  { label: 'Confirm Thursday, 10:00 AM with Ms. Yılmaz', done: false },
];

function useLocalClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date());
    setTime(format());
    const id = setInterval(() => setTime(format()), 30_000);
    return () => clearInterval(id);
  }, []);

  return time;
}

const HeroSection = () => {
  const time = useLocalClock();

  return (
    <section className="ah-night relative overflow-hidden pb-24 pt-16 sm:pt-20">
      <div className="ah-glow ah-glow-tight ah-lamp-on -left-40 -top-40" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-6 lg:grid-cols-[1.05fr,0.95fr]">
        <div>
          <div className="ah-mono inline-flex items-center gap-2 rounded-full border border-[var(--ah-line-dark)] px-3 py-1.5 text-[11px] text-[var(--ah-paper)]/70">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--ah-lamp)]" />
            {time ? `It's ${time} where you are — still open` : 'Still open, whatever time it is'}
          </div>

          <h1 className="mt-7 text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
            The light&apos;s still on
            <span className="ah-display block italic text-[var(--ah-lamp)]">
              at every desk that matters.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--ah-paper)]/78">
            Applications don&apos;t keep office hours. Between a student&apos;s midnight essay draft
            and a counselor&apos;s early inbox, MyCounselor keeps everyone — student, counselor,
            teacher, and parent — working from the same file, whenever they get to their desk.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link href="/auth/signup/student" className="ah-btn ah-btn-lamp ah-focus">
              <Icon name="AcademicCapIcon" size={18} variant="solid" />
              Start as a student
            </Link>
            <Link href="/auth/signup/counselor" className="ah-btn ah-btn-outline-dark ah-focus">
              <Icon name="UserGroupIcon" size={18} variant="outline" />
              Start as a counselor
            </Link>
          </div>

          <p className="ah-mono mt-10 text-[11px] text-[var(--ah-paper)]/45">
            Built with a real school counselor — Presidential School, Gulistan
          </p>
        </div>

        <div className="relative hidden lg:block">
          <div className="ah-glow ah-glow-tight -right-24 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <div className="ah-card ah-card-dark relative p-7">
            <div className="flex items-center justify-between">
              <p className="ah-mono text-[11px] text-[var(--ah-paper)]/55">Tonight&apos;s desk</p>
              <span className="ah-mono text-[11px] text-[var(--ah-lamp)]">{time ?? '—:—'}</span>
            </div>
            <ul className="mt-6 space-y-4">
              {CHECKLIST.map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border ${
                      item.done
                        ? 'border-[var(--ah-lamp)] bg-[var(--ah-lamp)]/20 text-[var(--ah-lamp)]'
                        : 'border-[var(--ah-line-dark)] text-transparent'
                    }`}
                  >
                    <Icon name="CheckIcon" size={12} variant="solid" />
                  </span>
                  <span
                    className={`text-[15px] leading-snug ${
                      item.done ? 'text-[var(--ah-paper)]/45 line-through' : 'text-[var(--ah-paper)]/90'
                    }`}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex items-center gap-2 border-t border-[var(--ah-line-dark)] pt-5 text-[13px] text-[var(--ah-paper)]/55">
              <span className="ah-dot h-1.5 w-1.5 bg-[var(--ah-teal)]" />
              Ms. Yılmaz is online
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
