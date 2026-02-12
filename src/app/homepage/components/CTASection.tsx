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
      className={`relative overflow-hidden bg-gradient-to-r from-[#1D4F80] via-[#1A73E8] to-[#1E8E3E] py-16 text-white lg:py-24 ${className}`}
    >
      <div className="absolute inset-0 bg-campus-grid opacity-20" />

      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-float-delayed"></div>
        <div className="absolute right-1/3 top-1/3 h-56 w-56 rounded-full bg-[#EA8600]/20 blur-3xl animate-drift"></div>
      </div>

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {/* Badge */}
        <div
          className={`mb-6 inline-flex items-center space-x-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm animate-on-scroll ${isVisible ? 'animate-visible' : ''}`}
        >
          <Icon name="RocketLaunchIcon" size={16} variant="solid" className="text-[#F4A261]" />
          <span>Start Your Counseling Rollout</span>
        </div>

        {/* Heading */}
        <h2
          className={`text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-6 animate-on-scroll stagger-1 ${isVisible ? 'animate-visible' : ''}`}
        >
          Ready to Transform Your Counseling Experience?
        </h2>

        {/* Description */}
        <p
          className={`text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed animate-on-scroll stagger-2 ${isVisible ? 'animate-visible' : ''}`}
        >
          Launch with a student-friendly portal, counselor-ready workflows, and secure communication from day one.
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-on-scroll stagger-3 ${isVisible ? 'animate-visible' : ''}`}
        >
          <Link
            href="/auth/signup/student"
            className="group inline-flex w-full items-center justify-center space-x-2 rounded-lg bg-white px-8 py-4 text-base font-heading font-semibold text-[#1D4F80] shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white/90 hover:shadow-xl sm:w-auto focus-ring"
          >
            <Icon name="AcademicCapIcon" size={20} variant="solid" className="group-hover:rotate-12 transition-transform" />
            <span>Get Started as Student</span>
          </Link>

          <Link
            href="/auth/signup/counselor"
            className="group inline-flex w-full items-center justify-center space-x-2 rounded-lg border border-white/35 bg-white/10 px-8 py-4 text-base font-heading font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 sm:w-auto focus-ring"
          >
            <Icon name="UserGroupIcon" size={20} variant="outline" className="group-hover:scale-110 transition-transform" />
            <span>Counselor Access</span>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div
          className={`flex flex-wrap items-center justify-center gap-3 text-sm animate-on-scroll stagger-4 ${isVisible ? 'animate-visible' : ''}`}
        >
          <div className="flex items-center space-x-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
            <Icon name="CheckCircleIcon" size={20} variant="solid" className="text-[#2A9D8F]" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center space-x-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
            <Icon name="ShieldCheckIcon" size={20} variant="solid" className="text-[#2A9D8F]" />
            <span>FERPA compliant</span>
          </div>
          <div className="flex items-center space-x-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
            <Icon name="ClockIcon" size={20} variant="solid" className="text-[#2A9D8F]" />
            <span>Rapid onboarding support</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
