'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  color: string;
}

const TestimonialsSection = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: '11th Grade Student',
      content:
        'MyCounselor made college applications so much less stressful. I could book time and reach my counselor whenever I needed to.',
      color: '#1f6f5c',
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'School Counselor',
      content:
        'I can manage my caseload efficiently, track progress, and stay close to my students without feeling buried in paperwork.',
      color: '#b9862e',
    },
    {
      id: 3,
      name: 'Jennifer Martinez',
      role: 'Parent',
      content:
        "I can see my daughter's progress and talk to her counselor directly. It keeps me informed without feeling intrusive.",
      color: '#8b3a3a',
    },
  ];

  const next = useCallback(() => setIndex((p) => (p + 1) % testimonials.length), [testimonials.length]);
  const prev = () => setIndex((p) => (p - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    if (paused || !isVisible) return;
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [paused, isVisible, next]);

  const active = testimonials[index];

  return (
    <section id="stories" ref={sectionRef} className="relative bg-[var(--rd-paper)] py-20 lg:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className={`mb-12 text-center rd-animate ${isVisible ? 'rd-visible' : ''}`}>
          <p className="rd-mono mb-3 text-xs uppercase tracking-[0.16em] text-[rgba(20,33,61,0.5)]">Case Notes</p>
          <h2 className="rd-display text-3xl font-semibold text-[var(--rd-ink)] sm:text-4xl">
            Notes from the people who use it
          </h2>
        </div>

        <div
          className={`relative rd-animate rd-delay-2 ${isVisible ? 'rd-visible' : ''}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative rounded-2xl border rd-hairline bg-[rgba(242,234,217,0.6)] p-8 sm:p-10">
            <div
              className="absolute -top-3 left-8 h-6 w-16 -rotate-2 rounded-sm opacity-70"
              style={{ background: `${active.color}33` }}
            />
            <Icon
              name="ChatBubbleBottomCenterTextIcon"
              size={28}
              variant="solid"
              className="mb-4 opacity-20"
              style={{ color: active.color }}
            />
            <blockquote className="rd-display mb-6 text-xl italic leading-relaxed text-[var(--rd-ink)] sm:text-2xl">
              &ldquo;{active.content}&rdquo;
            </blockquote>
            <div className="flex items-center gap-3 border-t rd-hairline pt-5">
              <div
                className="rd-mono flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ background: active.color }}
              >
                {active.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--rd-ink)]">{active.name}</p>
                <p className="rd-mono text-xs uppercase tracking-[0.08em] text-[rgba(20,33,61,0.5)]">{active.role}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              aria-label="Previous"
              className="flex h-9 w-9 items-center justify-center rounded-full border rd-hairline text-[rgba(20,33,61,0.6)] transition-colors hover:bg-[rgba(20,33,61,0.05)]"
            >
              <Icon name="ChevronLeftIcon" size={18} variant="outline" />
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to note ${i + 1}`}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: i === index ? '1.5rem' : '0.4rem',
                    background: i === index ? '#b9862e' : 'rgba(20,33,61,0.2)',
                  }}
                />
              ))}
            </div>
            <button
              onClick={next}
              aria-label="Next"
              className="flex h-9 w-9 items-center justify-center rounded-full border rd-hairline text-[rgba(20,33,61,0.6)] transition-colors hover:bg-[rgba(20,33,61,0.05)]"
            >
              <Icon name="ChevronRightIcon" size={18} variant="outline" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
