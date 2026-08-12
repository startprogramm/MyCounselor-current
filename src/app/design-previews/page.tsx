import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Design Previews - MyCounselor',
  description: 'Internal design concept index — not a live page.',
  robots: { index: false, follow: false },
};

const CONCEPTS = [
  {
    role: 'Student',
    name: 'Trailhead',
    href: '/preview-student-trailhead',
    pitch: 'The application as a marked trail — goals and deadlines as waypoints on a route, readiness as elevation gained.',
    swatch: ['#4A6741', '#D97B29', '#F5F1E6'],
  },
  {
    role: 'Counselor',
    name: 'Control Room',
    href: '/preview-counselor-control-room',
    pitch: 'A caseload triaged like an ops console — every student a tile with a status light, built to scan fast.',
    swatch: ['#14181F', '#4C8DFF', '#F5A623'],
  },
  {
    role: 'Teacher',
    name: 'Marginalia',
    href: '/preview-teacher-marginalia',
    pitch: 'Requests rendered as papers with a note clipped to the corner — red-pen urgency, chalkboard-green chrome.',
    swatch: ['#3F5D4E', '#B23A2E', '#F7F3E9'],
  },
  {
    role: 'Parent',
    name: 'The Window',
    href: '/preview-parent-window',
    pitch: 'A single window frame divided into panes — new activity glows warm, like a light turning on in a room.',
    swatch: ['#E8EEF2', '#E8A857', '#2A3540'],
  },
];

export default function DesignPreviewsIndex() {
  return (
    <main className="min-h-screen bg-[#F1F3F4] px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wide text-[#5F6368]">
          Internal — not indexed
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[#202124]">Role design concepts</h1>
        <p className="mt-2 text-[#5F6368]">
          One representative dashboard view per role, each its own visual system.
        </p>

        <div className="mt-10 flex flex-col gap-4">
          {CONCEPTS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="flex items-center gap-5 rounded-2xl border border-[#DADCE0] bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
                {c.swatch.map((color) => (
                  <div key={color} className="flex-1" style={{ backgroundColor: color }} />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#1A73E8]">{c.role}</p>
                <p className="text-lg font-semibold text-[#202124]">{c.name}</p>
                <p className="mt-1 text-sm text-[#5F6368]">{c.pitch}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
