'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface ScoreBreakdown {
  voice: number;
  structure: number;
  impact: number;
  grammar: number;
}

interface RewriteSuggestion {
  original: string;
  suggested: string;
  reason: string;
}

interface EssayFeedback {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  rewriteSuggestions: RewriteSuggestion[];
  scoreBreakdown: ScoreBreakdown;
}

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const pct = (score / 10) * 100;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

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
          {score.toFixed(1)}
        </span>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

export default function EssayCoachPage() {
  const { user } = useAuth();
  const [essayPrompt, setEssayPrompt] = useState('');
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

  const scoreColor = (s: number) =>
    s >= 8 ? '#16A34A' : s >= 6 ? '#2563EB' : s >= 4 ? '#F97316' : '#EF4444';

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
            Paste your essay and get expert AI feedback in seconds
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

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Your Essay
            </label>
            <span
              className={`text-xs font-medium ${wordCount > 650 ? 'text-destructive' : 'text-muted-foreground'}`}
            >
              {wordCount} words{' '}
              {wordCount > 0 &&
                `(${wordCount > 650 ? 'over' : 650 - wordCount + ' under'} 650 limit)`}
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
              <div className="text-center">
                <div
                  className="text-5xl font-black"
                  style={{ color: scoreColor(feedback.overallScore) }}
                >
                  {feedback.overallScore.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground font-medium mt-1">out of 10</div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground mb-2">Overall Assessment</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{feedback.summary}</p>
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-border">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                Score Breakdown
              </p>
              <div className="flex justify-around">
                {Object.entries(feedback.scoreBreakdown).map(([key, val]) => (
                  <ScoreRing
                    key={key}
                    score={val as number}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    color={scoreColor(val as number)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 p-5">
              <p className="font-semibold text-green-800 dark:text-green-300 text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center">
                  ✓
                </span>
                What's Working
              </p>
              <ul className="space-y-2">
                {feedback.strengths.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-green-700 dark:text-green-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-5">
              <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  ↑
                </span>
                Areas to Improve
              </p>
              <ul className="space-y-2">
                {feedback.improvements.map((imp, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Rewrite Suggestions */}
          {feedback.rewriteSuggestions.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-violet-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Suggested Rewrites
              </p>
              <div className="space-y-4">
                {feedback.rewriteSuggestions.map((rw, i) => (
                  <div key={i} className="rounded-xl border border-border p-4 space-y-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Original
                      </p>
                      <p className="text-sm text-muted-foreground italic bg-muted/50 rounded-lg px-3 py-2">
                        &ldquo;{rw.original}&rdquo;
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-green-600 mb-1.5">
                        Suggested
                      </p>
                      <p className="text-sm text-foreground bg-green-500/5 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
                        &ldquo;{rw.suggested}&rdquo;
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">💡 {rw.reason}</p>
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
