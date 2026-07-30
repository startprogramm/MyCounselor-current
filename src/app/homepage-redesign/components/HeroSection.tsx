'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const CARD_COUNT = 4;
const ROTATE_INTERVAL = 5000;

type CardId = 'workspace' | 'student' | 'chat' | 'messages';

const CARD_META: { id: CardId; label: string }[] = [
  { id: 'workspace', label: 'Counselor Desk' },
  { id: 'student', label: 'Student File' },
  { id: 'chat', label: 'AI Advisor' },
  { id: 'messages', label: 'Inbox' },
];

const StampBadge = ({ text, color }: { text: string; color: string }) => (
  <span
    className="rd-stamp rd-mono inline-flex items-center px-2.5 py-1 text-[10px] uppercase tracking-[0.12em]"
    style={{ color }}
  >
    {text}
  </span>
);

const CardWorkspace = () => (
  <>
    <div className="mb-4 flex items-start justify-between">
      <div>
        <p className="rd-mono text-[10px] uppercase tracking-[0.16em] text-[rgba(20,33,61,0.5)]">
          Counselor Desk · Today
        </p>
        <p className="rd-display text-lg font-semibold text-[var(--rd-ink)]">8 appointments on file</p>
      </div>
      <StampBadge text="On track" color="var(--rd-cambridge)" />
    </div>
    <div className="space-y-2.5">
      {[
        { student: 'Sofia M.', focus: 'College essay review', time: '9:00' },
        { student: 'Jordan L.', focus: 'Course planning', time: '11:30' },
        { student: 'Ava R.', focus: 'Career pathway check-in', time: '14:15' },
      ].map((entry) => (
        <div
          key={entry.student}
          className="flex items-center justify-between rounded-lg border rd-hairline bg-white/60 px-3 py-2.5"
        >
          <div>
            <p className="text-sm font-semibold text-[var(--rd-ink)]">{entry.student}</p>
            <p className="text-xs text-[rgba(20,33,61,0.6)]">{entry.focus}</p>
          </div>
          <span className="rd-mono text-xs text-[rgba(20,33,61,0.5)]">{entry.time}</span>
        </div>
      ))}
    </div>
    <div className="mt-4 grid grid-cols-2 gap-2.5">
      <div className="rounded-lg border rd-hairline bg-white/60 px-3 py-2.5">
        <p className="rd-mono text-[10px] uppercase tracking-[0.12em] text-[rgba(20,33,61,0.5)]">Flagged</p>
        <p className="rd-display text-xl font-semibold text-[var(--rd-garnet)]">5</p>
      </div>
      <div className="rounded-lg border rd-hairline bg-white/60 px-3 py-2.5">
        <p className="rd-mono text-[10px] uppercase tracking-[0.12em] text-[rgba(20,33,61,0.5)]">Plans updated</p>
        <p className="rd-display text-xl font-semibold text-[var(--rd-cambridge)]">92%</p>
      </div>
    </div>
  </>
);

const CardStudent = () => (
  <>
    <div className="mb-4 flex items-start justify-between">
      <div>
        <p className="rd-mono text-[10px] uppercase tracking-[0.16em] text-[rgba(20,33,61,0.5)]">
          Student File · Alex J.
        </p>
        <p className="rd-display text-lg font-semibold text-[var(--rd-ink)]">A Level, Year 11</p>
      </div>
      <StampBadge text="Approved" color="var(--rd-cambridge)" />
    </div>
    <div className="space-y-3 rounded-lg border rd-hairline bg-white/60 p-3">
      {[
        { label: 'College essay draft', pct: 75, color: '#b9862e' },
        { label: 'Application checklist', pct: 40, color: '#1f6f5c' },
      ].map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex justify-between text-xs text-[rgba(20,33,61,0.7)]">
            <span>{item.label}</span>
            <span className="rd-mono">{item.pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[rgba(20,33,61,0.1)]">
            <div
              className="h-full rounded-full"
              style={{ width: `${item.pct}%`, background: item.color }}
            />
          </div>
        </div>
      ))}
    </div>
    <div className="mt-3 grid grid-cols-2 gap-2.5">
      <div className="rounded-lg border rd-hairline bg-white/60 px-3 py-2.5">
        <p className="rd-mono text-[10px] uppercase tracking-[0.12em] text-[rgba(20,33,61,0.5)]">Next meeting</p>
        <p className="text-sm font-semibold text-[var(--rd-ink)]">Dr. Wang, tmrw</p>
      </div>
      <div className="rounded-lg border rd-hairline bg-white/60 px-3 py-2.5">
        <p className="rd-mono text-[10px] uppercase tracking-[0.12em] text-[rgba(20,33,61,0.5)]">Request</p>
        <p className="text-sm font-semibold text-[var(--rd-seal)]">In review</p>
      </div>
    </div>
  </>
);

const CardChat = () => (
  <>
    <div className="mb-4 flex items-start justify-between">
      <div>
        <p className="rd-mono text-[10px] uppercase tracking-[0.16em] text-[rgba(20,33,61,0.5)]">AI Advisor</p>
        <p className="rd-display text-lg font-semibold text-[var(--rd-ink)]">Smart guidance</p>
      </div>
      <StampBadge text="Online" color="var(--rd-cambridge)" />
    </div>
    <div className="space-y-2.5">
      <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-sm bg-[rgba(20,33,61,0.08)] px-3 py-2 text-sm text-[var(--rd-ink)]">
        I&apos;m stressed about applications. Where do I start?
      </div>
      <div className="flex gap-2">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--rd-seal)]">
          <Icon name="SparklesIcon" size={13} variant="solid" className="text-white" />
        </div>
        <div className="max-w-[85%] rounded-lg rounded-tl-sm border rd-hairline bg-white/60 px-3 py-2 text-sm text-[var(--rd-ink)]">
          Let&apos;s break it down. What feels hardest: essays, deadlines, or the school list?
        </div>
      </div>
      <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-sm bg-[rgba(20,33,61,0.08)] px-3 py-2 text-sm text-[var(--rd-ink)]">
        Probably the essays.
      </div>
    </div>
    <div className="mt-3 flex flex-wrap gap-1.5">
      {['Topic ideas', 'Show examples', 'Set a goal'].map((chip) => (
        <span
          key={chip}
          className="rounded-full border rd-hairline px-2.5 py-1 rd-mono text-[10px] uppercase tracking-[0.08em] text-[rgba(20,33,61,0.6)]"
        >
          {chip}
        </span>
      ))}
    </div>
  </>
);

const CardMessages = () => (
  <>
    <div className="mb-4 flex items-start justify-between">
      <div>
        <p className="rd-mono text-[10px] uppercase tracking-[0.16em] text-[rgba(20,33,61,0.5)]">Inbox</p>
        <p className="rd-display text-lg font-semibold text-[var(--rd-ink)]">3 unread</p>
      </div>
      <StampBadge text="New" color="var(--rd-garnet)" />
    </div>
    <div className="space-y-2">
      {[
        { name: 'Dr. Wang', preview: 'Your request has been approved.', time: '2m', c: '#b9862e' },
        { name: 'Ms. Yılmaz', preview: 'Meeting confirmed for Monday, 10:00.', time: '1h', c: '#1f6f5c' },
        { name: 'MyCounselor', preview: 'New guidance resources added.', time: 'Yst', c: '#3e6e93' },
      ].map((m) => (
        <div key={m.name} className="flex items-center gap-2.5 rounded-lg border rd-hairline bg-white/60 px-3 py-2.5">
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full rd-mono text-xs font-semibold text-white"
            style={{ background: m.c }}
          >
            {m.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--rd-ink)]">{m.name}</p>
              <span className="rd-mono text-[10px] text-[rgba(20,33,61,0.4)]">{m.time}</span>
            </div>
            <p className="truncate text-xs text-[rgba(20,33,61,0.6)]">{m.preview}</p>
          </div>
        </div>
      ))}
    </div>
  </>
);

const renderCard = (id: CardId) => {
  switch (id) {
    case 'workspace':
      return <CardWorkspace />;
    case 'student':
      return <CardStudent />;
    case 'chat':
      return <CardChat />;
    case 'messages':
      return <CardMessages />;
  }
};

const HeroSection = () => {
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.1 });
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  const goTo = useCallback((index: number) => {
    activeRef.current = index;
    setActive(index);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      goTo((activeRef.current + 1) % CARD_COUNT);
    }, ROTATE_INTERVAL);
    return () => clearInterval(interval);
  }, [goTo]);

  const highlights = [
    { value: '500+', label: 'School communities' },
    { value: '98%', label: 'Student satisfaction' },
    { value: '50k+', label: 'Sessions logged' },
  ];

  return (
    <section
      ref={sectionRef}
      id="main-content"
      className="relative overflow-hidden bg-[var(--rd-ink)] py-20 text-[var(--rd-paper)] lg:py-28"
    >
      <div className="rd-grain" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[var(--rd-seal-bright)] to-transparent" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-[1.05fr,0.95fr] lg:px-8">
        {/* Left: text */}
        <div className="space-y-7">
          <div
            className={`inline-flex items-center gap-2 rounded-full border rd-hairline-light px-3.5 py-1.5 rd-mono text-[11px] uppercase tracking-[0.16em] text-[rgba(251,249,244,0.7)] rd-animate ${isVisible ? 'rd-visible' : ''}`}
          >
            File No. GLS&#8209;2026 · Presidential School, Gulistan
          </div>

          <h1
            className={`rd-display text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl rd-animate rd-delay-1 ${isVisible ? 'rd-visible' : ''}`}
          >
            Every student&apos;s file,
            <br />
            <span className="italic text-[var(--rd-seal-bright)]">handled with care.</span>
          </h1>

          <p
            className={`max-w-xl text-lg leading-relaxed text-[rgba(251,249,244,0.75)] rd-animate rd-delay-2 ${isVisible ? 'rd-visible' : ''}`}
          >
            MyCounselor keeps a clean, current record for every student — goals, grades, meetings,
            and messages in one place — so counselors spend less time searching and more time
            advising.
          </p>

          <div
            className={`flex flex-col gap-3 sm:flex-row rd-animate rd-delay-3 ${isVisible ? 'rd-visible' : ''}`}
          >
            <Link
              href="/auth/signup/student"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--rd-seal)] px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-[var(--rd-seal-bright)] focus-ring"
            >
              <Icon name="AcademicCapIcon" size={19} variant="solid" />
              Open a student file
            </Link>
            <Link
              href="/auth/signup/counselor"
              className="inline-flex items-center justify-center gap-2 rounded-full border rd-hairline-light px-7 py-3.5 text-base font-semibold text-[var(--rd-paper)] transition-all hover:bg-white/10 focus-ring"
            >
              <Icon name="UserGroupIcon" size={19} variant="outline" />
              Enter as counselor
            </Link>
          </div>

          <div
            className={`flex flex-wrap items-center gap-2.5 rd-animate rd-delay-4 ${isVisible ? 'rd-visible' : ''}`}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed rd-hairline-light px-3 py-1 text-xs text-[rgba(251,249,244,0.7)]">
              <Icon name="CheckCircleIcon" size={14} variant="solid" className="text-[var(--rd-cambridge)]" />
              FERPA aligned
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed rd-hairline-light px-3 py-1 text-xs text-[rgba(251,249,244,0.7)]">
              <Icon name="LockClosedIcon" size={14} variant="solid" className="text-[var(--rd-cambridge)]" />
              Encrypted
            </span>
          </div>

          <div
            className={`grid grid-cols-3 gap-4 border-t rd-hairline-light pt-5 rd-animate rd-delay-5 ${isVisible ? 'rd-visible' : ''}`}
          >
            {highlights.map((h) => (
              <div key={h.label}>
                <p className="rd-display text-2xl font-semibold text-[var(--rd-seal-bright)]">{h.value}</p>
                <p className="rd-mono text-[10px] uppercase tracking-[0.1em] text-[rgba(251,249,244,0.55)]">
                  {h.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: fanned card deck (signature element) */}
        <div className={`relative hidden lg:block rd-animate rd-delay-2 ${isVisible ? 'rd-visible' : ''}`}>
          <div className="relative mx-auto mb-8 h-[420px] w-full max-w-sm rd-carddeck">
            {CARD_META.map((card, i) => {
              const offset = (i - active + CARD_COUNT) % CARD_COUNT;
              const isFront = offset === 0;
              const rotate = isFront ? 0 : offset === 1 ? 4 : offset === 2 ? -6 : 7;
              const translateY = isFront ? 0 : offset * 6;
              const translateX = isFront ? 0 : offset % 2 === 0 ? 10 : -10;
              return (
                <div
                  key={card.id}
                  className="absolute inset-0 rounded-2xl border rd-hairline bg-[var(--rd-parchment)] p-5 shadow-2xl"
                  style={{
                    transform: `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg)`,
                    zIndex: CARD_COUNT - offset,
                    opacity: offset > 2 ? 0 : 1,
                  }}
                >
                  {isFront && renderCard(card.id)}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-2">
            {CARD_META.map((card, i) => (
              <button
                key={card.id}
                type="button"
                onClick={() => goTo(i)}
                className={`rd-mono rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] transition-colors ${
                  i === active
                    ? 'border-[var(--rd-seal-bright)] bg-[rgba(215,164,74,0.15)] text-[var(--rd-seal-bright)]'
                    : 'rd-hairline-light text-[rgba(251,249,244,0.5)] hover:text-[rgba(251,249,244,0.8)]'
                }`}
              >
                {card.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
