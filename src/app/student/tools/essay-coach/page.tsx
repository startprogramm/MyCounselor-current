'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface DimensionScore {
  score: number;
  verdict: string;
  strengths: string[];
  areasForGrowth: string[];
}

interface DimensionBreakdown {
  authenticityAndVoice: DimensionScore;
  reflectionAndGrowth: DimensionScore;
  narrativeStructureAndHook: DimensionScore;
  promptAlignment: DimensionScore;
}

interface LineItemCritique {
  originalText: string;
  issueType: 'AI Voice Risk' | 'Generic Cliché' | 'Resume Dumping' | 'Vague Reflection' | 'Weak Transition';
  admissionsOfficerReaction: string;
  actionableFix: string;
}

interface EssayFeedback {
  overallReadinessScore: number;
  admissionsVerdict: string;
  executiveSummary: string;
  dimensionBreakdown: DimensionBreakdown;
  lineItemCritiques: LineItemCritique[];
  topPrioritiesToFix: string[];
}

const DIMENSION_LABELS: Record<keyof DimensionBreakdown, string> = {
  authenticityAndVoice: 'Authenticity & Voice',
  reflectionAndGrowth: 'Reflection & Growth',
  narrativeStructureAndHook: 'Narrative Structure & Hook',
  promptAlignment: 'Prompt Alignment',
};

const ISSUE_TYPE_STYLES: Record<LineItemCritique['issueType'], string> = {
  'AI Voice Risk': 'bg-violet-500/10 text-violet-600',
  'Generic Cliché': 'bg-pink-500/10 text-pink-600',
  'Resume Dumping': 'bg-orange-500/10 text-orange-600',
  'Vague Reflection': 'bg-amber-500/10 text-amber-600',
  'Weak Transition': 'bg-blue-500/10 text-blue-600',
};

function scoreColor(s: number) {
  return s >= 80 ? '#16A34A' : s >= 60 ? '#2563EB' : s >= 40 ? '#F97316' : '#EF4444';
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            className="text-muted/40"
          />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            strokeWidth="5"
            stroke={color}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
          {Math.round(score)}
        </span>
      </div>
      <span className="text-xs text-muted-foreground font-medium text-center">{label}</span>
    </div>
  );
}

function DimensionCard({ label, dim }: { label: string; dim: DimensionScore }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-4">
        <ScoreRing score={dim.score} label="" />
        <div className="flex-1">
          <p className="font-semibold text-foreground text-sm">{label}</p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{dim.verdict}</p>
        </div>
      </div>
      {(dim.strengths.length > 0 || dim.areasForGrowth.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-3 pt-1">
          {dim.strengths.length > 0 && (
            <ul className="space-y-1.5">
              {dim.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          )}
          {dim.areasForGrowth.length > 0 && (
            <ul className="space-y-1.5">
              {dim.areasForGrowth.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function EssayCoachPage() {
  const { user } = useAuth();
  const [essayPrompt, setEssayPrompt] = useState('');
  const [targetUniversity, setTargetUniversity] = useState('');
  const [wordLimit, setWordLimit] = useState(650);
  const [essay, setEssay] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<EssayFeedback | null>(null);
  const [error, setError] = useState('');

  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;

  async function analyze() {
    if (!essay.trim() || essay.length < 50) {
      setError('Please paste your essay (at least 50 characters).');
      return;
    }
    setError('');
    setIsAnalyzing(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/ai-essay-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essay,
          essayPrompt,
          targetUniversity,
          wordLimit,
          studentId: user?.id,
          gradeLevel: user?.gradeLevel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed.');
      setFeedback(data.feedback);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/student/tools"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
            AI Essay Coach
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Paste your essay and get admissions-officer-level feedback in seconds
          </p>
        </div>
        <div className="ml-auto hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-600 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
          AI-Powered
        </div>
      </div>

      {/* Input section */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Essay Prompt <span className="normal-case font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={essayPrompt}
            onChange={(e) => setEssayPrompt(e.target.value)}
            placeholder="e.g. Describe a challenge you've overcome and what you learned"
            className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground
              placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-violet-500/40
              focus:border-violet-500 transition-colors"
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Target University <span className="normal-case font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={targetUniversity}
              onChange={(e) => setTargetUniversity(e.target.value)}
              placeholder="e.g. Stanford University"
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground
                placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-violet-500/40
                focus:border-violet-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Word Limit
            </label>
            <input
              type="number"
              min={50}
              max={2000}
              value={wordLimit}
              onChange={(e) => setWordLimit(Math.max(1, Number(e.target.value) || 650))}
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground
                focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Your Essay
            </label>
            <span
              className={`text-xs font-medium ${wordCount > wordLimit ? 'text-destructive' : 'text-muted-foreground'}`}
            >
              {wordCount} words{' '}
              {wordCount > 0 &&
                `(${wordCount > wordLimit ? 'over' : wordLimit - wordCount + ' under'} ${wordLimit} limit)`}
            </span>
          </div>
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Paste your college essay here..."
            rows={12}
            className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground
              placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-violet-500/40
              focus:border-violet-500 transition-colors resize-y font-mono leading-relaxed"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <button
          onClick={analyze}
          disabled={isAnalyzing || !essay.trim()}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold
            hover:from-violet-600 hover:to-purple-700 transition-all shadow-sm shadow-violet-500/25
            disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Analyzing your essay…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Analyze Essay
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {feedback && (
        <div className="space-y-6 animate-[fadeIn_0.4s_ease]">
          {/* Overall Score */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="text-center flex-shrink-0">
                <div
                  className="text-5xl font-black"
                  style={{ color: scoreColor(feedback.overallReadinessScore) }}
                >
                  {Math.round(feedback.overallReadinessScore)}
                </div>
                <div className="text-sm text-muted-foreground font-medium mt-1">out of 100</div>
              </div>
              <div className="flex-1">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2"
                  style={{
                    color: scoreColor(feedback.overallReadinessScore),
                    backgroundColor: `${scoreColor(feedback.overallReadinessScore)}1A`,
                  }}
                >
                  {feedback.admissionsVerdict}
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feedback.executiveSummary}
                </p>
              </div>
            </div>
          </div>

          {/* Top Priorities */}
          {feedback.topPrioritiesToFix.length > 0 && (
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
              <p className="font-semibold text-violet-800 text-sm mb-3">
                Top Priorities Before You Submit
              </p>
              <ol className="space-y-2">
                {feedback.topPrioritiesToFix.map((p, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-violet-700">
                    <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {p}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Dimension Breakdown */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Dimension Breakdown
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {(Object.keys(DIMENSION_LABELS) as (keyof DimensionBreakdown)[]).map((key) => (
                <DimensionCard
                  key={key}
                  label={DIMENSION_LABELS[key]}
                  dim={feedback.dimensionBreakdown[key]}
                />
              ))}
            </div>
          </div>

          {/* Line-item critiques */}
          {feedback.lineItemCritiques.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="font-semibold text-foreground mb-4">Line-by-Line Critique</p>
              <div className="space-y-4">
                {feedback.lineItemCritiques.map((c, i) => (
                  <div key={i} className="rounded-xl border border-border p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${ISSUE_TYPE_STYLES[c.issueType]}`}
                      >
                        {c.issueType}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground italic bg-muted/50 rounded-lg px-3 py-2">
                      &ldquo;{c.originalText}&rdquo;
                    </p>
                    <p className="text-xs text-foreground">
                      <span className="font-semibold">An admissions officer would think: </span>
                      {c.admissionsOfficerReaction}
                    </p>
                    <p className="text-xs text-muted-foreground">💡 {c.actionableFix}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
