'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface HeroSectionProps {
  className?: string;
}

const HeroSection = ({ className = '' }: HeroSectionProps) => {
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

  return (
    <section
      ref={sectionRef}
      id="main-content"
      className={`relative bg-gradient-to-br from-[#2D5A87] via-[#4A90B8] to-[#7BB3D1] dark:from-slate-900 dark:via-[#2D5A87] dark:to-[#4A90B8] text-white overflow-hidden ${className}`}
    >
      {/* Animated Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#F4A261]/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {/* Badge */}
            <div
              className={`inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium border border-white/20 animate-on-scroll ${isVisible ? 'animate-visible' : ''}`}
            >
              <Icon name="SparklesIcon" size={16} variant="solid" className="text-[#F4A261]" />
              <span>Empowering Student Success Through Connection</span>
            </div>

            {/* Heading */}
            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-tight animate-on-scroll stagger-1 ${isVisible ? 'animate-visible' : ''}`}
            >
              Every Student's Path <span className="text-[#F4A261] animate-pulse-glow inline-block">Matters</span>
            </h1>

            {/* Description */}
            <p
              className={`text-lg sm:text-xl text-white/90 leading-relaxed max-w-xl animate-on-scroll stagger-2 ${isVisible ? 'animate-visible' : ''}`}
            >
              Transform the overwhelming nature of school counseling into an organized, hopeful journey. MyCounselor bridges student needs with counselor expertise through technology that amplifies human connection.
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-4 animate-on-scroll stagger-3 ${isVisible ? 'animate-visible' : ''}`}
            >
              <Link
                href="/student-portal-dashboard"
                className="group inline-flex items-center justify-center space-x-2 bg-white text-[#2D5A87] px-8 py-4 rounded-lg font-heading font-semibold text-base hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 focus-ring"
              >
                <Icon name="AcademicCapIcon" size={20} variant="solid" className="group-hover:rotate-12 transition-transform" />
                <span>Student Portal</span>
              </Link>

              <Link
                href="/counselor-command-center"
                className="group inline-flex items-center justify-center space-x-2 glass text-white px-8 py-4 rounded-lg font-heading font-semibold text-base hover:bg-white/20 transition-all duration-300 focus-ring"
              >
                <Icon name="UserGroupIcon" size={20} variant="outline" className="group-hover:scale-110 transition-transform" />
                <span>Counselor Login</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div
              className={`flex items-center space-x-6 pt-4 animate-on-scroll stagger-4 ${isVisible ? 'animate-visible' : ''}`}
            >
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                <Icon name="CheckCircleIcon" size={20} variant="solid" className="text-[#2A9D8F]" />
                <span className="text-sm font-medium">FERPA Compliant</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                <Icon name="ShieldCheckIcon" size={20} variant="solid" className="text-[#2A9D8F]" />
                <span className="text-sm font-medium">SSL Secured</span>
              </div>
            </div>
          </div>

          {/* Hero Illustration */}
          <div
            className={`relative hidden lg:block animate-on-scroll-right stagger-2 ${isVisible ? 'animate-visible' : ''}`}
          >
            <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl animate-float">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent backdrop-blur-sm"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full glass rounded-2xl p-8 space-y-6">
                  {/* Mock Dashboard Header */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                      <Icon name="UserCircleIcon" size={32} variant="solid" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/30 rounded w-3/4 animate-shimmer"></div>
                      <div className="h-3 bg-white/20 rounded w-1/2"></div>
                    </div>
                  </div>

                  {/* Mock Content Cards */}
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="bg-white/20 rounded-lg p-4 space-y-2 hover:bg-white/30 transition-colors cursor-pointer"
                        style={{ animationDelay: `${item * 0.2}s` }}
                      >
                        <div className="h-3 bg-white/30 rounded w-full"></div>
                        <div className="h-3 bg-white/20 rounded w-4/5"></div>
                      </div>
                    ))}
                  </div>

                  {/* Mock Action Buttons */}
                  <div className="flex space-x-3">
                    <div className="flex-1 h-12 bg-white/30 rounded-lg flex items-center justify-center">
                      <Icon name="CalendarIcon" size={20} variant="outline" className="mr-2" />
                      <span className="text-sm font-medium">Schedule</span>
                    </div>
                    <div className="flex-1 h-12 bg-white/30 rounded-lg flex items-center justify-center">
                      <Icon name="ChatBubbleLeftRightIcon" size={20} variant="outline" className="mr-2" />
                      <span className="text-sm font-medium">Message</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
