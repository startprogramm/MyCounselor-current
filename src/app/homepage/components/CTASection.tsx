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
      className={`py-16 lg:py-24 bg-gradient-to-br from-[#2D5A87] via-[#4A90B8] to-[#7BB3D1] dark:from-slate-900 dark:via-[#2D5A87] dark:to-[#4A90B8] text-white overflow-hidden relative ${className}`}
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div
          className={`inline-flex items-center space-x-2 glass rounded-full px-4 py-2 text-sm font-medium mb-6 animate-on-scroll ${isVisible ? 'animate-visible' : ''}`}
        >
          <Icon name="RocketLaunchIcon" size={16} variant="solid" className="text-[#F4A261]" />
          <span>Start Your Journey Today</span>
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
          Join thousands of students and counselors who have discovered the power of organized, accessible guidance. Your path to success starts here.
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-on-scroll stagger-3 ${isVisible ? 'animate-visible' : ''}`}
        >
          <Link
            href="/student-portal-dashboard"
            className="group inline-flex items-center justify-center space-x-2 bg-white text-[#2D5A87] px-8 py-4 rounded-lg font-heading font-semibold text-base hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto focus-ring"
          >
            <Icon name="AcademicCapIcon" size={20} variant="solid" className="group-hover:rotate-12 transition-transform" />
            <span>Get Started as Student</span>
          </Link>

          <Link
            href="/counselor-command-center"
            className="group inline-flex items-center justify-center space-x-2 glass text-white px-8 py-4 rounded-lg font-heading font-semibold text-base hover:bg-white/20 transition-all duration-300 w-full sm:w-auto focus-ring"
          >
            <Icon name="UserGroupIcon" size={20} variant="outline" className="group-hover:scale-110 transition-transform" />
            <span>Counselor Access</span>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div
          className={`flex flex-wrap justify-center items-center gap-6 text-sm animate-on-scroll stagger-4 ${isVisible ? 'animate-visible' : ''}`}
        >
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Icon name="CheckCircleIcon" size={20} variant="solid" className="text-[#2A9D8F]" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Icon name="ShieldCheckIcon" size={20} variant="solid" className="text-[#2A9D8F]" />
            <span>FERPA compliant</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Icon name="ClockIcon" size={20} variant="solid" className="text-[#2A9D8F]" />
            <span>24/7 support available</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
