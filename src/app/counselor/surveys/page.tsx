'use client';

import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Card, ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input, { Textarea, Select } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Json } from '@/lib/database.types';
import { makeUserCacheKey, readCachedData, writeCachedData } from '@/lib/client-cache';

type QuestionType = 'short_text' | 'long_text' | 'multiple_choice' | 'yes_no' | 'rating';

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
  targetRoles: string[];
  targetGrades: string[] | null;
  anonymous: boolean;
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
  responseCount: number;
}

interface CounselorSurveysCachePayload {
  surveys: Survey[];
}

const SURVEYS_CACHE_TTL_MS = 2 * 60 * 1000;
const ROLE_OPTIONS = ['student', 'parent', 'teacher'] as const;
const GRADE_OPTIONS = ['9', '10', '11'];
const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  short_text: 'Short Answer',
  long_text: 'Long Answer',
  multiple_choice: 'Multiple Choice',
  yes_no: 'Yes / No',
  rating: 'Rating (1-5)',
};

function newQuestion(): SurveyQuestion {
  return {
    id: typeof crypto !== 'undefined' ? crypto.randomUUID() : String(Date.now()),
    type: 'short_text',
    text: '',
    required: true,
    options: ['', ''],
  };
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function mapSurvey(row: {
  id: number;
  title: string;
  description: string;
  questions: unknown;
  target_roles: string[];
  target_grades: string[] | null;
  anonymous: boolean;
  status: string;
  created_at: string;
}, responseCount: number): Survey {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    questions: Array.isArray(row.questions) ? (row.questions as SurveyQuestion[]) : [],
    targetRoles: row.target_roles || [],
    targetGrades: row.target_grades,
    anonymous: row.anonymous,
    status: row.status as Survey['status'],
    createdAt: formatDate(row.created_at),
    responseCount,
  };
}

function audienceSummary(survey: Pick<Survey, 'targetRoles' | 'targetGrades'>) {
  const roleLabels = survey.targetRoles.map((role) => `${role}s`).join(', ');
  if (!roleLabels) return 'No audience selected';
  const hasGrades = survey.targetRoles.includes('student') && survey.targetGrades && survey.targetGrades.length > 0;
  if (hasGrades) {
    return `${roleLabels} (grade ${survey.targetGrades!.join(', ')})`;
  }
  return roleLabels;
}

export default function CounselorSurveysPage() {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [showNewSurvey, setShowNewSurvey] = useState(false);
  const [filter, setFilter] = useState('all');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [hasWarmCache, setHasWarmCache] = useState(false);
  const [isCacheHydrated, setIsCacheHydrated] = useState(false);
  const [hasLoadedFromServer, setHasLoadedFromServer] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAnonymous, setNewAnonymous] = useState(false);
  const [newTargetRoles, setNewTargetRoles] = useState<string[]>([]);
  const [newTargetGrades, setNewTargetGrades] = useState<string[]>([]);
  const [newQuestions, setNewQuestions] = useState<SurveyQuestion[]>([newQuestion()]);

  const cacheKey = useMemo(
    () => (user?.id ? makeUserCacheKey('counselor-surveys', user.id, user.schoolId) : null),
    [user?.id, user?.schoolId]
  );

  useLayoutEffect(() => {
    setIsCacheHydrated(false);
    setHasLoadedFromServer(false);

    if (!cacheKey) {
      setSurveys([]);
      setHasWarmCache(false);
      setIsCacheHydrated(true);
      return;
    }

    const cached = readCachedData<CounselorSurveysCachePayload>(cacheKey, SURVEYS_CACHE_TTL_MS);
    if (cached.found && cached.data) {
      setSurveys(cached.data.surveys || []);
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

    writeCachedData<CounselorSurveysCachePayload>(cacheKey, { surveys });
  }, [cacheKey, isCacheHydrated, hasWarmCache, hasLoadedFromServer, surveys]);

  const loadSurveys = useCallback(async () => {
    if (!user?.schoolId) return;

    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('school_id', user.schoolId)
      .order('created_at', { ascending: false });

    if (error || !data) return;

    const surveyIds = data.map((row) => row.id);
    const responseCounts = new Map<number, number>();
    if (surveyIds.length > 0) {
      const { data: responseRows } = await supabase
        .from('survey_responses')
        .select('survey_id')
        .in('survey_id', surveyIds);
      (responseRows || []).forEach((row) => {
        responseCounts.set(row.survey_id, (responseCounts.get(row.survey_id) || 0) + 1);
      });
    }

    setSurveys(data.map((row) => mapSurvey(row, responseCounts.get(row.id) || 0)));
    setHasLoadedFromServer(true);
  }, [user?.schoolId]);

  useEffect(() => {
    if (!isCacheHydrated) return;
    void loadSurveys();
  }, [isCacheHydrated, loadSurveys]);

  const resetForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewAnonymous(false);
    setNewTargetRoles([]);
    setNewTargetGrades([]);
    setNewQuestions([newQuestion()]);
    setFormErrors({});
    setShowNewSurvey(false);
  };

  const toggleTargetRole = (role: string) => {
    setNewTargetRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
    setFormErrors((prev) => ({ ...prev, targetRoles: '' }));
  };

  const toggleTargetGrade = (grade: string) => {
    setNewTargetGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  const updateQuestion = (id: string, patch: Partial<SurveyQuestion>) => {
    setNewQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const updateOption = (questionId: string, index: number, value: string) => {
    setNewQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.map((opt, i) => (i === index ? value : opt)) }
          : q
      )
    );
  };

  const addOption = (questionId: string) => {
    setNewQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, options: [...q.options, ''] } : q))
    );
  };

  const removeOption = (questionId: string, index: number) => {
    setNewQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, options: q.options.filter((_, i) => i !== index) } : q
      )
    );
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!newTitle.trim()) errors.title = 'Title is required';
    if (newTargetRoles.length === 0) errors.targetRoles = 'Pick at least one audience';
    if (newQuestions.length === 0 || newQuestions.every((q) => !q.text.trim())) {
      errors.questions = 'Add at least one question';
    }
    const badMultipleChoice = newQuestions.some(
      (q) => q.type === 'multiple_choice' && q.text.trim() && q.options.filter((o) => o.trim()).length < 2
    );
    if (badMultipleChoice) {
      errors.questions = 'Multiple choice questions need at least 2 options';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (status: 'published' | 'draft') => {
    if (!validateForm() || !user) return;

    const cleanedQuestions = newQuestions
      .filter((q) => q.text.trim())
      .map((q) => ({
        ...q,
        text: q.text.trim(),
        options: q.type === 'multiple_choice' ? q.options.map((o) => o.trim()).filter(Boolean) : [],
      }));

    const { data, error } = await supabase
      .from('surveys')
      .insert({
        counselor_id: user.id,
        school_id: user.schoolId,
        title: newTitle.trim(),
        description: newDescription.trim(),
        questions: cleanedQuestions as unknown as Json,
        target_roles: newTargetRoles,
        target_grades: newTargetRoles.includes('student') && newTargetGrades.length > 0 ? newTargetGrades : null,
        anonymous: newAnonymous,
        status,
      })
      .select('*')
      .single();

    if (error || !data) return;

    setSurveys((prev) => [mapSurvey(data, 0), ...prev]);
    resetForm();
    setSuccessMessage(status === 'published' ? 'Survey published!' : 'Draft saved!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handlePublish = async (id: number) => {
    const { error } = await supabase.from('surveys').update({ status: 'published' }).eq('id', id);
    if (error) return;
    setSurveys((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'published' } : s)));
  };

  const handleClose = async (id: number) => {
    const { error } = await supabase.from('surveys').update({ status: 'closed' }).eq('id', id);
    if (error) return;
    setSurveys((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'closed' } : s)));
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from('surveys').delete().eq('id', id);
    if (error) return;
    setSurveys((prev) => prev.filter((s) => s.id !== id));
  };

  const filteredSurveys = filter === 'all' ? surveys : surveys.filter((s) => s.status === filter);

  const statusStyle = (status: Survey['status']) => {
    switch (status) {
      case 'published':
        return 'bg-success/10 text-success';
      case 'closed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-warning/10 text-warning';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Surveys</h1>
          <p className="text-muted-foreground mt-1">
            Create admissions-related surveys and questionnaires for students, parents, or teachers
          </p>
        </div>
        <Button onClick={() => setShowNewSurvey(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Survey
        </Button>
      </div>

      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-lg">
          <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm text-success font-medium">{successMessage}</p>
        </div>
      )}

      {showNewSurvey && (
        <ContentCard title="Create New Survey">
          <div className="space-y-5">
            <Input
              label="Survey Title"
              placeholder="e.g. Junior year college planning check-in"
              value={newTitle}
              onChange={(e) => { setNewTitle(e.target.value); setFormErrors((prev) => ({ ...prev, title: '' })); }}
              error={formErrors.title}
            />
            <Textarea
              label="Description (optional)"
              placeholder="What is this survey for, and why does it matter for admissions planning?"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Send to</label>
              <div className="flex flex-wrap gap-2">
                {ROLE_OPTIONS.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleTargetRole(role)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors capitalize ${
                      newTargetRoles.includes(role)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/50'
                    }`}
                  >
                    {role}s
                  </button>
                ))}
              </div>
              {formErrors.targetRoles && (
                <p className="text-sm text-destructive mt-1">{formErrors.targetRoles}</p>
              )}
            </div>

            {newTargetRoles.includes('student') && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Limit to grade(s) <span className="text-muted-foreground font-normal">(students only — leave blank for all grades)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {GRADE_OPTIONS.map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => toggleTargetGrade(grade)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        newTargetGrades.includes(grade)
                          ? 'bg-secondary text-secondary-foreground border-secondary'
                          : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/50'
                      }`}
                    >
                      Grade {grade}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newAnonymous}
                onChange={(e) => setNewAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground">
                Collect responses anonymously
                <span className="text-muted-foreground font-normal"> (you'll still see who has responded, not what they answered)</span>
              </span>
            </label>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-foreground">Questions</label>
                {formErrors.questions && (
                  <p className="text-sm text-destructive">{formErrors.questions}</p>
                )}
              </div>

              {newQuestions.map((question, index) => (
                <div key={question.id} className="p-4 border border-border rounded-lg space-y-3 bg-muted/20">
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-semibold text-muted-foreground mt-2.5">{index + 1}.</span>
                    <div className="flex-1 space-y-3">
                      <Input
                        placeholder="Question text"
                        value={question.text}
                        onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                      />
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Select
                          value={question.type}
                          onChange={(e) =>
                            updateQuestion(question.id, { type: e.target.value as QuestionType })
                          }
                          options={Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => ({
                            value,
                            label,
                          }))}
                        />
                        <label className="flex items-center gap-2 text-sm text-foreground">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                          />
                          Required
                        </label>
                      </div>

                      {question.type === 'multiple_choice' && (
                        <div className="space-y-2 pl-2 border-l-2 border-border">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <Input
                                placeholder={`Option ${optIndex + 1}`}
                                value={option}
                                onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                              />
                              {question.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(question.id, optIndex)}
                                  className="p-2 text-muted-foreground hover:text-destructive"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addOption(question.id)}
                            className="text-sm text-primary font-medium hover:underline"
                          >
                            + Add option
                          </button>
                        </div>
                      )}
                    </div>
                    {newQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setNewQuestions((prev) => prev.filter((q) => q.id !== question.id))}
                        className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNewQuestions((prev) => [...prev, newQuestion()])}
              >
                + Add Question
              </Button>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" onClick={resetForm}>
                Cancel
              </Button>
              <Button variant="outline" type="button" onClick={() => handleSubmit('draft')}>
                Save as Draft
              </Button>
              <Button type="button" onClick={() => handleSubmit('published')}>
                Publish
              </Button>
            </div>
          </div>
        </ContentCard>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{surveys.length}</p>
          <p className="text-sm text-muted-foreground">Total Surveys</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-success">{surveys.filter((s) => s.status === 'published').length}</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{surveys.reduce((sum, s) => sum + s.responseCount, 0)}</p>
          <p className="text-sm text-muted-foreground">Total Responses</p>
        </Card>
      </div>

      <div className="flex gap-2">
        {['all', 'published', 'draft', 'closed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {filteredSurveys.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSurveys.map((survey) => (
            <Card key={survey.id} className="p-5 flex flex-col h-full" hover>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${statusStyle(survey.status)}`}>
                    {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                  </span>
                  <h3 className="font-semibold text-foreground mt-2 leading-snug">{survey.title}</h3>
                </div>
                <button
                  onClick={() => handleDelete(survey.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {survey.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 flex-1">{survey.description}</p>
              )}

              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p className="capitalize">{audienceSummary(survey)}</p>
                <p>{survey.questions.length} question{survey.questions.length === 1 ? '' : 's'} · {survey.anonymous ? 'Anonymous' : 'Identified'}</p>
                <p>{survey.responseCount} response{survey.responseCount === 1 ? '' : 's'} · {survey.createdAt}</p>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/70">
                <Link href={`/counselor/surveys/${survey.id}`} className="flex-1">
                  <Button variant="outline" size="sm" fullWidth>
                    View Results
                  </Button>
                </Link>
                {survey.status === 'draft' && (
                  <Button size="sm" onClick={() => handlePublish(survey.id)}>
                    Publish
                  </Button>
                )}
                {survey.status === 'published' && (
                  <Button variant="outline" size="sm" onClick={() => handleClose(survey.id)}>
                    Close
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <svg className="w-12 h-12 mx-auto text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-muted-foreground">No surveys yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create a survey to hear from students, parents, or teachers</p>
          <Button className="mt-4" onClick={() => setShowNewSurvey(true)}>
            Create Survey
          </Button>
        </div>
      )}
    </div>
  );
}
