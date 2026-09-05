'use client';

import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input, { Textarea } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Json } from '@/lib/database.types';
import { makeUserCacheKey, readCachedData, writeCachedData } from '@/lib/client-cache';

type QuestionType = 'short_text' | 'long_text' | 'multiple_choice' | 'yes_no' | 'rating';
type Role = 'student' | 'parent' | 'teacher';

interface SurveyQuestion {
  id: string;
  type: QuestionType;
  text: string;
  required: boolean;
  options: string[];
}

interface Survey {
  id: number;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  anonymous: boolean;
  createdAt: string;
}

interface SurveysCachePayload {
  surveys: Survey[];
  respondedIds: number[];
}

const CACHE_TTL_MS = 2 * 60 * 1000;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SurveyRespondentPage({ role }: { role: Role }) {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [respondedIds, setRespondedIds] = useState<Set<number>>(new Set());
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [hasWarmCache, setHasWarmCache] = useState(false);
  const [isCacheHydrated, setIsCacheHydrated] = useState(false);
  const [hasLoadedFromServer, setHasLoadedFromServer] = useState(false);

  const cacheKey = useMemo(
    () => (user?.id ? makeUserCacheKey(`${role}-surveys`, user.id, user.schoolId) : null),
    [user?.id, user?.schoolId, role]
  );

  useLayoutEffect(() => {
    setIsCacheHydrated(false);
    setHasLoadedFromServer(false);

    if (!cacheKey) {
      setSurveys([]);
      setRespondedIds(new Set());
      setHasWarmCache(false);
      setIsCacheHydrated(true);
      return;
    }

    const cached = readCachedData<SurveysCachePayload>(cacheKey, CACHE_TTL_MS);
    if (cached.found && cached.data) {
      setSurveys(cached.data.surveys || []);
      setRespondedIds(new Set(cached.data.respondedIds || []));
      setHasWarmCache(true);
      setIsCacheHydrated(true);
      return;
    }

    setHasWarmCache(false);
    setIsCacheHydrated(true);
  }, [cacheKey]);

  useEffect(() => {
    if (!cacheKey || !isCacheHydrated) return;
    if (!hasWarmCache && !hasLoadedFromServer) return;

    writeCachedData<SurveysCachePayload>(cacheKey, {
      surveys,
      respondedIds: Array.from(respondedIds),
    });
  }, [cacheKey, isCacheHydrated, hasWarmCache, hasLoadedFromServer, surveys, respondedIds]);

  const loadSurveys = useCallback(async () => {
    if (!user?.schoolId || !user?.id) return;

    const [{ data: surveyRows }, { data: receiptRows }] = await Promise.all([
      supabase
        .from('surveys')
        .select('*')
        .eq('school_id', user.schoolId)
        .eq('status', 'published')
        .order('created_at', { ascending: false }),
      supabase.from('survey_receipts').select('survey_id').eq('respondent_id', user.id),
    ]);

    if (surveyRows) {
      setSurveys(
        surveyRows.map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          questions: Array.isArray(row.questions) ? (row.questions as unknown as SurveyQuestion[]) : [],
          anonymous: row.anonymous,
          createdAt: formatDate(row.created_at),
        }))
      );
    }
    setRespondedIds(new Set((receiptRows || []).map((row) => row.survey_id)));
    setHasLoadedFromServer(true);
  }, [user?.schoolId, user?.id]);

  useEffect(() => {
    if (!isCacheHydrated) return;
    void loadSurveys();
  }, [isCacheHydrated, loadSurveys]);

  const openSurvey = (survey: Survey) => {
    setExpandedId(survey.id);
    setAnswers({});
    setFormErrors({});
  };

  const handleSubmit = async (survey: Survey) => {
    if (!user) return;

    const errors: Record<string, string> = {};
    survey.questions.forEach((question) => {
      const value = answers[question.id];
      if (question.required && (value === undefined || value === '')) {
        errors[question.id] = 'This question is required';
      }
    });
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmittingId(survey.id);

    const relevantAnswers: Record<string, string | number> = {};
    survey.questions.forEach((question) => {
      if (answers[question.id] !== undefined && answers[question.id] !== '') {
        relevantAnswers[question.id] = answers[question.id];
      }
    });

    const { error: responseError } = await supabase.from('survey_responses').insert({
      survey_id: survey.id,
      respondent_id: survey.anonymous ? null : user.id,
      respondent_role: role,
      answers: relevantAnswers as unknown as Json,
    });

    if (responseError) {
      setSubmittingId(null);
      return;
    }

    await supabase.from('survey_receipts').insert({ survey_id: survey.id, respondent_id: user.id });

    setRespondedIds((prev) => new Set(prev).add(survey.id));
    setExpandedId(null);
    setAnswers({});
    setSubmittingId(null);
  };

  const pendingSurveys = surveys.filter((s) => !respondedIds.has(s.id));
  const completedSurveys = surveys.filter((s) => respondedIds.has(s.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Surveys</h1>
        <p className="text-muted-foreground mt-1">Questionnaires from your school&apos;s counselor</p>
      </div>

      {pendingSurveys.length === 0 && completedSurveys.length === 0 ? (
        <Card className="p-8 text-center">
          <svg className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="font-medium text-foreground">No surveys right now</p>
          <p className="text-sm text-muted-foreground mt-1">Surveys from your counselor will appear here.</p>
        </Card>
      ) : (
        <>
          {pendingSurveys.length > 0 && (
            <div className="space-y-4">
              {pendingSurveys.map((survey) => (
                <Card key={survey.id} className="p-0 overflow-hidden" hover>
                  <button onClick={() => openSurvey(survey)} className="w-full text-left p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{survey.title}</p>
                        {survey.description && (
                          <p className="text-sm text-muted-foreground mt-1">{survey.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {survey.questions.length} question{survey.questions.length === 1 ? '' : 's'}
                          {survey.anonymous ? ' · Anonymous' : ''}
                        </p>
                      </div>
                    </div>
                  </button>

                  {expandedId === survey.id && (
                    <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                      {survey.questions.map((question, index) => (
                        <div key={question.id}>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            {index + 1}. {question.text}
                            {question.required && <span className="text-destructive"> *</span>}
                          </label>

                          {question.type === 'short_text' && (
                            <Input
                              value={(answers[question.id] as string) || ''}
                              onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
                              error={formErrors[question.id]}
                            />
                          )}

                          {question.type === 'long_text' && (
                            <Textarea
                              value={(answers[question.id] as string) || ''}
                              onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
                              error={formErrors[question.id]}
                            />
                          )}

                          {question.type === 'multiple_choice' && (
                            <div className="space-y-2">
                              {question.options.map((option) => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`survey-${survey.id}-q-${question.id}`}
                                    checked={answers[question.id] === option}
                                    onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: option }))}
                                    className="w-4 h-4 text-primary focus:ring-primary"
                                  />
                                  <span className="text-sm text-foreground">{option}</span>
                                </label>
                              ))}
                              {formErrors[question.id] && (
                                <p className="text-sm text-destructive">{formErrors[question.id]}</p>
                              )}
                            </div>
                          )}

                          {question.type === 'yes_no' && (
                            <div className="flex gap-2">
                              {['yes', 'no'].map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option }))}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium border capitalize transition-colors ${
                                    answers[question.id] === option
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/50'
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                              {formErrors[question.id] && (
                                <p className="text-sm text-destructive w-full">{formErrors[question.id]}</p>
                              )}
                            </div>
                          )}

                          {question.type === 'rating' && (
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
                                  className={`w-10 h-10 rounded-lg text-sm font-semibold border transition-colors ${
                                    answers[question.id] === value
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/50'
                                  }`}
                                >
                                  {value}
                                </button>
                              ))}
                              {formErrors[question.id] && (
                                <p className="text-sm text-destructive w-full">{formErrors[question.id]}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" size="sm" onClick={() => setExpandedId(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" isLoading={submittingId === survey.id} onClick={() => handleSubmit(survey)}>
                          Submit
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {completedSurveys.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-2">Completed</h2>
              <div className="space-y-2">
                {completedSurveys.map((survey) => (
                  <Card key={survey.id} className="p-4 flex items-center justify-between">
                    <p className="text-sm text-foreground">{survey.title}</p>
                    <span className="text-xs text-success font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </span>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
