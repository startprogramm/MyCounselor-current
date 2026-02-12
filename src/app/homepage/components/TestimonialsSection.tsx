'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
}

interface TestimonialsSectionProps {
  className?: string;
}

const TestimonialsSection = ({ className = '' }: TestimonialsSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

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
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (isPaused || !isVisible) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, isVisible, nextSlide]);

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden bg-muted/30 py-16 lg:py-24 dark:bg-slate-900/50 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-campus-grid opacity-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-12 animate-on-scroll ${isVisible ? 'animate-visible' : ''}`}
        >
          <div className="mb-4 inline-flex items-center space-x-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary dark:border-primary/25 dark:bg-primary/15">
            <Icon name="StarIcon" size={16} variant="solid" />
            <span>Success Stories</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            Hear From Our Community
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real experiences from students, counselors, and parents who have transformed their
            counseling journey with MyCounselor.
          </p>
        </div>

        <div
          className={`relative animate-on-scroll stagger-2 ${isVisible ? 'animate-visible' : ''}`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/60 md:p-8">
                    <div className="grid gap-6 md:grid-cols-[220px,1fr] md:items-center">
                      <div className="relative overflow-hidden rounded-xl border border-border dark:border-slate-700">
                        <AppImage
                          src={testimonial.image}
                          alt={testimonial.alt}
                          width={260}
                          height={260}
                          className="h-[220px] w-full object-cover"
                        />
                      </div>

                      <div>
                        <div className="mb-4 flex items-center">
                          {[...Array(testimonial.rating)].map((_, index) => (
                            <Icon
                              key={index}
                              name="StarIcon"
                              size={20}
                              variant="solid"
                              className="text-[#F9AB00]"
                            />
                          ))}
                        </div>

                        <blockquote className="mb-5 text-lg leading-relaxed text-foreground md:text-xl">
                          &ldquo;{testimonial.content}&rdquo;
                        </blockquote>

                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-lg font-heading font-semibold text-foreground">
                              {testimonial.name}
                            </div>
                            <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                          </div>
                          <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                            Verified User
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 hidden h-12 w-12 -translate-y-1/2 -translate-x-4 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-muted focus-ring md:flex dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 lg:-translate-x-12"
            aria-label="Previous testimonial"
          >
            <Icon name="ChevronLeftIcon" size={24} variant="outline" className="text-foreground" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 hidden h-12 w-12 -translate-y-1/2 translate-x-4 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-muted focus-ring md:flex dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 lg:translate-x-12"
            aria-label="Next testimonial"
          >
            <Icon name="ChevronRightIcon" size={24} variant="outline" className="text-foreground" />
          </button>

          <div className="flex items-center justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-center mt-4">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label={isPaused ? 'Resume auto-play' : 'Pause auto-play'}
            >
              <Icon name={isPaused ? 'PlayIcon' : 'PauseIcon'} size={16} variant="solid" />
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
