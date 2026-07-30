'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const CTASection = () => {
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.2 });

  return (
    <section ref={sectionRef} className="relative bg-[var(--ed-orange)] py-20 text-[var(--ed-paper)] lg:py-28">
      <div className="mx-auto max-w-[1400px] px-6 text-center lg:px-10">
        <h2
          className={`ed-display mx-auto max-w-3xl text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl ed-animate ${isVisible ? 'ed-visible' : ''}`}
        >
          Ready to Transform Your Counseling Experience?
        </h2>

        <p
          className={`mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[rgba(239,236,228,0.9)] ed-animate ed-delay-1 ${isVisible ? 'ed-visible' : ''}`}
        >
          A student-friendly portal, counselor-ready workflows, and secure messaging — set up
          for your school from day one.
        </p>

        <div
          className={`mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row ed-animate ed-delay-2 ${isVisible ? 'ed-visible' : ''}`}
        >
          <Link
            href="/auth/signup/student"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--ed-ink)] px-7 py-4 text-base font-semibold text-[var(--ed-paper)] transition-opacity hover:opacity-85 sm:w-auto focus-ring"
          >
            <Icon name="AcademicCapIcon" size={19} variant="solid" />
            Get Started as Student
          </Link>
          <Link
            href="/auth/signup/counselor"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-[var(--ed-ink)] px-7 py-4 text-base font-semibold text-[var(--ed-ink)] transition-colors hover:bg-[var(--ed-ink)] hover:text-[var(--ed-paper)] sm:w-auto focus-ring"
          >
            <Icon name="UserGroupIcon" size={19} variant="outline" />
            Counselor Access
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
