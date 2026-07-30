'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const CTASection = () => {
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.2 });

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[var(--rd-ink)] py-20 text-[var(--rd-paper)] lg:py-28">
      <div className="rd-grain opacity-30" />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <div
          className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[var(--rd-seal-bright)] text-[var(--rd-seal-bright)] rd-animate ${isVisible ? 'rd-visible' : ''}`}
        >
          <Icon name="RocketLaunchIcon" size={26} variant="solid" />
        </div>

        <h2
          className={`rd-display mb-5 text-3xl font-semibold sm:text-4xl lg:text-5xl rd-animate rd-delay-1 ${isVisible ? 'rd-visible' : ''}`}
        >
          Ready to open a file?
        </h2>

        <p
          className={`mx-auto mb-9 max-w-xl text-lg leading-relaxed text-[rgba(251,249,244,0.75)] rd-animate rd-delay-2 ${isVisible ? 'rd-visible' : ''}`}
        >
          A student-friendly portal, counselor-ready workflows, and secure messaging — set up for
          your school from day one.
        </p>

        <div
          className={`mb-9 flex flex-col items-center justify-center gap-3 sm:flex-row rd-animate rd-delay-3 ${isVisible ? 'rd-visible' : ''}`}
        >
          <Link
            href="/auth/signup/student"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--rd-seal)] px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-colors hover:bg-[var(--rd-seal-bright)] sm:w-auto focus-ring"
          >
            <Icon name="AcademicCapIcon" size={19} variant="solid" />
            Get started as student
          </Link>
          <Link
            href="/auth/signup/counselor"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border rd-hairline-light px-7 py-3.5 text-base font-semibold text-[var(--rd-paper)] transition-colors hover:bg-white/10 sm:w-auto focus-ring"
          >
            <Icon name="UserGroupIcon" size={19} variant="outline" />
            Counselor access
          </Link>
        </div>

        <div
          className={`flex flex-wrap items-center justify-center gap-2.5 text-xs rd-animate rd-delay-4 ${isVisible ? 'rd-visible' : ''}`}
        >
          {['No credit card required', 'FERPA compliant', 'Rapid onboarding support'].map((t) => (
            <span
              key={t}
              className="rd-mono inline-flex items-center gap-1.5 rounded-full border border-dashed rd-hairline-light px-3 py-1.5 uppercase tracking-[0.06em] text-[rgba(251,249,244,0.7)]"
            >
              <Icon name="CheckCircleIcon" size={14} variant="solid" className="text-[var(--rd-cambridge)]" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTASection;
