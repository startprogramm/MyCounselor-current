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
      name: "Sarah Johnson",
      role: "High School Senior",
      content: "MyCounselor made college applications so much less stressful. I could schedule appointments easily and access resources whenever I needed them. My counselor was always just a message away!",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f9595025-1767185860161.png",
      alt: "Young woman with long brown hair smiling at camera wearing casual blue sweater",
      rating: 5
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "School Counselor",
      content: "This platform has transformed how I work with students. I can manage my caseload efficiently, track student progress, and maintain meaningful connections without feeling overwhelmed. It's a game-changer.",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1c3671659-1763299671587.png",
      alt: "Professional Asian man in navy blazer with short black hair smiling confidently",
      rating: 5
    },
    {
      id: 3,
      name: "Jennifer Martinez",
      role: "Parent",
      content: "As a parent, I love being able to see my daughter's progress and communicate with her counselor. The platform keeps me informed and involved in her academic journey. Highly recommend!",
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_11bdfc8f0-1763296614484.png",
      alt: "Hispanic woman with shoulder-length dark hair in professional attire smiling warmly",
      rating: 5
    }
  ];

  // Auto-advance carousel
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play logic
  useEffect(() => {
    if (isPaused || !isVisible) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, isVisible, nextSlide]);

  return (
    <section
      ref={sectionRef}
      className={`py-16 lg:py-24 bg-background dark:bg-slate-900 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-12 animate-on-scroll ${isVisible ? 'animate-visible' : ''}`}
        >
          <div className="inline-flex items-center space-x-2 bg-accent/10 dark:bg-accent/20 rounded-full px-4 py-2 text-sm font-medium text-accent mb-4">
            <Icon name="StarIcon" size={16} variant="solid" />
            <span>Success Stories</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            Hear From Our Community
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real experiences from students, counselors, and parents who have transformed their counseling journey with CounselConnect.
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className={`relative animate-on-scroll stagger-2 ${isVisible ? 'animate-visible' : ''}`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main Carousel */}
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="bg-card dark:bg-slate-800/50 rounded-2xl p-8 md:p-12 shadow-lg border border-border dark:border-slate-700 max-w-3xl mx-auto">
                    {/* Stars */}
                    <div className="flex items-center justify-center mb-6">
                      {[...Array(testimonial.rating)].map((_, index) => (
                        <Icon
                          key={index}
                          name="StarIcon"
                          size={24}
                          variant="solid"
                          className="text-amber-400"
                        />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-xl md:text-2xl text-center text-foreground mb-8 leading-relaxed italic">
                      "{testimonial.content}"
                    </blockquote>

                    {/* Author */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden mb-4 ring-4 ring-primary/20">
                        <AppImage
                          src={testimonial.image}
                          alt={testimonial.alt}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="text-center">
                        <div className="font-heading font-semibold text-foreground text-lg">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 w-12 h-12 rounded-full bg-card dark:bg-slate-800 shadow-lg border border-border dark:border-slate-700 flex items-center justify-center hover:bg-muted dark:hover:bg-slate-700 transition-colors focus-ring"
            aria-label="Previous testimonial"
          >
            <Icon name="ChevronLeftIcon" size={24} variant="outline" className="text-foreground" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 w-12 h-12 rounded-full bg-card dark:bg-slate-800 shadow-lg border border-border dark:border-slate-700 flex items-center justify-center hover:bg-muted dark:hover:bg-slate-700 transition-colors focus-ring"
            aria-label="Next testimonial"
          >
            <Icon name="ChevronRightIcon" size={24} variant="outline" className="text-foreground" />
          </button>

          {/* Dots Navigation */}
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

          {/* Auto-play Indicator */}
          <div className="flex items-center justify-center mt-4">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label={isPaused ? 'Resume auto-play' : 'Pause auto-play'}
            >
              <Icon
                name={isPaused ? 'PlayIcon' : 'PauseIcon'}
                size={16}
                variant="solid"
              />
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
