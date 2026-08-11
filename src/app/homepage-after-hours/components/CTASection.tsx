'use client';

import React from 'react';
import Link from 'next/link';
import { useReveal } from '../useReveal';

const CTASection = () => {
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="ah-sun py-24">
      <div className={`ah-reveal mx-auto max-w-3xl px-6 text-center ${visible ? 'ah-visible' : ''}`}>
        <p className="ah-mono text-[12px] text-[var(--ah-ink-deep)]/60">Morning.</p>
        <h2 className="mt-4 text-4xl sm:text-5xl">
          The file&apos;s still there. So is everyone in it.
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-[var(--ah-ink-deep)]/72">
          Start with the role that&apos;s yours — the rest of the room is already working.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/auth/signup/student" className="ah-btn ah-btn-ink ah-focus w-full sm:w-auto">
            Start as a student
          </Link>
          <Link href="/auth/signup/counselor" className="ah-btn ah-btn-outline-light ah-focus w-full sm:w-auto">
            Start as a counselor
          </Link>
        </div>

        <p className="ah-mono mt-10 border-t border-[var(--ah-line-light)] pt-6 text-[11px] text-[var(--ah-ink-deep)]/55">
          One school today. Built to grow to more.
        </p>
      </div>
    </section>
  );
};

export default CTASection;
