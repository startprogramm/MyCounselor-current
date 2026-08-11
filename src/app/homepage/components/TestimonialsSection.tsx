'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  image: string;
  alt: string;
  rating: number;
  rotate: string;
}

interface TestimonialsSectionProps {
  className?: string;
}

const TestimonialsSection = ({ className = '' }: TestimonialsSectionProps) => {
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.1 });
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: '11th Grade Student',
      content:
        'MyCounselor made college applications so much less stressful. I could schedule appointments easily and access resources whenever I needed them. My counselor was always just a message away!',
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1f9595025-1767185860161.png',
      alt: 'Young woman with long brown hair smiling at camera wearing casual blue sweater',
      rating: 5,
      rotate: '-rotate-2',
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'School Counselor',
      content:
        "This platform has transformed how I work with students. I can manage my caseload efficiently, track student progress, and maintain meaningful connections without feeling overwhelmed. It's a game-changer.",
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1c3671659-1763299671587.png',
      alt: 'Professional Asian man in navy blazer with short black hair smiling confidently',
      rating: 5,
      rotate: 'rotate-1',
    },
    {
      id: 3,
      name: 'Jennifer Martinez',
      role: 'Parent',
      content:
        "As a parent, I love being able to see my daughter's progress and communicate with her counselor. The platform keeps me informed and involved in her academic journey. Highly recommend!",
      image: 'https://img.rocket.new/generatedImages/rocket_gen_img_11bdfc8f0-1763296614484.png',
      alt: 'Hispanic woman with shoulder-length dark hair in professional attire smiling warmly',
      rating: 5,
      rotate: '-rotate-1',
    },
  ];

  const next = useCallback(() => setIndex((i) => (i + 1) % testimonials.length), [testimonials.length]);
  const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    if (paused || !isVisible) return;
    const id = setTimeout(next, 6500);
    return () => clearTimeout(id);
  }, [index, paused, isVisible, next]);

  const active = testimonials[index];

  return (
    <section ref={sectionRef} className={`bg-[var(--lt-paper)] py-24 ${className}`}>
      <div className={`lt-reveal mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 ${isVisible ? 'lt-visible' : ''}`}>
        <p className="lt-mono text-center text-[12px] text-[var(--lt-blue)]">Real letters</p>
        <h2 className="mt-4 text-center text-4xl">Hear From Our Community</h2>

        <div
          className="mt-14"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div key={index} className={`lt-card lt-fade-enter p-8 sm:p-10 ${active.rotate}`}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="relative mx-auto h-24 w-24 shrink-0 rotate-3 overflow-hidden rounded-md border-4 border-white shadow-[0_6px_16px_rgba(22,35,62,0.18)] sm:mx-0">
                <AppImage
                  src={active.image}
                  alt={active.alt}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center gap-1">
                  {[...Array(active.rating)].map((_, i) => (
                    <Icon key={i} name="StarIcon" size={14} variant="solid" className="text-[var(--lt-gold)]" />
                  ))}
                </div>
                <blockquote className="text-lg italic leading-relaxed text-[var(--lt-ink)] sm:text-xl">
                  &ldquo;{active.content}&rdquo;
                </blockquote>
                <p className="lt-script mt-5 text-3xl text-[var(--lt-blue)]">{active.name}</p>
                <p className="lt-mono -mt-1 text-[11px] text-[var(--lt-ink-soft)]">{active.role}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous letter"
              className="lt-focus text-sm text-[var(--lt-ink-soft)] hover:text-[var(--lt-ink)]"
            >
              &larr; Previous
            </button>
            <div className="flex gap-2">
              {testimonials.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  aria-label={`Read the letter from ${t.name}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${i === index ? 'bg-[var(--lt-blue)]' : 'bg-[var(--lt-ink-soft)]/25'}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={next}
              aria-label="Next letter"
              className="lt-focus text-sm text-[var(--lt-ink-soft)] hover:text-[var(--lt-ink)]"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
