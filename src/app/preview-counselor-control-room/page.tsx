import type { Metadata } from 'next';
import './control-room.css';
import { plexSans, plexMono } from './fonts';
import Icon from '@/components/ui/AppIcon';

export const metadata: Metadata = {
  title: 'Control Room Concept - Counselor Dashboard - MyCounselor',
  description: 'Internal design concept preview — not a live page.',
  robots: { index: false, follow: false },
};

const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'Squares2X2Icon', active: true },
  { label: 'Students', icon: 'UserGroupIcon' },
  { label: 'Parents', icon: 'HomeIcon' },
  { label: 'Tasks', icon: 'ClipboardDocumentCheckIcon' },
  { label: 'Meetings', icon: 'CalendarDaysIcon' },
  { label: 'Messages', icon: 'ChatBubbleLeftRightIcon' },
  { label: 'Availability', icon: 'ClockIcon' },
  { label: 'Guidance Content', icon: 'BookOpenIcon' },
];

const BOARD = [
  { name: 'Sofia M.', grade: '12', status: 'amber' as const, flag: 'Essay overdue — 2 days' },
  { name: 'Jordan L.', grade: '11', status: 'green' as const, flag: 'On track' },
  { name: 'Ava R.', grade: '12', status: 'amber' as const, flag: 'Meeting today, 2:00 PM' },
  { name: 'Marcus T.', grade: '10', status: 'quiet' as const, flag: 'No activity 9 days' },
  { name: 'Priya K.', grade: '12', status: 'green' as const, flag: 'Application submitted' },
  { name: 'Diego F.', grade: '11', status: 'green' as const, flag: 'On track' },
  { name: 'Emma S.', grade: '12', status: 'amber' as const, flag: 'Parent link pending approval' },
  { name: 'Noah B.', grade: '9', status: 'quiet' as const, flag: 'No activity 14 days' },
];

const QUEUE = [
  { student: 'Sofia M.', item: 'Essay draft 2 days overdue', priority: 'High' },
  { student: 'Emma S.', item: 'Parent link needs your approval', priority: 'High' },
  { student: 'Ava R.', item: 'Confirm 2:00 PM meeting', priority: 'Medium' },
];

export default function ControlRoomPreview() {
  return (
    <main
      className={`control-room min-h-screen ${plexSans.variable} ${plexMono.variable}`}
    >
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="flex w-64 flex-shrink-0 flex-col border-r border-[var(--cr-line)] px-5 py-6">
          <div className="flex items-center gap-2.5 px-1">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--cr-blue)]/15">
              <Icon name="Squares2X2Icon" size={17} variant="solid" className="text-[var(--cr-blue)]" />
            </span>
            <span className="cr-mono text-[12px] uppercase text-[var(--cr-text-soft)]">MyCounselor</span>
          </div>

          <nav className="mt-10 flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium ${
                  item.active
                    ? 'bg-[var(--cr-panel-2)] text-[var(--cr-text)]'
                    : 'text-[var(--cr-text-soft)]'
                }`}
              >
                <Icon name={item.icon} size={16} variant="outline" />
                {item.label}
              </div>
            ))}
          </nav>

          <div className="mt-auto cr-panel flex items-center gap-3 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--cr-blue)] text-[12px] font-semibold text-white">
              DW
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium">Dr. Wang</p>
              <p className="cr-mono text-[10px] text-[var(--cr-text-soft)]">COUNSELOR</p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 px-8 py-8 sm:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="cr-mono text-[11px] text-[var(--cr-text-soft)]">CASELOAD OVERVIEW</p>
              <h1 className="mt-2 text-2xl font-semibold">24 students, 3 need you today.</h1>
            </div>
            <div className="cr-mono flex items-center gap-2 text-[12px] text-[var(--cr-text-soft)]">
              <span className="cr-dot cr-dot-green cr-live" />
              LIVE &middot; UPDATED 09:41
            </div>
          </div>

          {/* Stats */}
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Active students', value: '24', icon: 'UserGroupIcon' },
              { label: 'Flagged for follow-up', value: '3', icon: 'ExclamationTriangleIcon' },
              { label: 'Response rate', value: '92%', icon: 'ChartBarIcon' },
            ].map((s) => (
              <div key={s.label} className="cr-panel flex items-center gap-4 p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--cr-blue)]/12 text-[var(--cr-blue)]">
                  <Icon name={s.icon} size={18} variant="solid" />
                </span>
                <div>
                  <p className="cr-mono text-xl">{s.value}</p>
                  <p className="text-[12px] text-[var(--cr-text-soft)]">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr,1fr]">
            {/* Status board */}
            <div>
              <p className="cr-mono text-[11px] text-[var(--cr-text-soft)]">STATUS BOARD</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {BOARD.map((s) => (
                  <div key={s.name} className="cr-tile p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[14px] font-medium">{s.name}</p>
                      <span
                        className={`cr-dot ${
                          s.status === 'green'
                            ? 'cr-dot-green'
                            : s.status === 'amber'
                              ? 'cr-dot-amber'
                              : 'cr-dot-quiet'
                        }`}
                      />
                    </div>
                    <p className="cr-mono mt-1 text-[10px] text-[var(--cr-text-soft)]">GRADE {s.grade}</p>
                    <p className="mt-2 text-[12px] text-[var(--cr-text-soft)]">{s.flag}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority queue */}
            <div className="cr-panel p-5">
              <p className="cr-mono text-[11px] text-[var(--cr-text-soft)]">PRIORITY QUEUE</p>
              <div className="mt-4 flex flex-col gap-4">
                {QUEUE.map((q) => (
                  <div key={q.item} className="border-t border-[var(--cr-line)] pt-4 first:border-t-0 first:pt-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-medium">{q.student}</p>
                      <span className={`cr-badge ${q.priority === 'High' ? 'cr-badge-amber' : 'cr-badge-blue'}`}>
                        {q.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] text-[var(--cr-text-soft)]">{q.item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
