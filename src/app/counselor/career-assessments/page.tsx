'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, ContentCard } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Json } from '@/lib/database.types';
import ResultBreakdown from '@/components/career-assessment/ResultBreakdown';
import { ASSESSMENT_META, type AssessmentType } from '@/lib/career-assessment';

const GRADE_TABS: { grade: string; type: AssessmentType }[] = [
  { grade: '9', type: 'ddo' },
  { grade: '10', type: 'riasec' },
  { grade: '11', type: 'cmi' },
];

interface StudentRow {
  id: string;
  firstName: string;
  lastName: string;
}

interface ResultRow {
  headline: string;
  scores: Json;
  completedAt: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CounselorCareerAssessmentsPage() {
  const { user } = useAuth();
  const [activeGrade, setActiveGrade] = useState('9');
  const [studentsByGrade, setStudentsByGrade] = useState<Record<string, StudentRow[]>>({ '9': [], '10': [], '11': [] });
  const [resultsByType, setResultsByType] = useState<Record<AssessmentType, Record<string, ResultRow>>>({
    ddo: {},
    riasec: {},
    cmi: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.schoolId) return;

    const [{ data: studentRows }, { data: resultRows }] = await Promise.all([
      supabase
        .from('profiles')
        .select('id,first_name,last_name,grade_level')
        .eq('school_id', user.schoolId)
        .eq('role', 'student')
        .eq('approved', true),
      supabase
        .from('career_assessment_results')
        .select('student_id,assessment_type,headline,scores,completed_at')
        .eq('school_id', user.schoolId),
    ]);

    const byGrade: Record<string, StudentRow[]> = { '9': [], '10': [], '11': [] };
    (studentRows || []).forEach((row) => {
      if (row.grade_level && byGrade[row.grade_level]) {
        byGrade[row.grade_level].push({ id: row.id, firstName: row.first_name, lastName: row.last_name });
      }
    });
    Object.keys(byGrade).forEach((grade) => {
      byGrade[grade].sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
    });
    setStudentsByGrade(byGrade);

    const byType: Record<AssessmentType, Record<string, ResultRow>> = { ddo: {}, riasec: {}, cmi: {} };
    (resultRows || []).forEach((row) => {
      const type = row.assessment_type as AssessmentType;
      if (byType[type]) {
        byType[type][row.student_id] = { headline: row.headline, scores: row.scores, completedAt: row.completed_at };
      }
    });
    setResultsByType(byType);
    setIsLoading(false);
  }, [user?.schoolId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const activeTab = GRADE_TABS.find((t) => t.grade === activeGrade) || GRADE_TABS[0];
  const meta = ASSESSMENT_META[activeTab.type];
  const students = studentsByGrade[activeGrade] || [];
  const results = resultsByType[activeTab.type] || {};
  const completedCount = students.filter((s) => results[s.id]).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Career Assessments</h1>
        <p className="text-muted-foreground mt-1">
          Grade-specific vocational instruments — Klimov DDO (9), Holland RIASEC (10), Crites CMI (11).
        </p>
      </div>

      <div className="flex gap-2">
        {GRADE_TABS.map((tab) => (
          <button
            key={tab.grade}
            onClick={() => { setActiveGrade(tab.grade); setExpandedStudentId(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeGrade === tab.grade ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Grade {tab.grade}
          </button>
        ))}
      </div>

      <Card className="p-5">
        <p className="font-semibold text-foreground">{meta.title}</p>
        <p className="text-sm text-muted-foreground mt-1">{meta.subtitle}</p>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{students.length}</p>
            <p className="text-xs text-muted-foreground">Students in grade</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{completedCount}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {students.length > 0 ? Math.round((completedCount / students.length) * 100) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Completion rate</p>
          </div>
        </div>
      </Card>

      <ContentCard title="Students" description="Click a completed row to see the full category breakdown.">
        {students.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No approved students in grade {activeGrade} yet.</p>
        ) : (
          <div className="space-y-2">
            {students.map((student) => {
              const result = results[student.id];
              const isExpanded = expandedStudentId === student.id;
              return (
                <div key={student.id} className="rounded-lg border border-border overflow-hidden">
                  <button
                    type="button"
                    disabled={!result}
                    onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                    className={`w-full flex items-center justify-between gap-3 p-3.5 text-left transition-colors ${
                      result ? 'hover:bg-muted/40 cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        {student.firstName} {student.lastName}
                      </p>
                      {result ? (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {result.headline} · {formatDate(result.completedAt)}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-0.5">Not completed yet</p>
                      )}
                    </div>
                    {result && (
                      <svg
                        className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                  {isExpanded && result && (
                    <div className="p-4 border-t border-border bg-muted/20">
                      <ResultBreakdown assessmentType={activeTab.type} scores={result.scores} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ContentCard>
    </div>
  );
}
