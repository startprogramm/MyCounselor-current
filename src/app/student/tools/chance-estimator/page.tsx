'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface ChanceAction {
  action: string;
  impact: 'High' | 'Medium' | 'Low';
}

interface AverageProfile {
  gpa: string;
  sat: string;
  act: string;
}

interface EstimatorResult {
  collegeName: string;
  chancePercent: number;
  tier: 'Safety' | 'Match' | 'Reach' | 'Stretch';
  acceptanceRate: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  actions: ChanceAction[];
  averageProfile: AverageProfile;
}

const TIER_CONFIG = {
  Safety:  { color: '#16A34A', bg: 'bg-green-500/10',  border: 'border-green-200 dark:border-green-800',  text: 'text-green-700 dark:text-green-300',  label: 'Safety School' },
  Match:   { color: '#2563EB', bg: 'bg-blue-500/10',   border: 'border-blue-200 dark:border-blue-800',    text: 'text-blue-700 dark:text-blue-300',    label: 'Match School' },
  Reach:   { color: '#F97316', bg: 'bg-orange-500/10', border: 'border-orange-200 dark:border-orange-800',text: 'text-orange-700 dark:text-orange-300', label: 'Reach School' },
  Stretch: { color: '#EF4444', bg: 'bg-red-500/10',    border: 'border-red-200 dark:border-red-800',      text: 'text-red-700 dark:text-red-300',      label: 'Stretch School' },
};

const IMPACT_CONFIG = {
  High:   { color: 'text-destructive', bg: 'bg-destructive/10' },
  Medium: { color: 'text-amber-600',   bg: 'bg-amber-500/10' },
  Low:    { color: 'text-muted-foreground', bg: 'bg-muted' },
};

function ChanceMeter({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-40 h-40 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
        <circle
          cx="40" cy="40" r="32" fill="none" strokeWidth="8"
          stroke={color}
          strokeDasharray={`${(percent / 100) * 201} 201`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-foreground">{percent}%</span>
        <span className="text-xs text-muted-foreground font-medium">chance</span>
      </div>
    </div>
  );
}

export default function ChanceEstimatorPage() {
  const { user } = useAuth();
  const [targetCollege, setTargetCollege] = useState('');
  const [studentProfile, setStudentProfile] = useState<Record<string, unknown>>({});
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [result, setResult] = useState<EstimatorResult | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<EstimatorResult[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/student-profile?studentId=${user.id}`)
      .then(r => r.json())
      .then(({ profile }) => {
        if (profile) setStudentProfile(profile);
        setProfileLoaded(true);
      })
      .catch(() => setProfileLoaded(true));
  }, [user?.id]);

  async function estimate() {
    if (!targetCollege.trim()) {
      setError('Please enter a college name.');
      return;
    }
    setError('');
    setIsEstimating(true);
    setResult(null);

    try {
      const res = await fetch('/api/ai-chance-estimator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetCollege: targetCollege.trim(), studentProfile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Estimation failed.');
      setResult(data.result);
      setHistory(prev => [data.result, ...prev.filter(h => h.collegeName !== data.result.collegeName)].slice(0, 5));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsEstimating(false);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/student/tools" className="text-muted-foreground hover:text-foreground transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Admissions Chance Estimator</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Know where you stand before you apply</p>
        </div>
        <div className="ml-auto hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          AI-Powered
        </div>
      </div>

      {/* Profile snapshot */}
      {profileLoaded && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your Profile Used for Estimation</p>
            <Link href="/student/dashboard" className="text-xs text-primary hover:underline">Edit Profile</Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {studentProfile.gpa_unweighted && (
              <div className="rounded-lg bg-muted px-3 py-2 text-center">
                <p className="text-xs text-muted-foreground">GPA (UW)</p>
                <p className="font-bold text-foreground">{String(studentProfile.gpa_unweighted)}</p>
              </div>
            )}
            {studentProfile.sat_total && (
              <div className="rounded-lg bg-muted px-3 py-2 text-center">
                <p className="text-xs text-muted-foreground">SAT</p>
                <p className="font-bold text-foreground">{String(studentProfile.sat_total)}</p>
              </div>
            )}
            {studentProfile.act_composite && (
              <div className="rounded-lg bg-muted px-3 py-2 text-center">
                <p className="text-xs text-muted-foreground">ACT</p>
                <p className="font-bold text-foreground">{String(studentProfile.act_composite)}</p>
              </div>
            )}
            {studentProfile.intended_major && (
              <div className="rounded-lg bg-muted px-3 py-2 text-center">
                <p className="text-xs text-muted-foreground">Major</p>
                <p className="font-bold text-foreground text-sm">{String(studentProfile.intended_major)}</p>
              </div>
            )}
            {!studentProfile.gpa_unweighted && !studentProfile.sat_total && !studentProfile.act_composite && (
              <p className="text-sm text-muted-foreground">
                No academic data found.{' '}
                <Link href="/student/dashboard" className="text-primary hover:underline">
                  Fill in your profile
                </Link>{' '}
                for accurate results.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            College Name
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={targetCollege}
              onChange={(e) => setTargetCollege(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') estimate(); }}
              placeholder="e.g. MIT, UCLA, Princeton, University of Michigan"
              className="flex-1 px-4 py-3 text-sm bg-background border border-border rounded-xl text-foreground
                placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/40
                focus:border-blue-500 transition-colors"
            />
            <button
              onClick={estimate}
              disabled={isEstimating || !targetCollege.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold
                hover:from-blue-600 hover:to-cyan-600 transition-all shadow-sm shadow-blue-500/25
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              {isEstimating ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              {isEstimating ? 'Estimating…' : 'Estimate'}
            </button>
          </div>
        </div>

        {/* History chips */}
        {history.length > 0 && !result && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Recent searches:</p>
            <div className="flex flex-wrap gap-2">
              {history.map((h, i) => {
                const tc = TIER_CONFIG[h.tier];
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setTargetCollege(h.collegeName); setResult(h); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors"
                    style={{ borderColor: tc.color, color: tc.color }}
                  >
                    {h.collegeName} · {h.chancePercent}%
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (() => {
        const tc = TIER_CONFIG[result.tier];
        return (
          <div className="space-y-5 animate-[fadeIn_0.4s_ease]">
            {/* Main result card */}
            <div className={`rounded-2xl border ${tc.border} bg-card overflow-hidden`}>
              <div className="h-1.5" style={{ background: `linear-gradient(to right, ${tc.color}, ${tc.color}88)` }} />
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ChanceMeter percent={result.chancePercent} color={tc.color} />
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      Admission Estimate for
                    </p>
                    <h2 className="text-2xl font-bold text-foreground">{result.collegeName}</h2>
                    <div className="flex items-center gap-3 mt-2 justify-center sm:justify-start">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${tc.bg} ${tc.text}`}>
                        {tc.label}
                      </span>
                      {result.acceptanceRate && result.acceptanceRate !== 'N/A' && (
                        <span className="text-xs text-muted-foreground">
                          Acceptance rate: <strong>{result.acceptanceRate}</strong>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{result.summary}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Average profile comparison */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">Typical Admitted Student Profile</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Average GPA', value: result.averageProfile.gpa },
                  { label: 'Average SAT', value: result.averageProfile.sat },
                  { label: 'Average ACT', value: result.averageProfile.act },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-muted p-3 text-center">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-bold text-foreground mt-1 text-sm">{item.value || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-5">
                <p className="font-semibold text-green-800 dark:text-green-300 text-sm mb-3">Your Advantages</p>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-green-700 dark:text-green-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-5">
                <p className="font-semibold text-red-800 dark:text-red-300 text-sm mb-3">Areas of Concern</p>
                <ul className="space-y-2">
                  {result.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action plan */}
            {result.actions.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Your Action Plan to Improve
                </p>
                <div className="space-y-3">
                  {result.actions.map((action, i) => {
                    const ic = IMPACT_CONFIG[action.impact];
                    return (
                      <div key={i} className="flex items-start gap-3 rounded-xl border border-border p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap flex-shrink-0 mt-0.5 ${ic.bg} ${ic.color}`}>
                          {action.impact}
                        </span>
                        <p className="text-sm text-foreground">{action.action}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Try another */}
            <button
              onClick={() => { setResult(null); setTargetCollege(''); }}
              className="w-full py-3 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Estimate Another College
            </button>
          </div>
        );
      })()}
    </div>
  );
}
