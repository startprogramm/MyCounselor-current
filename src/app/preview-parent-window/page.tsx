import type { Metadata } from 'next';
import './window.css';
import { petrona, mulish } from './fonts';
import Icon from '@/components/ui/AppIcon';

export const metadata: Metadata = {
  title: 'The Window Concept - Parent Dashboard - MyCounselor',
  description: 'Internal design concept preview — not a live page.',
  robots: { index: false, follow: false },
};

const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'HomeIcon', active: true },
  { label: 'My Children', icon: 'UserGroupIcon' },
  { label: 'Messages', icon: 'ChatBubbleLeftRightIcon' },
  { label: 'Meetings', icon: 'CalendarDaysIcon' },
  { label: 'Resources', icon: 'BookOpenIcon' },
];

export default function WindowPreview() {
  return (
    <main className={`the-window min-h-screen ${petrona.variable} ${mulish.variable}`}>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="flex w-64 flex-shrink-0 flex-col bg-[var(--wd-frame)] px-5 py-6">
          <div className="flex items-center gap-2.5 px-1">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--wd-lamp)]/15">
              <span className="wd-dot" />
            </span>
            <span className="text-[14px] font-semibold text-[var(--wd-ink)]">MyCounselor</span>
          </div>

          <nav className="mt-10 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium ${
                  item.active
                    ? 'bg-[var(--wd-sky)] text-[var(--wd-ink)]'
                    : 'text-[var(--wd-ink-soft)]'
                }`}
              >
                <Icon name={item.icon} size={18} variant="outline" />
                {item.label}
              </div>
            ))}
          </nav>

          <div className="mt-auto flex items-center gap-3 rounded-lg bg-[var(--wd-sky)] px-3 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--wd-ink)] text-sm font-semibold text-white">
              JM
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-[var(--wd-ink)]">Jennifer Martinez</p>
              <p className="text-[10px] text-[var(--wd-ink-soft)]">PARENT</p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 px-8 py-8 sm:px-10">
          <h1 className="text-3xl italic">Looking in on Aziz&rsquo;s journey.</h1>
          <p className="mt-2 text-[15px] text-[var(--wd-ink-soft)]">
            Two updates since you last checked in.
          </p>

          {/* One window, four panes, real mullions between them */}
          <div className="wd-pane mt-8 grid overflow-hidden sm:grid-cols-2">
            {/* Pane 1: Goals — glowing, new */}
            <div className="wd-pane-glow border-b border-r-0 border-[var(--wd-mullion)] p-6 sm:border-r sm:border-b-0">
              <div className="flex items-center gap-2">
                <span className="wd-dot" />
                <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--wd-ink-soft)]">
                  Goals &middot; new
                </p>
              </div>
              <h2 className="mt-2 text-xl">Essay draft moved to &ldquo;in review.&rdquo;</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--wd-ink-soft)]">
                Aziz submitted his personal statement draft — his counselor is reviewing it now.
              </p>
            </div>

            {/* Pane 2: Upcoming meeting */}
            <div className="border-b border-[var(--wd-mullion)] p-6 sm:border-b-0">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--wd-ink-soft)]">
                Upcoming
              </p>
              <h2 className="mt-2 text-xl">Meeting, Thursday 10:00 AM</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--wd-ink-soft)]">
                Course planning with Dr. Wang. You&rsquo;re welcome to join the first ten minutes.
              </p>
            </div>

            {/* Pane 3: Recent message — glowing, new */}
            <div className="wd-pane-glow border-t border-[var(--wd-mullion)] p-6 sm:border-r">
              <div className="flex items-center gap-2">
                <span className="wd-dot" />
                <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--wd-ink-soft)]">
                  Message &middot; new
                </p>
              </div>
              <h2 className="mt-2 text-xl">From Dr. Wang</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--wd-ink-soft)]">
                &ldquo;Aziz is doing well — wanted to flag one thing ahead of Thursday.&rdquo;
              </p>
            </div>

            {/* Pane 4: Counselor note */}
            <div className="border-t border-[var(--wd-mullion)] p-6">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--wd-ink-soft)]">
                From the counselor
              </p>
              <h2 className="mt-2 text-xl">Everything&rsquo;s on schedule</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--wd-ink-soft)]">
                No action needed from you right now — just keeping you close to the process.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <a
              href="#"
              className="wd-link inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--wd-ink)]"
            >
              Open all messages
              <Icon name="ArrowRightIcon" size={14} variant="outline" />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
