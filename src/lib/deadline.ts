export type DeadlineTone = 'overdue' | 'soon' | 'plenty';

export interface DeadlineMeta {
  formatted: string;
  relative: string;
  tone: DeadlineTone;
}

export const DEADLINE_TONE_CLASSES: Record<DeadlineTone, string> = {
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  soon: 'bg-warning/10 text-warning border-warning/20',
  plenty: 'bg-muted/40 text-foreground border-border',
};

export function getDeadlineMeta(deadline: string): DeadlineMeta | null {
  if (!deadline) return null;
  const target = new Date(`${deadline}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
  const formatted = target.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays);
    return { formatted, relative: `overdue by ${daysAgo} day${daysAgo === 1 ? '' : 's'}`, tone: 'overdue' };
  }
  if (diffDays === 0) return { formatted, relative: 'due today', tone: 'soon' };
  if (diffDays <= 7) return { formatted, relative: `${diffDays} day${diffDays === 1 ? '' : 's'} left`, tone: 'soon' };
  return { formatted, relative: `${diffDays} days left`, tone: 'plenty' };
}
