'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, ContentCard } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type QuestionType = 'short_text' | 'long_text' | 'multiple_choice' | 'yes_no' | 'rating';

interface SurveyQuestion {
  id: string;
  type: QuestionType;
  text: string;
  required: boolean;
  options: string[];
}

interface SurveyDetail {
  id: number;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  targetRoles: string[];
  targetGrades: string[] | null;
  anonymous: boolean;
  status: string;
  createdAt: string;
}

interface ResponseRow {
  id: number;
  respondentId: string | null;
  respondentRole: string;
  answers: Record<string, string | number>;
  submittedAt: string;
}

interface ReceiptRow {
  respondentId: string;
  respondedAt: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function audienceSummary(survey: Pick<SurveyDetail, 'targetRoles' | 'targetGrades'>) {
  const roleLabels = survey.targetRoles.map((role) => `${role}s`).join(', ');
  if (!roleLabels) return 'No audience selected';
  const hasGrades = survey.targetRoles.includes('student') && survey.targetGrades && survey.targetGrades.length > 0;
  return hasGrades ? `${roleLabels} (grade ${survey.targetGrades!.join(', ')})` : roleLabels;
}

export default function CounselorSurveyResultsPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const surveyId = Number(params.id);

  const [survey, setSurvey] = useState<SurveyDetail | null>(null);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [eligibleCount, setEligibleCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.schoolId || !surveyId) return;

    const { data: surveyRow, error: surveyError } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', surveyId)
      .single();

    if (surveyError || !surveyRow) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    const mappedSurvey: SurveyDetail = {
      id: surveyRow.id,
      title: surveyRow.title,
      description: surveyRow.description,
      questions: Array.isArray(surveyRow.questions) ? (surveyRow.questions as unknown as SurveyQuestion[]) : [],
      targetRoles: surveyRow.target_roles || [],
      targetGrades: surveyRow.target_grades,
      anonymous: surveyRow.anonymous,
      status: surveyRow.status,
      createdAt: formatDate(surveyRow.created_at),
    };
    setSurvey(mappedSurvey);

    const [{ data: responseRows }, { data: receiptRows }, { data: profileRows }] = await Promise.all([
      supabase
        .from('survey_responses')
        .select('id,respondent_id,respondent_role,answers,submitted_at')
        .eq('survey_id', surveyId),
      supabase
        .from('survey_receipts')
        .select('respondent_id,responded_at')
        .eq('survey_id', surveyId),
      supabase
        .from('profiles')
        .select('id,role,grade_level')
        .eq('school_id', user.schoolId)
        .in('role', mappedSurvey.targetRoles as ('student' | 'counselor' | 'teacher' | 'parent')[]),
    ]);

    setResponses(
      (responseRows || []).map((row) => ({
        id: row.id,
        respondentId: row.respondent_id,
        respondentRole: row.respondent_role,
        answers: ((row.answers as unknown as Record<string, string | number>) || {}),
        submittedAt: formatDate(row.submitted_at),
      }))
    );
    setReceipts(
      (receiptRows || []).map((row) => ({ respondentId: row.respondent_id, respondedAt: formatDate(row.responded_at) }))
    );

    const eligible = (profileRows || []).filter((p) => {
      if (p.role === 'student' && mappedSurvey.targetGrades && mappedSurvey.targetGrades.length > 0) {
        return mappedSurvey.targetGrades.includes(p.grade_level || '');
      }
      return true;
    }).length;
    setEligibleCount(eligible);

    const respondentIds = Array.from(
      new Set([
        ...(receiptRows || []).map((r) => r.respondent_id),
        ...(responseRows || []).map((r) => r.respondent_id).filter((id): id is string => !!id),
      ])
    );
    if (respondentIds.length > 0) {
      const { data: nameRows } = await supabase
        .from('profiles')
        .select('id,first_name,last_name')
        .in('id', respondentIds);
      const nameMap: Record<string, string> = {};
      (nameRows || []).forEach((row) => {
        nameMap[row.id] = `${row.first_name} ${row.last_name}`;
      });
      setNames(nameMap);
    }

    setIsLoading(false);
  }, [user?.schoolId, surveyId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !survey) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">Survey not found.</p>
        <Link href="/counselor/surveys" className="text-primary font-medium hover:underline mt-2 inline-block">
          Back to Surveys
        </Link>
      </div>
    );
  }

  const completionPct = eligibleCount > 0 ? Math.round((receipts.length / eligibleCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/counselor/surveys" className="text-sm text-primary font-medium hover:underline">
          ← Back to Surveys
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">{survey.title}</h1>
            {survey.description && <p className="text-muted-foreground mt-1">{survey.description}</p>}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2 capitalize">
          {audienceSummary(survey)} · {survey.anonymous ? 'Anonymous responses' : 'Identified responses'} · Created {survey.createdAt}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{receipts.length}</p>
          <p className="text-sm text-muted-foreground">Responded</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{eligibleCount}</p>
          <p className="text-sm text-muted-foreground">Targeted</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary">{completionPct}%</p>
          <p className="text-sm text-muted-foreground">Completion</p>
        </Card>
      </div>

      {survey.questions.map((question, index) => {
        const answers = responses
          .map((r) => ({ respondentId: r.respondentId, value: r.answers[question.id] }))
          .filter((a) => a.value !== undefined && a.value !== '');

        return (
          <ContentCard key={question.id} title={`${index + 1}. ${question.text}`}>
            {answers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No answers yet.</p>
            ) : question.type === 'multiple_choice' || question.type === 'yes_no' || question.type === 'rating' ? (
              <div className="space-y-2">
                {(question.type === 'yes_no' ? ['yes', 'no'] : question.type === 'rating' ? ['1', '2', '3', '4', '5'] : question.options).map(
                  (option) => {
                    const count = answers.filter((a) => String(a.value) === option).length;
                    const pct = answers.length > 0 ? Math.round((count / answers.length) * 100) : 0;
                    return (
                      <div key={option}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-foreground capitalize">{option}</span>
                          <span className="text-muted-foreground">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {answers.map((a, i) => (
                  <div key={i} className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-foreground">{a.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {survey.anonymous || !a.respondentId ? 'Anonymous' : names[a.respondentId] || 'Unknown'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ContentCard>
        );
      })}

      <ContentCard title="Who has responded">
        {receipts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No one has responded yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {receipts.map((receipt) => (
              <div
                key={receipt.respondentId}
                className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded-lg"
              >
                <span className="text-foreground">{names[receipt.respondentId] || 'Unknown'}</span>
                <span className="text-muted-foreground text-xs">{receipt.respondedAt}</span>
              </div>
            ))}
          </div>
        )}
        {survey.anonymous && (
          <p className="text-xs text-muted-foreground mt-3">
            This survey is anonymous — this list only shows who participated, not what they answered.
          </p>
        )}
      </ContentCard>
    </div>
  );
}
