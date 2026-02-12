'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface CTASectionProps {
  className?: string;
}

const CTASection = ({ className = '' }: CTASectionProps) => {
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden bg-primary py-16 text-primary-foreground lg:py-24 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10" />

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <div
          className={`mb-6 inline-flex items-center space-x-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium animate-on-scroll ${isVisible ? 'animate-visible' : ''}`}
        >
          <Icon name="RocketLaunchIcon" size={16} variant="solid" className="text-[#FDD663]" />
          <span>Start Your Counseling Rollout</span>
        </div>

        <h2
          className={`text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-6 animate-on-scroll stagger-1 ${isVisible ? 'animate-visible' : ''}`}
        >
          Ready to Transform Your Counseling Experience?
        </h2>

        <p
          className={`text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed animate-on-scroll stagger-2 ${isVisible ? 'animate-visible' : ''}`}
        >
          Launch with a student-friendly portal, counselor-ready workflows, and secure communication
          from day one.
        </p>

        <div
          className={`mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row animate-on-scroll stagger-3 ${isVisible ? 'animate-visible' : ''}`}
        >
          <Link
            href="/auth/signup/student"
            className="inline-flex w-full items-center justify-center space-x-2 rounded-full bg-white px-8 py-4 text-base font-heading font-semibold text-primary transition-colors hover:bg-white/90 sm:w-auto focus-ring"
          >
            <Icon name="AcademicCapIcon" size={20} variant="solid" />
            <span>Get Started as Student</span>
          </Link>

          <Link
            href="/auth/signup/counselor"
            className="inline-flex w-full items-center justify-center space-x-2 rounded-full border border-white/40 bg-transparent px-8 py-4 text-base font-heading font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto focus-ring"
          >
            <Icon name="UserGroupIcon" size={20} variant="outline" />
            <span>Counselor Access</span>
          </Link>
        </div>

        <div
          className={`flex flex-wrap items-center justify-center gap-3 text-sm animate-on-scroll stagger-4 ${isVisible ? 'animate-visible' : ''}`}
        >
          <div className="flex items-center space-x-2 rounded-full border border-white/25 bg-white/10 px-4 py-2">
            <Icon name="CheckCircleIcon" size={18} variant="solid" className="text-[#81C995]" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center space-x-2 rounded-full border border-white/25 bg-white/10 px-4 py-2">
            <Icon name="ShieldCheckIcon" size={18} variant="solid" className="text-[#81C995]" />
            <span>FERPA compliant</span>
          </div>
          <div className="flex items-center space-x-2 rounded-full border border-white/25 bg-white/10 px-4 py-2">
            <Icon name="ClockIcon" size={18} variant="solid" className="text-[#81C995]" />
            <span>Rapid onboarding support</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
