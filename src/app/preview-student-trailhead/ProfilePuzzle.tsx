import Icon from '@/components/ui/AppIcon';

/*
 * The four pieces of a college profile — academics, essay, activities,
 * recommendations — rendered as an actual interlocking jigsaw (real
 * puzzle-cut edges via SVG paths, not four squares with a metaphor bolted
 * on). Each piece fills bottom-up like a gauge as that part gets more
 * complete; at 100% it reads as a solid, settled block. Put together, the
 * four pieces are the whole applicant — that's the idea being illustrated,
 * not just stated.
 */

type Piece = {
  key: string;
  label: string;
  icon: string;
  color: string;
  pale: string;
  pct: number;
  note: string;
};

const PIECES: Piece[] = [
  {
    key: 'academics',
    label: 'Academic Stats',
    icon: 'ChartBarIcon',
    color: 'var(--tr-moss)',
    pale: '#e4e0d2',
    pct: 100,
    note: 'GPA, courses & test scores confirmed',
  },
  {
    key: 'essay',
    label: 'Essay',
    icon: 'PencilSquareIcon',
    color: 'var(--tr-blaze)',
    pale: '#f0e2d2',
    pct: 65,
    note: '2 coach notes left to address',
  },
  {
    key: 'activities',
    label: 'Extracurriculars',
    icon: 'TrophyIcon',
    color: 'var(--tr-gold)',
    pale: '#ece4c8',
    pct: 20,
    note: 'Add 2 more activities to strengthen this',
  },
  {
    key: 'recommendations',
    label: 'Recommendations',
    icon: 'UserGroupIcon',
    color: 'var(--tr-teal)',
    pale: '#d9e6e4',
    pct: 100,
    note: 'Both letters received',
  },
];

// Quadrant assignment within the 2x2 jigsaw grid.
const LAYOUT: Record<'tl' | 'tr' | 'bl' | 'br', string> = {
  tl: 'academics',
  tr: 'essay',
  bl: 'activities',
  br: 'recommendations',
};

// Interlocking jigsaw-cut paths in a 300x300 grid, each quadrant 150x150
// with a rounded tab/notch pair on its two internal shared edges.
const PATHS: Record<'tl' | 'tr' | 'bl' | 'br', string> = {
  tl: 'M0,0 L150,0 L150,60 C166,60 166,90 150,90 L150,150 L90,150 C90,166 60,166 60,150 L0,150 Z',
  tr: 'M150,0 L300,0 L300,150 L240,150 C240,166 210,166 210,150 L150,150 L150,90 C166,90 166,60 150,60 Z',
  bl: 'M0,150 L60,150 C60,166 90,166 90,150 L150,150 L150,210 C166,210 166,240 150,240 L150,300 L0,300 Z',
  br: 'M150,150 L210,150 C210,166 240,166 240,150 L300,150 L300,300 L150,300 L150,240 C166,240 166,210 150,210 L150,150 Z',
};

export default function ProfilePuzzle() {
  const complete = PIECES.filter((p) => p.pct >= 100).length;
  const allDone = complete === PIECES.length;
  const nextUp = [...PIECES].sort((a, b) => a.pct - b.pct)[0];

  return (
    <div className="tr-card p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-xl">Your profile, piece by piece</h2>
          <p className="mt-1 text-[13px] text-[var(--tr-ink-soft)]">
            Four pieces, one applicant. Fill each one in to complete the picture.
          </p>
        </div>
        <span className="tr-mono text-[11px] text-[var(--tr-moss)]">
          {complete} OF {PIECES.length} COMPLETE
        </span>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-center">
        {/* The puzzle */}
        <div className="relative mx-auto w-full max-w-[220px]">
          <svg viewBox="0 0 300 300" className="w-full" aria-hidden="true">
            <defs>
              {PIECES.map((p) => (
                <linearGradient key={p.key} id={`fill-${p.key}`} x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor={p.color} />
                  <stop offset={`${p.pct}%`} stopColor={p.color} />
                  <stop offset={`${p.pct}%`} stopColor={p.pale} />
                  <stop offset="100%" stopColor={p.pale} />
                </linearGradient>
              ))}
            </defs>
            {(Object.keys(PATHS) as Array<keyof typeof PATHS>).map((quad) => {
              const piece = PIECES.find((p) => p.key === LAYOUT[quad])!;
              return (
                <path
                  key={quad}
                  d={PATHS[quad]}
                  fill={`url(#fill-${piece.key})`}
                  stroke="var(--tr-paper)"
                  strokeWidth={6}
                  strokeLinejoin="round"
                />
              );
            })}
          </svg>

          {/* Icon overlay, aligned to the same 2x2 grid as the SVG */}
          <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2">
            {(Object.keys(LAYOUT) as Array<keyof typeof LAYOUT>).map((quad) => {
              const piece = PIECES.find((p) => p.key === LAYOUT[quad])!;
              const done = piece.pct >= 100;
              return (
                <div key={quad} className="flex flex-col items-center justify-center gap-1">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85"
                    style={{ color: piece.color }}
                  >
                    <Icon name={done ? 'CheckIcon' : piece.icon} size={16} variant="solid" />
                  </span>
                  <span className="tr-mono text-[9px] text-white/90 drop-shadow-sm">{piece.pct}%</span>
                </div>
              );
            })}
          </div>

          {allDone && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="tr-badge tr-badge-blaze h-11 w-11 rounded-full">
                <Icon name="FlagIcon" size={18} variant="solid" />
              </span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-col divide-y divide-[var(--tr-line)]">
          {PIECES.map((p) => {
            const done = p.pct >= 100;
            return (
              <div key={p.key} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${p.pale}`, color: p.color }}
                >
                  <Icon name={done ? 'CheckIcon' : p.icon} size={16} variant="solid" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[14px] font-medium text-[var(--tr-ink)]">{p.label}</p>
                    <span className="tr-mono text-[11px] text-[var(--tr-ink-soft)]">{p.pct}%</span>
                  </div>
                  <p className="mt-0.5 truncate text-[12px] text-[var(--tr-ink-soft)]">{p.note}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!allDone && (
        <p className="mt-5 border-t border-[var(--tr-line)] pt-4 text-[13px] text-[var(--tr-ink-soft)]">
          Next up: <span className="font-medium text-[var(--tr-ink)]">{nextUp.label}</span> — {nextUp.note.toLowerCase()}
        </p>
      )}
    </div>
  );
}
