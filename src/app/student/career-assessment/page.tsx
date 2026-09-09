'use client';

import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Json } from '@/lib/database.types';
import { makeUserCacheKey, readCachedData, writeCachedData } from '@/lib/client-cache';
import ResultBreakdown from '@/components/career-assessment/ResultBreakdown';
import {
  gradeToAssessmentType,
  ASSESSMENT_META,
  type AssessmentType,
  DDO_QUESTIONS,
  RIASEC_ITEMS,
  CMI_STATEMENTS,
  RIASEC_CATEGORY_INFO,
  CMI_BLOCK_INFO,
  scoreDdo,
  scoreRiasec,
  scoreCmi,
  type DdoResultRow,
  type RiasecResult,
  type CmiResult,
} from '@/lib/career-assessment';

const CACHE_TTL_MS = 5 * 60 * 1000;
const CHUNK_SIZE = 10;

interface StoredResult {
  scores: Json;
  headline: string;
  completedAt: string;
}

const RIASEC_SCALE = [
  { value: '1', label: 'Mutlaqo yoqmaydi' },
  { value: '2', label: 'Yoqmaydi' },
  { value: '3', label: 'Befarqman' },
  { value: '4', label: 'Yoqadi' },
  { value: '5', label: 'Juda yoqadi' },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CareerAssessmentPage() {
  const { user } = useAuth();
  const assessmentType: AssessmentType | null = useMemo(
    () => gradeToAssessmentType(user?.gradeLevel),
    [user?.gradeLevel]
  );

  const [isTaking, setIsTaking] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [step, setStep] = useState(0);
  const [existingResult, setExistingResult] = useState<StoredResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasWarmCache, setHasWarmCache] = useState(false);
  const [isCacheHydrated, setIsCacheHydrated] = useState(false);
  const [hasLoadedFromServer, setHasLoadedFromServer] = useState(false);

  const cacheKey = useMemo(
    () => (user?.id && assessmentType ? makeUserCacheKey(`career-assessment-${assessmentType}`, user.id, user.schoolId) : null),
    [user?.id, user?.schoolId, assessmentType]
  );

  useLayoutEffect(() => {
    setIsCacheHydrated(false);
    setHasLoadedFromServer(false);

    if (!cacheKey) {
      setExistingResult(null);
      setHasWarmCache(false);
      setIsCacheHydrated(true);
      return;
    }

    const cached = readCachedData<StoredResult | null>(cacheKey, CACHE_TTL_MS);
    if (cached.found) {
      setExistingResult(cached.data);
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
    writeCachedData<StoredResult | null>(cacheKey, existingResult);
  }, [cacheKey, isCacheHydrated, hasWarmCache, hasLoadedFromServer, existingResult]);

  const loadExisting = useCallback(async () => {
    if (!user?.id || !assessmentType) return;

    const { data } = await supabase
      .from('career_assessment_results')
      .select('scores,headline,completed_at')
      .eq('student_id', user.id)
      .eq('assessment_type', assessmentType)
      .maybeSingle();

    if (data) {
      setExistingResult({ scores: data.scores, headline: data.headline, completedAt: data.completed_at });
    } else {
      setExistingResult(null);
    }
    setHasLoadedFromServer(true);
  }, [user?.id, assessmentType]);

  useEffect(() => {
    if (!isCacheHydrated) return;
    void loadExisting();
  }, [isCacheHydrated, loadExisting]);

  const mode: 'intro' | 'taking' | 'result' = isTaking ? 'taking' : existingResult ? 'result' : 'intro';

  if (!assessmentType) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-foreground font-heading">Kasbga yo&apos;naltirish testi</h1>
        <p className="text-muted-foreground mt-3">
          Bu test hozircha 9, 10 va 11-sinf o&apos;quvchilari uchun mavjud. Sizning sinfingiz uchun test topilmadi.
        </p>
        <Link href="/student/dashboard" className="text-primary font-medium hover:underline mt-4 inline-block">
          ← Bosh sahifaga qaytish
        </Link>
      </div>
    );
  }

  const meta = ASSESSMENT_META[assessmentType];
  const items: { number: number; text: string; text2?: string }[] =
    assessmentType === 'ddo'
      ? DDO_QUESTIONS.map((q) => ({ number: q.number, text: q.textA, text2: q.textB }))
      : assessmentType === 'riasec'
        ? RIASEC_ITEMS.map((i) => ({ number: i.number, text: i.text }))
        : CMI_STATEMENTS.map((s) => ({ number: s.number, text: s.text }));

  const totalSteps = Math.ceil(items.length / CHUNK_SIZE);
  const answeredCount = items.filter((item) => answers[item.number] !== undefined).length;
  const allAnswered = answeredCount === items.length;

  const startTest = () => {
    setAnswers({});
    setStep(0);
    setIsTaking(true);
  };

  const selectAnswer = (number: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [number]: value }));
  };

  const stepLabel = (stepIndex: number) => {
    if (assessmentType === 'riasec') {
      const item = RIASEC_ITEMS[stepIndex * CHUNK_SIZE];
      return item ? RIASEC_CATEGORY_INFO[item.category].label : '';
    }
    if (assessmentType === 'cmi') {
      const statement = CMI_STATEMENTS[stepIndex * CHUNK_SIZE];
      return statement ? CMI_BLOCK_INFO[statement.block].label : '';
    }
    return '';
  };

  const handleSubmit = async () => {
    if (!user?.id || !user.schoolId || !allAnswered || isSubmitting) return;
    setIsSubmitting(true);

    let scores: Json;
    let headline: string;

    if (assessmentType === 'ddo') {
      const converted: Record<number, 'A' | 'B'> = {};
      Object.entries(answers).forEach(([k, v]) => { converted[Number(k)] = v as 'A' | 'B'; });
      const rows: DdoResultRow[] = scoreDdo(converted);
      scores = rows as unknown as Json;
      headline = `Ustuvor yo'nalish: ${rows[0].label} (${rows[0].score}/8)`;
    } else if (assessmentType === 'riasec') {
      const converted: Record<number, number> = {};
      Object.entries(answers).forEach(([k, v]) => { converted[Number(k)] = Number(v); });
      const result: RiasecResult = scoreRiasec(converted);
      scores = result as unknown as Json;
      headline = `Holland kodi: ${result.hollandCode}`;
    } else {
      const converted: Record<number, boolean> = {};
      Object.entries(answers).forEach(([k, v]) => { converted[Number(k)] = v === 'true'; });
      const result: CmiResult = scoreCmi(converted);
      scores = result as unknown as Json;
      headline = `Umumiy ball: ${result.total}/50`;
    }

    const { data, error } = await supabase
      .from('career_assessment_results')
      .upsert(
        {
          student_id: user.id,
          school_id: user.schoolId,
          assessment_type: assessmentType,
          grade_level: user.gradeLevel || null,
          answers: answers as unknown as Json,
          scores,
          headline,
        },
        { onConflict: 'student_id,assessment_type' }
      )
      .select('scores,headline,completed_at')
      .single();

    setIsSubmitting(false);
    if (error || !data) return;

    setExistingResult({ scores: data.scores, headline: data.headline, completedAt: data.completed_at });
    setIsTaking(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/student/dashboard" className="text-sm text-primary font-medium hover:underline">
          ← Bosh sahifa
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading mt-2">{meta.title}</h1>
        <p className="text-muted-foreground mt-1">{meta.subtitle}</p>
      </div>

      {mode === 'intro' && (
        <Card className="p-6 sm:p-8 space-y-4">
          <p className="text-foreground">
            Ushbu test sizning kasbiy qiziqishlaringiz va moyilliklaringizni aniqlashga yordam beradi. Natijalar
            faqat siz va maktab konsultantingiz uchun ko&apos;rinadi va kelajakdagi kasb tanlovingiz bo&apos;yicha
            maslahat berishda ishlatiladi.
          </p>
          <p className="text-sm text-muted-foreground">
            Jami {meta.totalQuestions} savol. To&apos;g&apos;ri yoki noto&apos;g&apos;ri javob yo&apos;q — faqat
            sizning haqiqiy fikringizni bildiring.
          </p>
          <Button onClick={startTest} size="lg">
            Testni boshlash
          </Button>
        </Card>
      )}

      {mode === 'taking' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {answeredCount} / {items.length} javob berildi
            </span>
            <span>
              Qism {step + 1} / {totalSteps}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(answeredCount / items.length) * 100}%` }}
            />
          </div>

          <Card className="p-5 sm:p-6 space-y-5">
            {stepLabel(step) && (
              <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">{stepLabel(step)}</h2>
            )}

            {assessmentType === 'riasec' && (
              <div className="hidden sm:grid grid-cols-[1fr_repeat(5,3.5rem)] gap-2 text-[11px] text-muted-foreground text-center px-1">
                <span />
                {RIASEC_SCALE.map((s) => (
                  <span key={s.value} className="leading-tight">{s.label}</span>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {items.slice(step * CHUNK_SIZE, step * CHUNK_SIZE + CHUNK_SIZE).map((item) => (
                <div key={item.number} className="p-3 border border-border rounded-lg bg-muted/20">
                  {assessmentType === 'ddo' ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">{item.number}.</p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => selectAnswer(item.number, 'A')}
                          className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                            answers[item.number] === 'A'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card border-border hover:bg-muted/50'
                          }`}
                        >
                          {item.text}
                        </button>
                        <button
                          type="button"
                          onClick={() => selectAnswer(item.number, 'B')}
                          className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                            answers[item.number] === 'B'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card border-border hover:bg-muted/50'
                          }`}
                        >
                          {item.text2}
                        </button>
                      </div>
                    </div>
                  ) : assessmentType === 'riasec' ? (
                    <div className="flex flex-col sm:grid sm:grid-cols-[1fr_repeat(5,3.5rem)] gap-2 sm:items-center">
                      <p className="text-sm text-foreground">
                        <span className="text-muted-foreground">{item.number}.</span> {item.text}
                      </p>
                      <div className="flex sm:contents gap-2 justify-between sm:justify-normal">
                        {RIASEC_SCALE.map((s) => (
                          <button
                            key={s.value}
                            type="button"
                            title={s.label}
                            onClick={() => selectAnswer(item.number, s.value)}
                            className={`w-9 h-9 sm:w-full sm:h-9 rounded-lg border text-sm font-semibold transition-colors mx-auto ${
                              answers[item.number] === s.value
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-card border-border hover:bg-muted/50 text-muted-foreground'
                            }`}
                          >
                            {s.value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-foreground">
                        <span className="text-muted-foreground">{item.number}.</span> {item.text}
                      </p>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => selectAnswer(item.number, 'true')}
                          className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                            answers[item.number] === 'true'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card border-border hover:bg-muted/50'
                          }`}
                        >
                          To&apos;g&apos;ri
                        </button>
                        <button
                          type="button"
                          onClick={() => selectAnswer(item.number, 'false')}
                          className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                            answers[item.number] === 'false'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card border-border hover:bg-muted/50'
                          }`}
                        >
                          Noto&apos;g&apos;ri
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
                Oldingi
              </Button>
              {step < totalSteps - 1 ? (
                <Button onClick={() => setStep((s) => Math.min(totalSteps - 1, s + 1))}>Keyingi</Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!allAnswered} isLoading={isSubmitting}>
                  Testni yakunlash
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {mode === 'result' && existingResult && (
        <ResultView
          assessmentType={assessmentType}
          scores={existingResult.scores}
          headline={existingResult.headline}
          completedAt={existingResult.completedAt}
          onRetake={startTest}
        />
      )}
    </div>
  );
}

function ResultView({
  assessmentType,
  scores,
  headline,
  completedAt,
  onRetake,
}: {
  assessmentType: AssessmentType;
  scores: Json;
  headline: string;
  completedAt: string;
  onRetake: () => void;
}) {
  return (
    <div className="space-y-5">
      <Card className="p-6 sm:p-8">
        <p className="text-sm text-muted-foreground">Bajarilgan sana: {formatDate(completedAt)}</p>
        <h2 className="text-xl font-bold text-foreground font-heading mt-1">{headline}</h2>
      </Card>

      <ResultBreakdown assessmentType={assessmentType} scores={scores} />

      <Button variant="outline" onClick={onRetake}>
        Testni qayta topshirish
      </Button>
    </div>
  );
}
