'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface HeroSectionProps {
  className?: string;
}

const STEP_INTERVAL = 5200;
const TYPE_SPEED = 45;

interface Step {
  addressee: string;
  body: string;
}

const STEPS: Step[] = [
  {
    addressee: 'Student',
    body: 'Track your goals, message your counselor, and keep every deadline in view — all in one calm, organized place.',
  },
  {
    addressee: 'Counselor',
    body: 'Coordinate your caseload, prioritize outreach, and move between messaging and planning without missing a beat.',
  },
  {
    addressee: 'Parent',
    body: 'Stay close to the journey. See real progress, and stay aligned with the school’s plan for your child.',
  },
  {
    addressee: 'Everyone',
    body: 'Secure, FERPA-aligned messaging keeps every important conversation organized, private, and easy to find.',
  },
];

const HeroSection = ({ className = '' }: HeroSectionProps) => {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Type out "Dear {addressee}," whenever the active step changes.
  useEffect(() => {
    const full = `Dear ${STEPS[index].addressee},`;
    if (reducedMotion.current) {
      setTyped(full);
      return;
    }
    setTyped('');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(id);
      }
    }, TYPE_SPEED);
    return () => clearInterval(id);
  }, [index]);

  // Advance to the next addressee, re-armed on every change.
  useEffect(() => {
    const id = setTimeout(() => setIndex((i) => (i + 1) % STEPS.length), STEP_INTERVAL);
    return () => clearTimeout(id);
  }, [index]);

  const active = STEPS[index];

  return (
    <section id="main-content" className={`bg-[var(--lt-paper-alt)] py-20 lg:py-28 ${className}`}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <p className="lt-mono mb-6 text-center text-[12px] text-[var(--lt-ink-soft)]">
          Compassion-first counseling platform
        </p>

        <div className="lt-letter p-8 sm:p-14">
          <div className="flex items-start justify-between">
            <span className="lt-mono text-[11px] text-[var(--lt-ink-soft)]">
              Ref. MC&ndash;{new Date().getFullYear()}
            </span>
            <span className="lt-seal h-14 w-14 sm:h-16 sm:w-16">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3 2 8l10 5 8-4.36V15h1.5V8L12 3Z" fill="#fff" />
                <path
                  d="M6 12.18v3.6C6 17.5 8.69 19 12 19s6-1.5 6-3.22v-3.6l-6 3.09-6-3.09Z"
                  fill="#fff"
                  opacity="0.8"
                />
              </svg>
            </span>
          </div>

          <h1 className="mt-8 min-h-[1.2em] text-4xl text-[var(--lt-ink)] sm:text-5xl">
            {typed}
            <span className="lt-cursor h-[1em] translate-y-[0.15em]" aria-hidden="true" />
          </h1>

          <p
            key={index}
            className="lt-fade-enter mt-6 max-w-xl text-lg leading-relaxed text-[var(--lt-ink-soft)]"
          >
            {active.body}
          </p>

          <p className="lt-script mt-8 text-3xl text-[var(--lt-blue)]">
            &mdash; The MyCounselor Team
          </p>

          <div className="mt-8 flex gap-2">
            {STEPS.map((step, i) => (
              <button
                key={step.addressee}
                type="button"
                aria-label={`Read the letter to ${step.addressee}`}
                onClick={() => setIndex(i)}
                className="lt-focus rounded-full p-1.5"
              >
                <span
                  className={`block h-1.5 w-1.5 rounded-full transition-colors ${i === index ? 'bg-[var(--lt-blue)]' : 'bg-[var(--lt-ink-soft)]/25'}`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/auth/signup/student"
            className="lt-btn lt-btn-blue lt-focus w-full sm:w-auto"
          >
            Start as Student
          </Link>
          <Link
            href="/auth/signup/counselor"
            className="lt-btn lt-btn-outline lt-focus w-full sm:w-auto"
          >
            Start as Counselor
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {['FERPA compliant', 'SSL secured'].map((label) => (
            <span
              key={label}
              className="lt-mono flex items-center gap-2 text-[11px] text-[var(--lt-ink-soft)]"
            >
              <span className="h-1 w-1 rounded-full bg-[var(--lt-blue)]" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
