'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Icon from '@/components/ui/AppIcon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
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
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'School Counselor',
      content:
        'I can manage my caseload efficiently, track progress, and stay close to my students without feeling buried in paperwork.',
    },
    {
      id: 3,
      name: 'Jennifer Martinez',
      role: 'Parent',
      content:
        "I can see my daughter's progress and talk to her counselor directly. It keeps me informed without feeling intrusive.",
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
    <section id="stories" ref={sectionRef} className="relative bg-[var(--ed-paper)] py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <h2 className={`mb-14 ed-display text-3xl font-bold uppercase sm:text-4xl ed-animate ${isVisible ? 'ed-visible' : ''}`}>
          From The Community
        </h2>

        <div
          className={`grid gap-0 overflow-hidden border border-[var(--ed-ink)] lg:grid-cols-[0.85fr,1.15fr] ed-animate ed-delay-1 ${isVisible ? 'ed-visible' : ''}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative hidden min-h-[360px] lg:block">
            <Image
              src="/homepage-editorial/community.jpg"
              alt="Students collaborating and laughing over a laptop"
              fill
              sizes="45vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-between bg-[var(--ed-white)] p-8 sm:p-12">
            <div>
              <Icon name="ChatBubbleBottomCenterTextIcon" size={30} variant="solid" className="mb-6 text-[var(--ed-orange)]" />
              <blockquote className="ed-display text-2xl font-medium leading-snug sm:text-3xl">
                &ldquo;{active.content}&rdquo;
              </blockquote>
              <div className="mt-8 border-t border-[rgba(17,17,16,0.12)] pt-6">
                <p className="text-base font-semibold">{active.name}</p>
                <p className="text-sm text-[rgba(17,17,16,0.55)]">{active.role}</p>
              </div>
            </div>

            <div className="mt-10 flex items-center gap-4">
              <button
                onClick={prev}
                aria-label="Previous"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--ed-ink)] transition-colors hover:bg-[var(--ed-ink)] hover:text-[var(--ed-paper)]"
              >
                <Icon name="ChevronLeftIcon" size={18} variant="outline" />
              </button>
              <div className="flex items-center gap-2">
                {testimonials.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setIndex(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: i === index ? '1.5rem' : '0.4rem',
                      background: i === index ? '#f1592a' : 'rgba(17,17,16,0.2)',
                    }}
                  />
                ))}
              </div>
              <button
                onClick={next}
                aria-label="Next"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--ed-ink)] transition-colors hover:bg-[var(--ed-ink)] hover:text-[var(--ed-paper)]"
              >
                <Icon name="ChevronRightIcon" size={18} variant="outline" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
