'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { ContentCard } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/AppIcon';
import {
  scoredPieces,
  scoreRecommendations,
  type PuzzleBand,
  type PuzzleConsistency,
  type PuzzlePiece,
  type RecommendationCoverage,
} from '@/lib/profile-puzzle';
import type { Database } from '@/lib/database.types';

type AcademicProfileRow = Database['public']['Tables']['student_academic_profiles']['Row'];

/*
 * Real interlocking jigsaw geometry — 2 rows x 3 columns, generated rather
 * than hand-authored so the tab/notch pairs stay consistent: every internal
 * horizontal boundary bulges toward the row below, every internal vertical
 * boundary bulges toward the column to the right. Whichever piece owns that
 * edge, the curve is identical — one piece's tab is the neighbor's notch.
 */
const ROWS = 2;
const COLS = 3;
const CELL = 150;
const TAB_HALF = 15;
const TAB_DEPTH = 16;

function piecePath(row: number, col: number): string {
  const x0 = col * CELL;
  const y0 = row * CELL;
  const x1 = x0 + CELL;
  const y1 = y0 + CELL;
  const xm = x0 + CELL / 2;
  const ym = y0 + CELL / 2;

  const hasTop = row > 0;
  const hasRight = col < COLS - 1;
  const hasBottom = row < ROWS - 1;
  const hasLeft = col > 0;

  let d = `M${x0},${y0}`;

  if (hasTop) {
    d += ` L${xm - TAB_HALF},${y0} C${xm - TAB_HALF},${y0 + TAB_DEPTH} ${xm + TAB_HALF},${y0 + TAB_DEPTH} ${xm + TAB_HALF},${y0}`;
  }
  d += ` L${x1},${y0}`;

  if (hasRight) {
    d += ` L${x1},${ym - TAB_HALF} C${x1 + TAB_DEPTH},${ym - TAB_HALF} ${x1 + TAB_DEPTH},${ym + TAB_HALF} ${x1},${ym + TAB_HALF}`;
  }
  d += ` L${x1},${y1}`;

  if (hasBottom) {
    d += ` L${xm + TAB_HALF},${y1} C${xm + TAB_HALF},${y1 + TAB_DEPTH} ${xm - TAB_HALF},${y1 + TAB_DEPTH} ${xm - TAB_HALF},${y1}`;
  }
  d += ` L${x0},${y1}`;

  if (hasLeft) {
    d += ` L${x0},${ym + TAB_HALF} C${x0 + TAB_DEPTH},${ym + TAB_HALF} ${x0 + TAB_DEPTH},${ym - TAB_HALF} ${x0},${ym - TAB_HALF}`;
  }
  d += ` Z`;

  return d;
}

interface GridPiece {
  row: number;
  col: number;
  key: string;
  label: string;
  icon: string;
  score: number | null;
  band: PuzzleBand;
  consistency: PuzzleConsistency;
  note: string;
  isRecommendations?: boolean;
}

type Tier = 'empty' | 'blurry' | 'solid';

function tierFor(score: number | null): Tier {
  if (score == null) return 'empty';
  return score >= 65 ? 'solid' : 'blurry';
}

// Every student gets their own signature hue, derived deterministically
// from their account id — stable across visits, different from everyone
// else's. No two students' puzzles look alike.
function signatureHue(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

function hsl(hue: number, saturation: number, lightness: number): string {
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Hue speaks to narrative fit; clarity (below) speaks to strength.
// "Off-theme" stays a fixed red regardless of a student's signature color
// — it's the one signal that needs to read instantly, even to a counselor
// scanning many different students' puzzles. Everything else uses the
// student's own color, at low saturation until it's actually been judged.
function pieceColor(piece: GridPiece, hue: number): string {
  if (piece.consistency === 'off_theme') return 'var(--color-destructive)';
  if (piece.consistency === 'aligned') return hsl(hue, 65, 50);
  return hsl(hue, 32, 62); // not yet evaluated, incl. Recommendations
}

const BAND_BADGE: Record<PuzzleBand, 'default' | 'destructive' | 'warning' | 'primary' | 'success'> = {
  'Not Started': 'default',
  'Just Starting': 'destructive',
  Developing: 'warning',
  Solid: 'primary',
  Standout: 'success',
};

export default function ProfilePuzzle() {
  const { user } = useAuth();
  const hue = useMemo(() => signatureHue(user?.id ?? ''), [user?.id]);
  const [profile, setProfile] = useState<AcademicProfileRow | null>(null);
  const [recRequested, setRecRequested] = useState(0);
  const [recStatuses, setRecStatuses] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    (async () => {
      const [profileRes, recCountRes, recStatusRes] = await Promise.all([
        supabase
          .from('student_academic_profiles')
          .select('*')
          .eq('student_id', user.id)
          .maybeSingle(),
        supabase
          .from('requests')
          .select('id', { count: 'exact', head: true })
          .eq('student_id', user.id)
          .eq('category', 'recommendation'),
        supabase.rpc('my_recommendation_letter_statuses'),
      ]);

      if (cancelled) return;
      setProfile(profileRes.data ?? null);
      setRecRequested(recCountRes.count ?? 0);
      setRecStatuses(recStatusRes.data?.map((r) => r.status) ?? []);
      setLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (!loaded) {
    return (
      <ContentCard title="Your Profile, Piece by Piece">
        <div className="mx-auto aspect-[3/2] max-w-md animate-pulse rounded-xl bg-muted" />
      </ContentCard>
    );
  }

  const scored: PuzzlePiece[] = scoredPieces(profile);
  const recommendations: RecommendationCoverage = scoreRecommendations(recRequested, recStatuses);

  const layout: [number, number][] = [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [1, 2],
  ];

  const pieces: GridPiece[] = [...scored, null].map((piece, i) => {
    const [row, col] = layout[i];
    if (piece) {
      return { row, col, ...piece };
    }
    const recBand: PuzzleBand =
      recommendations.secured >= recommendations.target
        ? 'Standout'
        : recommendations.requested > 0
          ? 'Developing'
          : 'Not Started';
    return {
      row,
      col,
      key: recommendations.key,
      label: recommendations.label,
      icon: recommendations.icon,
      score: Math.min(100, (recommendations.secured / recommendations.target) * 100),
      band: recBand,
      consistency: null,
      note: recommendations.note,
      isRecommendations: true,
    };
  });

  const startedCount = pieces.filter((p) => p.band !== 'Not Started').length;
  const anyEvaluated = scored.some((p) => p.consistency != null);

  return (
    <ContentCard
      title="Your Profile, Piece by Piece"
      description="Six pieces of your applicant profile — colleges read them together, not one at a time."
      action={
        <span className="text-sm font-medium text-muted-foreground">{startedCount} of 6 started</span>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr,1fr] lg:items-start">
        {/* The puzzle */}
        <div>
          <div className="relative mx-auto w-full max-w-lg">
            <svg viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`} className="w-full">
              <defs>
                <filter id="pp-blur" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" />
                </filter>
              </defs>
              {pieces.map((piece) => {
                const tier = tierFor(piece.score);
                const fill = tier === 'empty' ? 'var(--color-muted)' : pieceColor(piece, hue);
                return (
                  <path
                    key={piece.key}
                    d={piecePath(piece.row, piece.col)}
                    fill={fill}
                    fillOpacity={tier === 'solid' ? 1 : tier === 'blurry' ? 0.4 : 1}
                    filter={tier === 'blurry' ? 'url(#pp-blur)' : undefined}
                    stroke="var(--color-card)"
                    strokeWidth={6}
                    strokeLinejoin="round"
                  />
                );
              })}
            </svg>

            <div
              className="pointer-events-none absolute inset-0 grid"
              style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}
            >
              {pieces.map((piece) => (
                <div key={piece.key} className="flex flex-col items-center justify-center gap-1 p-1 text-center">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-foreground">
                    <Icon name={piece.icon} size={14} variant="solid" />
                  </span>
                  <span className="rounded bg-black/35 px-1.5 py-0.5 text-[10px] font-medium leading-tight text-white">
                    {piece.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: hsl(hue, 65, 50) }} /> Fits your
              story
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive" /> Off-theme
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full blur-[1px]" style={{ background: hsl(hue, 32, 62) }} />{' '}
              Still developing
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: hsl(hue, 65, 50) }} /> Solid
            </span>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            This is your color — every student's puzzle is tinted differently.
            {!anyEvaluated && ' Narrative-fit scoring (this color vs. red) is coming soon; pieces stay pale until then.'}
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-col divide-y divide-border">
          {pieces.map((piece) => (
            <div key={piece.key} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{piece.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{piece.note}</p>
              </div>
              <Badge variant={BAND_BADGE[piece.band]} size="sm" className="flex-shrink-0">
                {piece.band}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </ContentCard>
  );
}
