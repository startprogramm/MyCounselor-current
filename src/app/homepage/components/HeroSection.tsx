'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface HeroSectionProps {
  className?: string;
}

const SLIDE_COUNT = 4;
const SLIDE_INTERVAL = 5000;
const FLIP_DURATION = 420;

// ─── Slide 0: Counselor Workspace ────────────────────────────────────────────
const SlideWorkspace = () => (
  <>
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
        <div key={entry.student} className="panel-frost rounded-xl p-4 transition-colors hover:bg-white/20">
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
          <Icon name="ExclamationTriangleIcon" size={18} variant="solid" className="text-[#FDD663]" />
        </div>
        <p className="text-2xl font-heading font-bold">5</p>
        <p className="text-xs text-white/80">Students flagged for follow-up</p>
      </div>
      <div className="panel-frost rounded-xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-white/85">Completion Rate</p>
          <Icon name="ChartBarIcon" size={18} variant="solid" className="text-[#81C995]" />
        </div>
        <p className="text-2xl font-heading font-bold">92%</p>
        <p className="text-xs text-white/80">Plans updated this week</p>
      </div>
    </div>
    <div className="panel-frost mt-6 rounded-xl p-4">
      <p className="mb-3 text-sm text-white/80">Quick Actions</p>
      <div className="flex gap-3">
        <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white/15 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/25">
          <Icon name="CalendarIcon" size={18} variant="outline" />
          Schedule
        </button>
        <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white/15 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/25">
          <Icon name="ChatBubbleLeftRightIcon" size={18} variant="outline" />
          Message
        </button>
      </div>
    </div>
  </>
);

// ─── Slide 1: Student Dashboard ───────────────────────────────────────────────
const SlideStudent = () => (
  <>
    <div className="mb-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-white/80">Student Portal</p>
        <p className="text-xl font-heading font-semibold">Hi, Alex 👋</p>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-green-400/50 bg-green-500/20 px-3 py-1.5 text-sm text-green-300">
        <Icon name="CheckCircleIcon" size={14} variant="solid" className="text-green-400" />
        Approved
      </div>
    </div>

    <div className="panel-frost rounded-xl p-4 mb-3">
      <p className="text-sm text-white/80 mb-3">My Goals</p>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span>College Essay Draft</span>
            <span className="text-white/70">75%</span>
          </div>
          <div className="h-2 rounded-full bg-white/20">
            <div className="h-full w-3/4 rounded-full bg-[#F4A261]" />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span>Application Checklist</span>
            <span className="text-white/70">40%</span>
          </div>
          <div className="h-2 rounded-full bg-white/20">
            <div className="h-full w-2/5 rounded-full bg-[#81C995]" />
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 mb-3">
      <div className="panel-frost rounded-xl p-4">
        <div className="mb-2 flex items-center gap-2">
          <Icon name="CalendarDaysIcon" size={16} variant="solid" className="text-[#FDD663]" />
          <p className="text-xs text-white/80">Upcoming Meeting</p>
        </div>
        <p className="font-semibold text-sm">Dr. Wang</p>
        <p className="text-xs text-white/70 mt-1">Tomorrow · 10:00 AM</p>
      </div>
      <div className="panel-frost rounded-xl p-4">
        <div className="mb-2 flex items-center gap-2">
          <Icon name="ClipboardDocumentListIcon" size={16} variant="solid" className="text-[#8AB4F8]" />
          <p className="text-xs text-white/80">My Request</p>
        </div>
        <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-orange-400/40 bg-orange-500/20 px-2 py-1 text-xs text-orange-300">
          <div className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
          In Review
        </div>
        <p className="text-xs text-white/60 mt-1.5">Academic guidance</p>
      </div>
    </div>

    <div className="panel-frost rounded-xl p-4">
      <p className="text-sm text-white/80 mb-3">Recent Resources</p>
      <div className="space-y-2.5">
        {['College Essay Tips', 'Scholarship Finder 2025', 'Career Path Quiz'].map((r) => (
          <div key={r} className="flex items-center gap-2.5 text-sm">
            <Icon name="BookOpenIcon" size={14} variant="outline" className="text-white/60 flex-shrink-0" />
            <span>{r}</span>
          </div>
        ))}
      </div>
    </div>
  </>
);

// ─── Slide 2: AI Counselor Chat ───────────────────────────────────────────────
const SlideChat = () => (
  <>
    <div className="mb-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-white/80">AI Counselor</p>
        <p className="text-xl font-heading font-semibold">Smart Guidance</p>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-white/20 bg-[#1A73E8]/30 px-3 py-1.5 text-sm">
        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
        Online
      </div>
    </div>

    <div className="flex flex-col gap-3 mb-4">
      {/* Student message */}
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-white/20 px-4 py-3 text-sm leading-relaxed">
          I&apos;m really stressed about college applications. Where do I even start?
        </div>
      </div>

      {/* AI response */}
      <div className="flex gap-2.5">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1A73E8] flex items-center justify-center shadow-md">
          <Icon name="SparklesIcon" size={14} variant="solid" className="text-white" />
        </div>
        <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-white/15 bg-white/10 px-4 py-3 text-sm leading-relaxed">
          Take a breath — you&apos;re not alone! Let&apos;s break it down step by step. What feels hardest right now: essays, deadlines, or school selection?
        </div>
      </div>

      {/* Student message 2 */}
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-white/20 px-4 py-3 text-sm leading-relaxed">
          Probably the essays — I have no idea what to write.
        </div>
      </div>

      {/* Typing indicator */}
      <div className="flex gap-2.5">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1A73E8] flex items-center justify-center shadow-md">
          <Icon name="SparklesIcon" size={14} variant="solid" className="text-white" />
        </div>
        <div className="rounded-2xl rounded-tl-sm border border-white/15 bg-white/10 px-4 py-3.5">
          <div className="flex gap-1.5 items-center">
            <div className="h-2 w-2 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="h-2 w-2 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '160ms' }} />
            <div className="h-2 w-2 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '320ms' }} />
          </div>
        </div>
      </div>
    </div>

    {/* Quick replies */}
    <div className="flex flex-wrap gap-2">
      {['What topics work best?', 'Show me examples', 'Set a writing goal'].map((chip) => (
        <button key={chip} type="button" className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/20">
          {chip}
        </button>
      ))}
    </div>
  </>
);

// ─── Slide 3: Messages / Inbox ────────────────────────────────────────────────
const SlideMessages = () => (
  <>
    <div className="mb-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-white/80">Messages</p>
        <p className="text-xl font-heading font-semibold">Inbox</p>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-red-400/50 bg-red-500/20 px-3 py-1.5 text-sm text-red-300">
        <span className="font-bold text-white">3</span>
        Unread
      </div>
    </div>

    <div className="space-y-3 mb-4">
      {[
        {
          initials: 'CW',
          name: 'Dr. Wang',
          preview: 'Your request has been approved! Let\'s schedule a follow-up.',
          time: '2 min ago',
          color: 'bg-[#1A73E8]',
        },
        {
          initials: 'SY',
          name: 'Ms. Yılmaz',
          preview: 'Your meeting is confirmed for Monday at 10:00 AM.',
          time: '1h ago',
          color: 'bg-[#1E8E3E]',
        },
        {
          initials: 'MC',
          name: 'MyCounselor',
          preview: 'New guidance resources have been added to your dashboard.',
          time: 'Yesterday',
          color: 'bg-[#EA8600]',
        },
      ].map((msg) => (
        <div key={msg.name} className="panel-frost rounded-xl p-4 border-l-2 border-[#FDD663]">
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${msg.color} flex items-center justify-center text-sm font-bold shadow-sm`}>
              {msg.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm">{msg.name}</p>
                <span className="text-xs text-white/60">{msg.time}</span>
              </div>
              <p className="text-xs text-white/75 truncate">{msg.preview}</p>
            </div>
            <div className="flex-shrink-0 h-2 w-2 rounded-full bg-[#FDD663] mt-1" />
          </div>
        </div>
      ))}
    </div>

    <div className="panel-frost rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white/50">
          Write a message...
        </div>
        <button type="button" className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1A73E8] flex items-center justify-center shadow-md transition-colors hover:bg-[#185ABC]">
          <Icon name="PaperAirplaneIcon" size={16} variant="solid" className="text-white" />
        </button>
      </div>
    </div>
  </>
);

const SLIDE_LABELS = [
  'Counselor Workspace',
  'Student Dashboard',
  'AI Counselor Chat',
  'Messages',
];

// ─── Main Component ───────────────────────────────────────────────────────────
const HeroSection = ({ className = '' }: HeroSectionProps) => {
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.1 });
  const [slideIndex, setSlideIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const slideIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);

  const heroHighlights = [
    { id: 1, value: '500+', label: 'School Communities', icon: 'BuildingLibraryIcon' },
    { id: 2, value: '98%', label: 'Student Satisfaction', icon: 'FaceSmileIcon' },
    { id: 3, value: '50k+', label: 'Sessions Completed', icon: 'CalendarDaysIcon' },
  ];

  const flipToSlide = useCallback((target: number) => {
    if (isAnimatingRef.current || !cardRef.current || target === slideIndexRef.current) return;
    isAnimatingRef.current = true;

    const el = cardRef.current;

    // Phase 1: flip out to -90deg
    el.style.transition = `transform ${FLIP_DURATION}ms ease-in, opacity ${FLIP_DURATION * 0.7}ms ease-in`;
    el.style.transform = 'perspective(1200px) rotateY(-90deg)';
    el.style.opacity = '0.1';

    setTimeout(() => {
      // Swap content
      slideIndexRef.current = target;
      setSlideIndex(target);

      // Instantly jump to +90deg (no transition)
      el.style.transition = 'none';
      el.style.transform = 'perspective(1200px) rotateY(90deg)';
      el.style.opacity = '0.1';

      // Phase 2: flip in from 90deg to 0
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition = `transform ${FLIP_DURATION}ms ease-out, opacity ${FLIP_DURATION * 0.7}ms ease-out`;
          el.style.transform = 'perspective(1200px) rotateY(0deg)';
          el.style.opacity = '1';

          setTimeout(() => {
            isAnimatingRef.current = false;
          }, FLIP_DURATION);
        });
      });
    }, FLIP_DURATION);
  }, []);

  const advanceSlide = useCallback(() => {
    const next = (slideIndexRef.current + 1) % SLIDE_COUNT;
    flipToSlide(next);
  }, [flipToSlide]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    const interval = setInterval(advanceSlide, SLIDE_INTERVAL);
    return () => clearInterval(interval);
  }, [advanceSlide]);

  const renderSlide = (index: number) => {
    switch (index) {
      case 0: return <SlideWorkspace />;
      case 1: return <SlideStudent />;
      case 2: return <SlideChat />;
      case 3: return <SlideMessages />;
      default: return <SlideWorkspace />;
    }
  };

  return (
    <section
      ref={sectionRef}
      id="main-content"
      className={`relative overflow-hidden bg-sky-wash py-8 sm:py-10 lg:py-12 ${className}`}
    >
      <div className="absolute inset-0 bg-campus-grid opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#325f89] via-[#4f83b0] to-[#6ca6cb] px-6 py-12 text-white shadow-panel sm:px-8 lg:px-12 lg:py-14">
          <div className="absolute inset-0 bg-soft-radial opacity-55" />

          {/* Animated Background Decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-float-delayed" />
            <div className="absolute -top-20 left-1/3 h-[460px] w-[460px] rounded-full bg-[#EA8600]/15 blur-3xl animate-drift" />
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* ─── Left: Text Content ─── */}
            <div className="space-y-8">
              <div
                className={`inline-flex items-center space-x-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm animate-on-scroll ${isVisible ? 'animate-visible' : ''}`}
              >
                <Icon name="SparklesIcon" size={16} variant="solid" className="text-[#F4A261]" />
                <span>Compassion-first counseling platform</span>
              </div>

              <h1
                className={`text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-tight animate-on-scroll stagger-1 ${isVisible ? 'animate-visible' : ''}`}
              >
                Guiding Every Student
                <span className="block text-[#F4A261]">With Genuine Care</span>
              </h1>

              <p
                className={`max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl animate-on-scroll stagger-2 ${isVisible ? 'animate-visible' : ''}`}
              >
                MyCounselor keeps the experience warm and personal while giving schools a clean,
                organized workflow for guidance, planning, and follow-up.
              </p>

              <div
                className={`flex flex-col sm:flex-row gap-4 animate-on-scroll stagger-3 ${isVisible ? 'animate-visible' : ''}`}
              >
                <Link
                  href="/auth/signup/student"
                  className="group inline-flex items-center justify-center space-x-2 rounded-full bg-white px-8 py-4 text-base font-heading font-semibold text-[#325f89] shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white/90 hover:shadow-xl focus-ring"
                >
                  <Icon name="AcademicCapIcon" size={20} variant="solid" className="group-hover:rotate-12 transition-transform" />
                  <span>Start as Student</span>
                </Link>

                <Link
                  href="/auth/signup/counselor"
                  className="group inline-flex items-center justify-center space-x-2 rounded-full border border-white/35 bg-white/10 px-8 py-4 text-base font-heading font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 focus-ring"
                >
                  <Icon name="UserGroupIcon" size={20} variant="outline" className="group-hover:scale-110 transition-transform" />
                  <span>Start as Counselor</span>
                </Link>
              </div>

              <div
                className={`flex flex-wrap items-center gap-3 pt-4 animate-on-scroll stagger-4 ${isVisible ? 'animate-visible' : ''}`}
              >
                <div className="chip-pill flex items-center space-x-2 px-3 py-1.5">
                  <Icon name="CheckCircleIcon" size={20} variant="solid" className="text-[#2A9D8F]" />
                  <span className="text-sm font-medium">FERPA Compliant</span>
                </div>
                <div className="chip-pill flex items-center space-x-2 px-3 py-1.5">
                  <Icon name="ShieldCheckIcon" size={20} variant="solid" className="text-[#2A9D8F]" />
                  <span className="text-sm font-medium">SSL Secured</span>
                </div>
              </div>

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

            {/* ─── Right: Rotating Card ─── */}
            <div
              className={`relative hidden lg:flex flex-col items-center gap-4 animate-on-scroll-right stagger-2 ${isVisible ? 'animate-visible' : ''}`}
            >
              {/* Slide label */}
              <div className="self-start flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/70 backdrop-blur-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-[#FDD663] animate-pulse" />
                {SLIDE_LABELS[slideIndex]}
              </div>

              {/* The flippable card */}
              <div
                ref={cardRef}
                className="relative w-full overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl animate-float"
                style={{ height: '480px', transformOrigin: 'center center', willChange: 'transform, opacity' }}
              >
                {renderSlide(slideIndex)}
                <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#EA8600]/20 blur-3xl" />
                <div className="pointer-events-none absolute -left-16 -top-24 h-52 w-52 rounded-full bg-white/20 blur-3xl" />
              </div>

              {/* Dot indicators */}
              <div className="flex items-center gap-2">
                {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={SLIDE_LABELS[i]}
                    onClick={() => flipToSlide(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === slideIndex
                        ? 'w-6 h-2 bg-white'
                        : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
