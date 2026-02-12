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

  const heroHighlights = [
    {
      id: 1,
      value: '500+',
      label: 'School Communities',
      icon: 'BuildingLibraryIcon',
    },
    {
      id: 2,
      value: '98%',
      label: 'Student Satisfaction',
      icon: 'FaceSmileIcon',
    },
    {
      id: 3,
      value: '50k+',
      label: 'Sessions Completed',
      icon: 'CalendarDaysIcon',
    },
  ];

  const focusTags = ['College Prep', 'Career Planning', 'Mental Wellness', 'Goal Tracking'];

  return (
    <section
      ref={sectionRef}
      id="main-content"
      className={`relative overflow-hidden bg-lively-wash py-8 sm:py-10 lg:py-12 ${className}`}
    >
      <div className="absolute inset-0 bg-campus-grid opacity-25" />
      <div className="pointer-events-none absolute -left-20 top-12 h-56 w-56 rounded-full bg-[#8dd0ff]/45 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-24 h-60 w-60 rounded-full bg-[#ffbf8e]/35 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#2d6fa4] via-[#4b93bf] to-[#5bc0a8] px-6 py-12 text-white shadow-panel sm:px-8 lg:px-12 lg:py-14">
          <div className="absolute inset-0 bg-soft-radial opacity-65" />

          {/* Animated Background Decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-white/15 blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-white/15 blur-3xl animate-float-delayed" />
            <div className="absolute -top-20 left-1/3 h-[460px] w-[460px] rounded-full bg-[#ff8f73]/20 blur-3xl animate-drift" />
            <div className="absolute -right-16 bottom-8 h-64 w-64 rounded-full bg-[#fcd47a]/20 blur-3xl animate-float-delayed" />
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              {/* Badge */}
              <div
                className={`inline-flex items-center space-x-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm animate-on-scroll ${isVisible ? 'animate-visible' : ''}`}
              >
                <Icon name="SparklesIcon" size={16} variant="solid" className="text-[#F4A261]" />
                <span>Brighter counseling experience for every student</span>
              </div>

              {/* Heading */}
              <h1
                className={`text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-tight animate-on-scroll stagger-1 ${isVisible ? 'animate-visible' : ''}`}
              >
                Guiding Every Student
                <span className="block text-[#ffe09a]">With Genuine Care</span>
              </h1>

              {/* Description */}
              <p
                className={`max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl animate-on-scroll stagger-2 ${isVisible ? 'animate-visible' : ''}`}
              >
                MyCounselor keeps the experience warm and personal while giving schools a clean,
                organized workflow for guidance, planning, and follow-up.
              </p>

              <div
                className={`flex flex-wrap gap-2 animate-on-scroll stagger-2 ${isVisible ? 'animate-visible' : ''}`}
              >
                {focusTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA Buttons */}
              <div
                className={`flex flex-col sm:flex-row gap-4 animate-on-scroll stagger-3 ${isVisible ? 'animate-visible' : ''}`}
              >
                <Link
                  href="/auth/signup/student"
                  className="group inline-flex items-center justify-center space-x-2 rounded-full bg-gradient-to-r from-[#ffb15e] to-[#ff8f6b] px-8 py-4 text-base font-heading font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-[#ffab52] hover:to-[#ff835f] hover:shadow-xl focus-ring"
                >
                  <Icon
                    name="AcademicCapIcon"
                    size={20}
                    variant="solid"
                    className="group-hover:rotate-12 transition-transform"
                  />
                  <span>Start as Student</span>
                </Link>

                <Link
                  href="/auth/signup/counselor"
                  className="group inline-flex items-center justify-center space-x-2 rounded-full border border-white/35 bg-white/15 px-8 py-4 text-base font-heading font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/25 focus-ring"
                >
                  <Icon
                    name="UserGroupIcon"
                    size={20}
                    variant="outline"
                    className="group-hover:scale-110 transition-transform"
                  />
                  <span>Start as Counselor</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div
                className={`flex flex-wrap items-center gap-3 pt-4 animate-on-scroll stagger-4 ${isVisible ? 'animate-visible' : ''}`}
              >
                <div className="chip-pill flex items-center space-x-2 px-3 py-1.5">
                  <Icon
                    name="CheckCircleIcon"
                    size={20}
                    variant="solid"
                    className="text-[#8ff4af]"
                  />
                  <span className="text-sm font-medium">FERPA Compliant</span>
                </div>
                <div className="chip-pill flex items-center space-x-2 px-3 py-1.5">
                  <Icon
                    name="ShieldCheckIcon"
                    size={20}
                    variant="solid"
                    className="text-[#8ff4af]"
                  />
                  <span className="text-sm font-medium">SSL Secured</span>
                </div>
              </div>

              {/* Highlights */}
              <div
                className={`grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3 animate-on-scroll stagger-5 ${isVisible ? 'animate-visible' : ''}`}
              >
                {heroHighlights.map((item) => (
                  <div key={item.id} className="panel-frost rounded-xl px-4 py-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Icon name={item.icon} size={18} variant="solid" className="text-[#FDD663]" />
                      <span className="text-xl font-heading font-bold">{item.value}</span>
                    </div>
                    <p className="text-sm text-white/90">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Illustration */}
            <div
              className={`relative hidden lg:block animate-on-scroll-right stagger-2 ${isVisible ? 'animate-visible' : ''}`}
            >
              <div className="relative h-[540px] w-full overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl animate-float">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">Counselor Workspace</p>
                    <p className="text-xl font-heading font-semibold">Today at a Glance</p>
                  </div>
                  <div className="chip-pill px-3 py-1.5 text-sm">8 appointments</div>
                </div>

                <div className="space-y-3">
                  {[
                    { student: 'Sofia M.', focus: 'College essay review', time: '9:00 AM' },
                    { student: 'Jordan L.', focus: 'Course planning', time: '11:30 AM' },
                    { student: 'Ava R.', focus: 'Career pathway check-in', time: '2:15 PM' },
                  ].map((entry) => (
                    <div
                      key={entry.student}
                      className="panel-frost rounded-xl p-4 transition-colors hover:bg-white/20"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <p className="font-semibold">{entry.student}</p>
                        <span className="text-sm text-white/80">{entry.time}</span>
                      </div>
                      <p className="text-sm text-white/85">{entry.focus}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="panel-frost rounded-xl p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm text-white/85">Priority Queue</p>
                      <Icon
                        name="ExclamationTriangleIcon"
                        size={18}
                        variant="solid"
                        className="text-[#FDD663]"
                      />
                    </div>
                    <p className="text-2xl font-heading font-bold">5</p>
                    <p className="text-xs text-white/80">Students flagged for follow-up</p>
                  </div>
                  <div className="panel-frost rounded-xl p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm text-white/85">Completion Rate</p>
                      <Icon
                        name="ChartBarIcon"
                        size={18}
                        variant="solid"
                        className="text-[#81C995]"
                      />
                    </div>
                    <p className="text-2xl font-heading font-bold">92%</p>
                    <p className="text-xs text-white/80">Plans updated this week</p>
                  </div>
                </div>

                <div className="panel-frost mt-6 rounded-xl p-4">
                  <p className="mb-3 text-sm text-white/80">Quick Actions</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white/15 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/25"
                    >
                      <Icon name="CalendarIcon" size={18} variant="outline" />
                      Schedule
                    </button>
                    <button
                      type="button"
                      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white/15 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/25"
                    >
                      <Icon name="ChatBubbleLeftRightIcon" size={18} variant="outline" />
                      Message
                    </button>
                  </div>
                </div>

                <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#EA8600]/20 blur-3xl" />
                <div className="pointer-events-none absolute -left-16 -top-24 h-52 w-52 rounded-full bg-white/20 blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
