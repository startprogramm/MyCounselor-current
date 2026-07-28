'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface ProfileStatus {
  completion_pct: number;
  loaded: boolean;
}

export default function StudentToolsPage() {
  const { user } = useAuth();
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>({ completion_pct: 0, loaded: false });

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/student-profile?studentId=${user.id}`)
      .then(r => r.json())
      .then(({ profile }) => {
        setProfileStatus({ completion_pct: profile?.completion_pct ?? 0, loaded: true });
      })
      .catch(() => setProfileStatus(s => ({ ...s, loaded: true })));
  }, [user?.id]);

  const isUnlocked = profileStatus.completion_pct >= 50;
  const needed = 50 - profileStatus.completion_pct;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">AI Tools</h1>
        <p className="text-muted-foreground mt-1">
          Powered by AI — personalized to your academic profile.
        </p>
      </div>

      {/* Profile gate banner */}
      {profileStatus.loaded && !isUnlocked && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm">AI tools are locked</p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Complete {needed}% more of your Academic Profile on your dashboard to unlock these tools.
              The more info you provide, the more accurate and personalized the AI analysis will be.
            </p>
            <Link
              href="/student/dashboard"
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-amber-800 dark:text-amber-200 hover:underline"
            >
              Go to Dashboard → Update Profile
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Profile completion mini bar */}
      {profileStatus.loaded && (
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Academic Profile Completion</span>
              <span className="text-xs font-bold text-foreground">{profileStatus.completion_pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${profileStatus.completion_pct}%`,
                  backgroundColor: isUnlocked ? '#16A34A' : '#F97316',
                }}
              />
            </div>
          </div>
          <Link
            href="/student/dashboard"
            className="text-xs font-medium text-primary hover:underline whitespace-nowrap"
          >
            Edit Profile
          </Link>
        </div>
      )}

      {/* Tools Grid */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* AI Essay Coach */}
        <div className={`rounded-2xl border bg-card overflow-hidden transition-all ${
          isUnlocked ? 'border-border hover:shadow-lg hover:shadow-primary/5' : 'border-border opacity-60'
        }`}>
          <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-600" />
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-600/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              {isUnlocked ? (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/10 text-green-600">Unlocked</span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">Locked</span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg">AI Essay Coach</h3>
              <p className="text-muted-foreground text-sm mt-1.5">
                Get detailed feedback on your college application essays. AI analyzes your voice, structure, impact, and suggests concrete rewrites.
              </p>
            </div>
            <ul className="space-y-1.5">
              {['Overall score + breakdown', 'Specific strengths highlighted', 'Rewrite suggestions for weak sentences'].map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {isUnlocked ? (
              <Link
                href="/student/tools/essay-coach"
                className="block w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold text-center hover:from-violet-600 hover:to-purple-700 transition-all shadow-sm shadow-violet-500/25"
              >
                Open Essay Coach →
              </Link>
            ) : (
              <button
                disabled
                className="block w-full py-3 rounded-xl bg-muted text-muted-foreground text-sm font-semibold text-center cursor-not-allowed"
              >
                Complete profile to unlock
              </button>
            )}
          </div>
        </div>

        {/* AI Chance Estimator */}
        <div className={`rounded-2xl border bg-card overflow-hidden transition-all ${
          isUnlocked ? 'border-border hover:shadow-lg hover:shadow-primary/5' : 'border-border opacity-60'
        }`}>
          <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              {isUnlocked ? (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/10 text-green-600">Unlocked</span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">Locked</span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg">Admissions Chance Estimator</h3>
              <p className="text-muted-foreground text-sm mt-1.5">
                Enter any college and get an honest AI estimate of your admission chances based on your real academic profile.
              </p>
            </div>
            <ul className="space-y-1.5">
              {['Safety / Match / Reach / Stretch tier', 'Percentage estimate with reasoning', 'Concrete actions to improve chances'].map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {isUnlocked ? (
              <Link
                href="/student/tools/chance-estimator"
                className="block w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold text-center hover:from-blue-600 hover:to-cyan-600 transition-all shadow-sm shadow-blue-500/25"
              >
                Estimate My Chances →
              </Link>
            ) : (
              <button
                disabled
                className="block w-full py-3 rounded-xl bg-muted text-muted-foreground text-sm font-semibold text-center cursor-not-allowed"
              >
                Complete profile to unlock
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Counselor reminder */}
      <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">AI Counselor Chat is also available</p>
          <p className="text-xs text-muted-foreground mt-0.5">Ask any college, career, or academic question — always available</p>
        </div>
        <Link
          href="/tools/ai-counselor"
          className="text-sm font-medium text-primary hover:underline whitespace-nowrap"
        >
          Open Chat →
        </Link>
      </div>
    </div>
  );
}
