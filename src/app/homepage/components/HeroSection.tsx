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

  return (
    <section
      ref={sectionRef}
      id="main-content"
      className={`relative overflow-hidden bg-background py-8 sm:py-10 lg:py-12 ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-primary-foreground shadow-brand sm:px-8 lg:px-12 lg:py-14">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10" />

          <div className="relative grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div
                className={`inline-flex items-center space-x-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium animate-on-scroll ${isVisible ? 'animate-visible' : ''}`}
              >
                <Icon name="SparklesIcon" size={16} variant="solid" className="text-[#FDD663]" />
                <span>Simple, organized counseling for schools</span>
              </div>

              <h1
                className={`text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-tight animate-on-scroll stagger-1 ${isVisible ? 'animate-visible' : ''}`}
              >
                Guiding Every Student
                <span className="block text-white/90">With Genuine Care</span>
              </h1>

              <p
                className={`max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl animate-on-scroll stagger-2 ${isVisible ? 'animate-visible' : ''}`}
              >
                MyCounselor keeps counseling clear and approachable while giving schools reliable
                tools for planning, communication, and follow-up.
              </p>

              <div
                className={`flex flex-col sm:flex-row gap-4 animate-on-scroll stagger-3 ${isVisible ? 'animate-visible' : ''}`}
              >
                <Link
                  href="/auth/signup/student"
                  className="inline-flex items-center justify-center space-x-2 rounded-full bg-white px-8 py-4 text-base font-heading font-semibold text-primary transition-colors hover:bg-white/90 focus-ring"
                >
                  <Icon name="AcademicCapIcon" size={20} variant="solid" />
                  <span>Start as Student</span>
                </Link>

                <Link
                  href="/auth/signup/counselor"
                  className="inline-flex items-center justify-center space-x-2 rounded-full border border-white/40 bg-transparent px-8 py-4 text-base font-heading font-semibold text-white transition-colors hover:bg-white/10 focus-ring"
                >
                  <Icon name="UserGroupIcon" size={20} variant="outline" />
                  <span>Start as Counselor</span>
                </Link>
              </div>

              <div
                className={`flex flex-wrap items-center gap-3 pt-1 animate-on-scroll stagger-4 ${isVisible ? 'animate-visible' : ''}`}
              >
                <div className="flex items-center space-x-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                  <Icon
                    name="CheckCircleIcon"
                    size={18}
                    variant="solid"
                    className="text-[#81C995]"
                  />
                  <span className="text-sm font-medium">FERPA Compliant</span>
                </div>
                <div className="flex items-center space-x-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                  <Icon
                    name="ShieldCheckIcon"
                    size={18}
                    variant="solid"
                    className="text-[#81C995]"
                  />
                  <span className="text-sm font-medium">SSL Secured</span>
                </div>
              </div>

              <div
                className={`grid grid-cols-1 gap-3 sm:grid-cols-3 animate-on-scroll stagger-5 ${isVisible ? 'animate-visible' : ''}`}
              >
                {heroHighlights.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/20 bg-white/10 px-4 py-3"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Icon name={item.icon} size={18} variant="solid" className="text-[#FDD663]" />
                      <span className="text-xl font-heading font-bold">{item.value}</span>
                    </div>
                    <p className="text-sm text-white/90">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`relative hidden lg:block animate-on-scroll-right stagger-2 ${isVisible ? 'animate-visible' : ''}`}
            >
              <div className="relative h-[520px] w-full overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">Counselor Workspace</p>
                    <p className="text-xl font-heading font-semibold">Today at a Glance</p>
                  </div>
                  <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm">
                    8 appointments
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { student: 'Sofia M.', focus: 'College essay review', time: '9:00 AM' },
                    { student: 'Jordan L.', focus: 'Course planning', time: '11:30 AM' },
                    { student: 'Ava R.', focus: 'Career pathway check-in', time: '2:15 PM' },
                  ].map((entry) => (
                    <div
                      key={entry.student}
                      className="rounded-xl border border-white/20 bg-white/10 p-4"
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
                  <div className="rounded-xl border border-white/20 bg-white/10 p-4">
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
                  <div className="rounded-xl border border-white/20 bg-white/10 p-4">
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

                <div className="mt-6 rounded-xl border border-white/20 bg-white/10 p-4">
                  <p className="mb-3 text-sm text-white/80">Quick Actions</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/20"
                    >
                      <Icon name="CalendarIcon" size={18} variant="outline" />
                      Schedule
                    </button>
                    <button
                      type="button"
                      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/20"
                    >
                      <Icon name="ChatBubbleLeftRightIcon" size={18} variant="outline" />
                      Message
                    </button>
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
