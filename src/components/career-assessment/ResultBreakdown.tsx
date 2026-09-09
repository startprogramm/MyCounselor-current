import React from 'react';
import { Card, ContentCard } from '@/components/ui/Card';
import type { Json } from '@/lib/database.types';
import type { AssessmentType, DdoResultRow, RiasecResult, CmiResult } from '@/lib/career-assessment';

function ScoreBar({ label, score, max, careers }: { label: string; score: number; max: number; careers?: string[] }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{score}/{max}</span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
      </div>
      {careers && careers.length > 0 && <p className="text-xs text-muted-foreground">{careers.join(', ')}</p>}
    </div>
  );
}

export default function ResultBreakdown({ assessmentType, scores }: { assessmentType: AssessmentType; scores: Json }) {
  if (assessmentType === 'ddo') {
    const rows = scores as unknown as DdoResultRow[];
    return (
      <ContentCard title="Kasbiy yo'nalishlar bo'yicha natija" description="Har bir toifa bo'yicha 8 balldan qanchasi to'plangani">
        <div className="space-y-4">
          {rows.map((row) => (
            <ScoreBar key={row.key} label={row.label} score={row.score} max={8} careers={row.careers} />
          ))}
        </div>
      </ContentCard>
    );
  }

  if (assessmentType === 'riasec') {
    const result = scores as unknown as RiasecResult;
    return (
      <ContentCard title="Holland toifalari bo'yicha natija" description="Har bir toifa bo'yicha 50 balldan qanchasi to'plangani">
        <div className="space-y-4">
          {result.ranked.map((row) => (
            <ScoreBar key={row.key} label={`${row.letter} — ${row.label}`} score={row.score} max={50} careers={row.careers} />
          ))}
        </div>
      </ContentCard>
    );
  }

  const result = scores as unknown as CmiResult;
  const levelStyle =
    result.level === 'high'
      ? 'bg-success/10 text-success'
      : result.level === 'medium'
        ? 'bg-warning/10 text-warning'
        : 'bg-destructive/10 text-destructive';

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${levelStyle}`}>{result.levelLabel}</span>
      </Card>
      <ContentCard title="Bloklar bo'yicha natija" description="Har bir blok bo'yicha 10 balldan qanchasi to'plangani">
        <div className="space-y-4">
          {result.blocks.map((block) => (
            <ScoreBar key={block.key} label={block.label} score={block.score} max={10} />
          ))}
        </div>
      </ContentCard>
    </div>
  );
}
