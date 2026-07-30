'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const HeroSection = () => {
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

  return (
    <section
      ref={sectionRef}
      id="main-content"
      className="relative bg-[var(--ed-paper)]"
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 px-6 pb-14 lg:grid-cols-12 lg:gap-6 lg:px-10 lg:pb-0">
        {/* Left: headline + CTA */}
        <div className="flex flex-col justify-center lg:col-span-5 lg:py-16">
          <h1
            className={`ed-display text-[15vw] leading-[0.92] tracking-tight sm:text-6xl lg:text-[4.6vw] xl:text-[68px] ed-animate ${isVisible ? 'ed-visible' : ''}`}
          >
            Guide
            <br />
            Every
            <br />
            Student
          </h1>

          <p
            className={`mt-8 max-w-md text-lg leading-relaxed text-[rgba(17,17,16,0.7)] ed-animate ed-delay-1 ${isVisible ? 'ed-visible' : ''}`}
          >
            MyCounselor keeps goals, grades, meetings, and messages organized in one place —
            so every student gets guidance that actually fits them.
          </p>

          <div className={`mt-9 ed-animate ed-delay-2 ${isVisible ? 'ed-visible' : ''}`}>
            <Link
              href="/auth/signup/student"
              className="inline-flex items-center rounded-md bg-[var(--ed-ink)] px-7 py-4 text-base font-semibold text-[var(--ed-paper)] transition-opacity hover:opacity-85 focus-ring"
            >
              Start Learning Today
            </Link>
          </div>
        </div>

        {/* Middle: portrait photo with overlapping stat block */}
        <div className="relative lg:col-span-5">
          <div className="relative h-[420px] w-full overflow-hidden sm:h-[520px] lg:h-[640px]">
            <Image
              src="/homepage-editorial/hero-portrait.jpg"
              alt="Student smiling, wearing glasses and a denim jacket"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover object-[center_20%]"
              priority
            />
          </div>

          <div
            className={`absolute bottom-0 left-0 w-[220px] -translate-x-4 translate-y-6 bg-[var(--ed-orange)] p-6 text-[var(--ed-paper)] sm:w-[240px] ed-animate ed-delay-3 ${isVisible ? 'ed-visible' : ''}`}
          >
            <p className="ed-display text-4xl font-extrabold">500+</p>
            <p className="text-sm font-medium">School Communities</p>
            <p className="mt-4 text-sm leading-snug text-[rgba(239,236,228,0.85)]">
              Counselors, students, and families working from one shared record.
            </p>
          </div>
        </div>

        {/* Right margin: small copy + stat */}
        <div className="hidden flex-col justify-between py-16 lg:col-span-2 lg:flex">
          <p className={`text-base leading-snug text-[rgba(17,17,16,0.75)] ed-animate ed-delay-2 ${isVisible ? 'ed-visible' : ''}`}>
            students, counselors, and families in one school community.
          </p>
          <div className={`ed-animate ed-delay-4 ${isVisible ? 'ed-visible' : ''}`}>
            <p className="ed-display text-4xl font-extrabold">50K+</p>
            <p className="text-sm text-[rgba(17,17,16,0.6)]">Students Enrolled</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
