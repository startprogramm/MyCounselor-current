'use client';

import React from 'react';
import Link from 'next/link';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface CTASectionProps {
  className?: string;
}

const CTASection = ({ className = '' }: CTASectionProps) => {
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

  return (
    <section ref={sectionRef} className={`bg-[var(--lt-blue)] py-24 ${className}`}>
      <div
        className={`lt-reveal mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8 ${isVisible ? 'lt-visible' : ''}`}
      >
        <p className="lt-mono text-[12px] text-white/75">Start Your Counseling Rollout</p>
        <h2 className="mt-4 text-4xl text-white sm:text-5xl">
          Ready to Transform Your Counseling Experience?
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-white/80">
          Launch with a student-friendly portal, counselor-ready workflows, and secure
          communication from day one.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/auth/signup/student"
            className="lt-btn lt-btn-solid lt-focus w-full sm:w-auto"
          >
            Get Started as Student
          </Link>
          <Link
            href="/auth/signup/counselor"
            className="lt-btn lt-btn-white-outline lt-focus w-full sm:w-auto"
          >
            Counselor Access
          </Link>
        </div>

        {/* Sign here — a literal signature line, the letter's final flourish */}
        <div className="mx-auto mt-14 max-w-xs">
          <p className="lt-script text-3xl text-white">Yours, MyCounselor</p>
          <div className="mt-2 h-px bg-white/30" />
          <p className="lt-mono mt-2 text-[10px] text-white/50">Sign here to begin</p>
        </div>

        <div className="lt-mono mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-white/60">
          <span>No credit card required</span>
          <span>FERPA compliant</span>
          <span>Rapid onboarding support</span>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
