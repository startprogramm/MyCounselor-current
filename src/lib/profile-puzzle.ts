import type { Database } from '@/lib/database.types';

type AcademicProfileRow = Database['public']['Tables']['student_academic_profiles']['Row'];

export type PuzzleBand = 'Not Started' | 'Just Starting' | 'Developing' | 'Solid' | 'Standout';

/**
 * Whether this piece reinforces the same throughline as the rest of the
 * profile (e.g. a robotics award for a CS-intending student) or pulls
 * against it (e.g. a chemistry-focused honor for the same student).
 * null = not yet evaluated — the narrative-fit AI pass hasn't run.
 */
export type PuzzleConsistency = 'aligned' | 'off_theme' | null;

export interface PuzzlePiece {
  key: string;
  label: string;
  icon: string;
  score: number | null; // 0-100, null = no data yet
  band: PuzzleBand;
  consistency: PuzzleConsistency;
  note: string;
}

export interface RecommendationCoverage {
  key: 'recommendations';
  label: string;
  icon: string;
  requested: number;
  secured: number; // letters marked 'final'
  target: number;
  note: string;
}

const TARGET_RECOMMENDATIONS = 2;

function band(score: number | null): PuzzleBand {
  if (score == null) return 'Not Started';
  if (score >= 85) return 'Standout';
  if (score >= 65) return 'Solid';
  if (score >= 40) return 'Developing';
  return 'Just Starting';
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

interface CourseGrade {
  grade?: string;
  status?: 'predicted' | 'final';
}

const GRADE_POINTS: Record<string, number> = {
  'A*': 8,
  A: 7,
  B: 6,
  C: 5,
  D: 4,
  E: 3,
  F: 2,
  G: 1,
};

function averageGradePoints(courses: unknown): number | null {
  const list = (courses as CourseGrade[] | null | undefined)?.filter((c) => c?.grade) ?? [];
  if (list.length === 0) return null;
  const points = list
    .map((c) => GRADE_POINTS[c.grade!.trim().toUpperCase()])
    .filter((p): p is number => p != null);
  if (points.length === 0) return null;
  return points.reduce((sum, p) => sum + p, 0) / points.length;
}

/** Academic Rigor — course grades, Cambridge-pathway first with a GPA fallback. */
export function scoreAcademicRigor(p: AcademicProfileRow | null): PuzzlePiece {
  const base = {
    key: 'academics',
    label: 'Academic Rigor',
    icon: 'AcademicCapIcon',
    consistency: null as PuzzleConsistency,
  };

  const avgPoints =
    averageGradePoints(p?.a_level_courses) ??
    averageGradePoints(p?.as_level_subjects) ??
    averageGradePoints(p?.igcse_subjects);

  if (avgPoints != null) {
    const score = clamp((avgPoints / 8) * 100);
    return {
      ...base,
      score,
      band: band(score),
      note: `Based on current course grades (avg ${avgPoints.toFixed(1)}/8 points)`,
    };
  }

  const gpa = p?.gpa_unweighted ?? p?.gpa_weighted;
  if (gpa != null) {
    const score = clamp((gpa / 4) * 100);
    return {
      ...base,
      score,
      band: band(score),
      note: `Based on GPA (${gpa.toFixed(2)}/4.0)`,
    };
  }

  return {
    ...base,
    score: null,
    band: 'Not Started',
    note: 'Add your course grades or GPA in the Academic Profile',
  };
}

/** Standardized Testing — SAT/ACT, with English proficiency as a fallback signal. */
export function scoreTesting(p: AcademicProfileRow | null): PuzzlePiece {
  const base = { key: 'testing', label: 'Standardized Testing', icon: 'ChartBarIcon', consistency: null as PuzzleConsistency };

  const scores: number[] = [];
  if (p?.sat_total != null) scores.push(clamp(((p.sat_total - 400) / 1200) * 100));
  if (p?.act_composite != null) scores.push(clamp(((p.act_composite - 1) / 35) * 100));

  if (scores.length > 0) {
    const score = Math.max(...scores);
    return {
      ...base,
      score,
      band: band(score),
      note:
        p?.sat_total != null && p?.act_composite != null
          ? `SAT ${p.sat_total}, ACT ${p.act_composite}`
          : p?.sat_total != null
            ? `SAT ${p.sat_total}`
            : `ACT ${p!.act_composite}`,
    };
  }

  if (p?.english_test_type) {
    return {
      ...base,
      score: 55,
      band: band(55),
      note: `${p.english_test_type}${p.english_test_score ? ` ${p.english_test_score}` : ''} on file — add SAT/ACT if you're taking one`,
    };
  }

  return {
    ...base,
    score: null,
    band: 'Not Started',
    note: 'Add SAT, ACT, or an English proficiency score',
  };
}

interface Extracurricular {
  leadershipPosition?: string;
  years?: string;
  hoursPerWeek?: string;
  weeksPerYear?: string;
  description?: string;
  gradeLevels?: string[];
}

function activityDepth(a: Extracurricular): number {
  let points = 0;
  if (a.leadershipPosition?.trim()) points += 3;
  if (Number(a.years) >= 2) points += 2;
  if (Number(a.hoursPerWeek) * Number(a.weeksPerYear) >= 150) points += 2;
  if ((a.description?.trim().length ?? 0) > 60) points += 2;
  if ((a.gradeLevels?.length ?? 0) >= 2) points += 1;
  return points; // 0-10
}

/** Extracurricular Depth — top 3 activities only, so a long shallow list doesn't score as well as a few real ones. */
export function scoreExtracurriculars(p: AcademicProfileRow | null): PuzzlePiece {
  const base = { key: 'extracurriculars', label: 'Extracurricular Depth', icon: 'BoltIcon', consistency: null as PuzzleConsistency };
  const activities = (p?.extracurriculars as Extracurricular[] | null) ?? [];

  if (activities.length === 0) {
    return {
      ...base,
      score: null,
      band: 'Not Started',
      note: 'Add your activities in the Academic Profile',
    };
  }

  const topDepths = activities
    .map(activityDepth)
    .sort((a, b) => b - a)
    .slice(0, 3);
  const avgDepth = topDepths.reduce((sum, d) => sum + d, 0) / topDepths.length;
  const score = clamp(avgDepth * 10);

  return {
    ...base,
    score,
    band: band(score),
    note: `Based on your top ${topDepths.length} activit${topDepths.length === 1 ? 'y' : 'ies'} by depth — leadership, time commitment, and specifics count more than a long list`,
  };
}

interface HonorAward {
  level?: 'School' | 'Regional' | 'State' | 'National' | 'International';
}

const HONOR_WEIGHT: Record<string, number> = {
  International: 20,
  National: 15,
  State: 10,
  Regional: 6,
  School: 3,
};

/** Honors & Distinction — externally-validated recognition, weighted by level. */
export function scoreHonors(p: AcademicProfileRow | null): PuzzlePiece {
  const base = { key: 'honors', label: 'Honors & Distinction', icon: 'TrophyIcon', consistency: null as PuzzleConsistency };
  const awards = (p?.honors_awards as HonorAward[] | null) ?? [];

  if (awards.length === 0) {
    return {
      ...base,
      score: null,
      band: 'Not Started',
      note: 'Add any honors or awards in the Academic Profile',
    };
  }

  const total = awards.reduce((sum, a) => sum + (HONOR_WEIGHT[a.level ?? 'School'] ?? 3), 0);
  const score = clamp(total);

  return {
    ...base,
    score,
    band: band(score),
    note: `${awards.length} award${awards.length === 1 ? '' : 's'} on file`,
  };
}

/** Essay & Voice — the persisted score from the student's latest Essay Coach run. */
export function scoreEssay(p: AcademicProfileRow | null): PuzzlePiece {
  const base = { key: 'essay', label: 'Essay & Voice', icon: 'PencilSquareIcon', consistency: null as PuzzleConsistency };

  if (p?.essay_readiness_score == null) {
    return {
      ...base,
      score: null,
      band: 'Not Started',
      note: 'Run your draft through the Essay Coach to see this piece',
    };
  }

  const score = clamp(p.essay_readiness_score);
  return {
    ...base,
    score,
    band: band(score),
    note: 'From your latest Essay Coach review',
  };
}

/**
 * Recommendations — deliberately not a quality score. A student can't see
 * or influence what a teacher writes, so this tracks coverage (how many
 * recommenders are lined up and how far along they are) instead of
 * grading someone else's letter.
 */
export function scoreRecommendations(
  requestedCount: number,
  letterStatuses: string[]
): RecommendationCoverage {
  const secured = letterStatuses.filter((s) => s === 'final').length;
  const inProgress = letterStatuses.filter((s) => s === 'drafting').length;

  let note: string;
  if (requestedCount === 0) {
    note = 'Ask a teacher for a recommendation from your Requests page';
  } else if (secured >= TARGET_RECOMMENDATIONS) {
    note = `${secured} letter${secured === 1 ? '' : 's'} finalized`;
  } else if (inProgress > 0) {
    note = `${secured} finalized, ${inProgress} in progress`;
  } else {
    note = `${requestedCount} requested — waiting on your teacher${requestedCount === 1 ? '' : 's'}`;
  }

  return {
    key: 'recommendations',
    label: 'Recommendations',
    icon: 'UserGroupIcon',
    requested: requestedCount,
    secured,
    target: TARGET_RECOMMENDATIONS,
    note,
  };
}

export function scoredPieces(p: AcademicProfileRow | null): PuzzlePiece[] {
  return [
    scoreAcademicRigor(p),
    scoreTesting(p),
    scoreExtracurriculars(p),
    scoreHonors(p),
    scoreEssay(p),
  ];
}
