import type { Metadata } from 'next';
import './marginalia.css';
import { lora, karla, caveat } from './fonts';
import Icon from '@/components/ui/AppIcon';

export const metadata: Metadata = {
  title: 'Marginalia Concept - Teacher Dashboard - MyCounselor',
  description: 'Internal design concept preview — not a live page.',
  robots: { index: false, follow: false },
};

const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'HomeIcon', active: true },
  { label: 'My Students', icon: 'UserGroupIcon' },
  { label: 'Requests', icon: 'DocumentTextIcon' },
  { label: 'Messages', icon: 'ChatBubbleLeftRightIcon' },
  { label: 'Resources', icon: 'BookOpenIcon' },
  { label: 'Reports', icon: 'ChartBarIcon' },
];

const REQUESTS = [
  { student: 'Sofia Martinez', kind: 'Recommendation letter', due: 'Due in 2 days', urgent: true },
  { student: 'Diego Fernandez', kind: 'Recommendation letter', due: 'Due in 6 days', urgent: false },
  { student: 'Priya Kapoor', kind: 'Draft review requested', due: 'Due in 9 days', urgent: false },
];

export default function MarginaliaPreview() {
  return (
    <main
      className={`marginalia min-h-screen ${lora.variable} ${karla.variable} ${caveat.variable}`}
    >
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="flex w-64 flex-shrink-0 flex-col bg-[var(--mg-chalk)] px-5 py-6 text-white">
          <div className="flex items-center gap-2.5 px-1">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/12">
              <Icon name="PencilSquareIcon" size={17} variant="solid" className="text-white" />
            </span>
            <span className="text-[14px] font-semibold">MyCounselor</span>
          </div>

          <nav className="mt-10 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium ${
                  item.active ? 'bg-white/14 text-white' : 'text-white/70'
                }`}
              >
                <Icon name={item.icon} size={18} variant="outline" />
                {item.label}
              </div>
            ))}
          </nav>

          <div className="mt-auto flex items-center gap-3 rounded-lg bg-white/10 px-3 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
              LY
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">Ms. Yılmaz</p>
              <p className="text-[10px] text-white/60">ENGLISH DEPARTMENT</p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 px-8 py-8 sm:px-10">
          <h1 className="text-3xl">Good afternoon, Ms. Yılmaz.</h1>
          <p className="mt-1 text-[15px] text-[var(--mg-ink-soft)]">
            3 students are waiting on you this week.
          </p>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr,1fr]">
            {/* Requests as papers on the desk */}
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-wide text-[var(--mg-ink-soft)]">
                On your desk
              </p>
              <div className="mt-5 flex flex-col gap-7">
                {REQUESTS.map((r) => (
                  <div key={r.student} className="mg-card p-5">
                    <span className={`mg-clip ${r.urgent ? 'mg-clip-red' : ''}`} aria-hidden="true" />
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`text-[16px] font-medium ${r.urgent ? 'mg-underline' : ''}`}>
                          {r.student}
                        </p>
                        <p className="mt-1 text-[13px] text-[var(--mg-ink-soft)]">{r.kind}</p>
                      </div>
                      <span
                        className={`whitespace-nowrap text-[12px] font-medium ${
                          r.urgent ? 'text-[var(--mg-red)]' : 'text-[var(--mg-ink-soft)]'
                        }`}
                      >
                        {r.due}
                      </span>
                    </div>
                    <a href="#" className="mg-link mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--mg-chalk)]">
                      Open request
                      <Icon name="ArrowRightIcon" size={14} variant="outline" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar column: margin note + stats */}
            <div className="flex flex-col gap-6">
              <div className="mg-note p-5">
                <p className="mg-script text-2xl text-[var(--mg-ink)]">a note —</p>
                <p className="mt-1 text-[14px] leading-relaxed text-[var(--mg-ink)]">
                  Sofia&rsquo;s letter has an AI first-draft ready to review — usually cuts writing
                  time in half. Worth a look before Thursday.
                </p>
              </div>

              <div className="mg-card p-5">
                <p className="text-[13px] font-semibold uppercase tracking-wide text-[var(--mg-ink-soft)]">
                  This term
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  {[
                    { label: 'Letters due', value: '5' },
                    { label: 'Drafts in progress', value: '2' },
                    { label: 'Students assigned', value: '12' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center justify-between border-t border-[var(--mg-line)] pt-3 first:border-t-0 first:pt-0"
                    >
                      <p className="text-[13px] text-[var(--mg-ink-soft)]">{s.label}</p>
                      <p className="text-[15px] font-semibold">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
