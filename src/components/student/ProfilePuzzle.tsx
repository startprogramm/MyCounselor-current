'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { ContentCard } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/AppIcon';
import {
  scoredPieces,
  scoreRecommendations,
  type PuzzleBand,
  type PuzzlePiece,
  type RecommendationCoverage,
} from '@/lib/profile-puzzle';
import type { Database } from '@/lib/database.types';

type AcademicProfileRow = Database['public']['Tables']['student_academic_profiles']['Row'];

const BAND_STYLE: Record<PuzzleBand, { badge: 'default' | 'destructive' | 'warning' | 'primary' | 'success'; bar: string }> = {
  'Not Started': { badge: 'default', bar: 'bg-muted-foreground/30' },
  'Just Starting': { badge: 'destructive', bar: 'bg-destructive' },
  Developing: { badge: 'warning', bar: 'bg-warning' },
  Solid: { badge: 'primary', bar: 'bg-primary' },
  Standout: { badge: 'success', bar: 'bg-success' },
};

function PieceCard({
  icon,
  label,
  band,
  fillPct,
  note,
}: {
  icon: string;
  label: string;
  band: PuzzleBand;
  fillPct: number;
  note: string;
}) {
  const style = BAND_STYLE[band];
  return (
    <div className="relative rounded-xl border border-border bg-muted p-4">
      <Icon
        name="PuzzlePieceIcon"
        size={18}
        variant="outline"
        className="absolute right-3 top-3 text-muted-foreground/20"
      />
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon name={icon} size={18} variant="outline" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <Badge variant={style.badge} size="sm" className="mt-1">
            {band}
          </Badge>
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-background">
        <div
          className={`h-full rounded-full transition-all ${style.bar}`}
          style={{ width: `${fillPct}%` }}
        />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{note}</p>
    </div>
  );
}

export default function ProfilePuzzle() {
  const { user } = useAuth();
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-muted" />
          ))}
        </div>
      </ContentCard>
    );
  }

  const pieces: PuzzlePiece[] = scoredPieces(profile);
  const recommendations: RecommendationCoverage = scoreRecommendations(recRequested, recStatuses);
  const startedCount = pieces.filter((p) => p.score != null).length + (recRequested > 0 ? 1 : 0);

  return (
    <ContentCard
      title="Your Profile, Piece by Piece"
      description="Six pieces of your applicant profile — colleges read them together, not one at a time."
      action={
        <span className="text-sm font-medium text-muted-foreground">{startedCount} of 6 started</span>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pieces.map((piece) => (
          <PieceCard
            key={piece.key}
            icon={piece.icon}
            label={piece.label}
            band={piece.band}
            fillPct={piece.score ?? 0}
            note={piece.note}
          />
        ))}

        <PieceCard
          icon={recommendations.icon}
          label={recommendations.label}
          band={recommendations.secured >= recommendations.target ? 'Standout' : recommendations.requested > 0 ? 'Developing' : 'Not Started'}
          fillPct={Math.min(100, (recommendations.secured / recommendations.target) * 100)}
          note={recommendations.note}
        />
      </div>
    </ContentCard>
  );
}
