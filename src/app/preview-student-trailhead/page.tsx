import type { Metadata } from 'next';
import './trailhead.css';
import { spaceGrotesk, workSans, jetbrainsMono } from './fonts';
import Icon from '@/components/ui/AppIcon';
import ProfilePuzzle from './ProfilePuzzle';

export const metadata: Metadata = {
  title: 'Trailhead Concept - Student Dashboard - MyCounselor',
  description: 'Internal design concept preview — not a live page.',
  robots: { index: false, follow: false },
};

const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'HomeIcon', active: true },
  { label: 'My Requests', icon: 'ClipboardDocumentListIcon' },
  { label: 'Messages', icon: 'ChatBubbleLeftRightIcon' },
  { label: 'Meetings', icon: 'CalendarDaysIcon' },
  { label: 'Guidance', icon: 'BookOpenIcon' },
  { label: 'AI Tools', icon: 'SparklesIcon' },
];

const WAYPOINTS = [
  { label: 'Profile complete', detail: 'Academic record confirmed', status: 'done' as const },
  { label: 'Essay draft in review', detail: 'Coach feedback: 2 notes left to address', status: 'done' as const },
  { label: 'Meeting with Dr. Wang', detail: 'Thursday, 10:00 AM — course planning', status: 'current' as const },
  { label: 'Application submitted', detail: 'Common App + 3 supplements', status: 'upcoming' as const },
  { label: 'Decision', detail: 'Expected March', status: 'upcoming' as const },
];

const STATS = [
  { label: 'Waypoints ahead', value: '2', icon: 'FlagIcon' },
  { label: 'Meetings this week', value: '1', icon: 'CalendarDaysIcon' },
  { label: 'Trail progress', value: '60%', icon: 'ArrowTrendingUpIcon' },
];

export default function TrailheadPreview() {
  return (
    <main
      className={`trailhead min-h-screen ${spaceGrotesk.variable} ${workSans.variable} ${jetbrainsMono.variable}`}
    >
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="flex w-64 flex-shrink-0 flex-col bg-[var(--tr-moss)] px-5 py-6 text-white">
          <div className="flex items-center gap-2.5 px-1">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
              <Icon name="MapIcon" size={18} variant="solid" className="text-white" />
            </span>
            <span className="tr-mono text-[13px] uppercase tracking-wider">MyCounselor</span>
          </div>

          <nav className="mt-10 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium ${
                  item.active ? 'bg-white/15 text-white' : 'text-white/70'
                }`}
              >
                <Icon name={item.icon} size={18} variant="outline" />
                {item.label}
              </div>
            ))}
          </nav>

          <div className="mt-auto flex items-center gap-3 rounded-lg bg-white/10 px-3 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--tr-blaze)] text-sm font-semibold">
              AR
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">Alex Rivera</p>
              <p className="tr-mono text-[10px] text-white/60">GRADE 12</p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="relative flex-1 overflow-hidden px-8 py-8 sm:px-10">
          <div className="tr-contours" aria-hidden="true" />

          <div className="relative">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="tr-mono text-[11px] text-[var(--tr-moss)]">MILE MARKER 3 OF 6</p>
                <h1 className="mt-2 text-3xl">Hi, Alex — here&rsquo;s the trail ahead.</h1>
              </div>
              <div className="tr-badge tr-badge-blaze gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium">
                <Icon name="FlagIcon" size={14} variant="solid" />
                Next: meeting Thursday
              </div>
            </div>

            {/* Profile puzzle */}
            <div className="mt-8">
              <ProfilePuzzle />
            </div>

            {/* Stats row */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {STATS.map((stat) => (
                <div key={stat.label} className="tr-card flex items-center gap-4 p-5">
                  <span className="tr-badge h-11 w-11">
                    <Icon name={stat.icon} size={20} variant="solid" />
                  </span>
                  <div>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                    <p className="text-[13px] text-[var(--tr-ink-soft)]">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr,1fr]">
              {/* Route */}
              <div>
                <h2 className="text-xl">Your route so far</h2>
                <div className="relative mt-6 pl-2">
                  <div className="tr-route" aria-hidden="true" />
                  <ul className="relative flex flex-col gap-7">
                    {WAYPOINTS.map((wp) => (
                      <li key={wp.label} className="flex items-start gap-5">
                        <span
                          className={`tr-waypoint-dot mt-0.5 ${
                            wp.status === 'done'
                              ? 'tr-waypoint-done'
                              : wp.status === 'current'
                                ? 'tr-waypoint-current'
                                : 'tr-waypoint-upcoming'
                          }`}
                        />
                        <div className="tr-card flex-1 p-4">
                          <p
                            className={`text-[15px] font-medium ${
                              wp.status === 'upcoming' ? 'text-[var(--tr-ink-soft)]' : 'text-[var(--tr-ink)]'
                            }`}
                          >
                            {wp.label}
                          </p>
                          <p className="mt-1 text-[13px] text-[var(--tr-ink-soft)]">{wp.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Trail notes */}
              <div className="tr-card p-6">
                <h2 className="text-lg">Trail notes</h2>
                <p className="mt-1 text-[13px] text-[var(--tr-ink-soft)]">From your counselor and coach</p>
                <div className="mt-5 flex flex-col gap-4">
                  {[
                    { from: 'Dr. Wang', note: 'Great progress on the essay — let’s talk course selection Thursday.' },
                    { from: 'Essay Coach', note: 'Two lines in paragraph 3 read a little generic — see notes.' },
                  ].map((n) => (
                    <div key={n.from} className="border-t border-[var(--tr-line)] pt-4 first:border-t-0 first:pt-0">
                      <p className="tr-mono text-[10px] text-[var(--tr-moss)]">{n.from.toUpperCase()}</p>
                      <p className="mt-1 text-[14px] leading-relaxed text-[var(--tr-ink)]">{n.note}</p>
                    </div>
                  ))}
                </div>
                <a href="#" className="tr-link mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--tr-moss)]">
                  Open messages
                  <Icon name="ArrowRightIcon" size={14} variant="outline" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
