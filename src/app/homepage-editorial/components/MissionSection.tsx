'use client';

import React from 'react';
import Image from 'next/image';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const MissionSection = () => {
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>({ threshold: 0.15 });

  return (
    <section ref={sectionRef} className="relative bg-[var(--ed-white)]">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="relative h-[340px] lg:col-span-5 lg:h-auto">
          <Image
            src="/homepage-editorial/graduation.jpg"
            alt="Graduating students throwing their caps in the air"
            fill
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="relative flex flex-col justify-center gap-6 px-6 py-14 lg:col-span-5 lg:px-14 lg:py-20">
          <h2
            className={`ed-display text-3xl font-bold uppercase leading-tight sm:text-4xl ed-animate ${isVisible ? 'ed-visible' : ''}`}
          >
            Empowering Learners,
            <br />
            Transforming Futures
          </h2>
          <p
            className={`max-w-md text-[17px] leading-relaxed text-[rgba(17,17,16,0.72)] ed-animate ed-delay-1 ${isVisible ? 'ed-visible' : ''}`}
          >
            At MyCounselor, we believe guidance should be accessible, personal, and tailored to
            every student. Our mission is to bridge the gap between potential and opportunity —
            starting with the students of Presidential School, Gulistan, and growing from there.
          </p>
        </div>

        <div className="relative hidden overflow-hidden lg:col-span-2 lg:block">
          <div className="pointer-events-none absolute inset-0 grid grid-cols-2 gap-6 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="ed-diamond aspect-square w-full" style={{ opacity: 0.5 + (i % 3) * 0.15 }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
