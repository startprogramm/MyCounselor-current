'use client';

import React from 'react';
import { useReveal } from '../useReveal';

interface Note {
  quote: string;
  from: string;
  role: string;
  rotate: string;
}

const NOTES: Note[] = [
  {
    quote:
      'I stopped refreshing my email every hour. If something moved on my application, I’d actually see it.',
    from: 'A 12th grade student',
    role: 'Student desk',
    rotate: '-rotate-1',
  },
  {
    quote:
      'My caseload used to live in four different tabs. Now I open one and I know exactly who needs me today.',
    from: 'A school counselor',
    role: 'Counselor desk',
    rotate: 'rotate-1',
  },
  {
    quote:
      'I finally see what my daughter is working on without having to ask her to explain it at dinner.',
    from: 'A parent',
    role: 'Parent desk',
    rotate: '-rotate-1',
  },
];

const TestimonialsSection = () => {
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="ah-cream-2 py-24">
      <div className={`ah-reveal mx-auto max-w-6xl px-6 ${visible ? 'ah-visible' : ''}`}>
        <p className="ah-mono text-center text-[12px] text-[var(--ah-lamp-deep)]">Notes left on the desk</p>
        <h2 className="mt-4 text-center text-4xl">From the founding cohort.</h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-[15px] leading-relaxed text-[var(--ah-ink)]/62">
          MyCounselor is early — one school in, by design. These are from the people using it there.
        </p>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {NOTES.map((note) => (
            <div
              key={note.from}
              className={`ah-card ah-card-light ${note.rotate} p-6`}
            >
              <p className="ah-display text-lg italic leading-relaxed text-[var(--ah-ink)]">
                &ldquo;{note.quote}&rdquo;
              </p>
              <div className="mt-6 border-t border-[var(--ah-line-light)] pt-4">
                <p className="text-[14px] font-semibold text-[var(--ah-ink)]">{note.from}</p>
                <p className="ah-mono mt-1 text-[10px] text-[var(--ah-ink)]/45">{note.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
