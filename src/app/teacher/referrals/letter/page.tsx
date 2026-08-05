'use client';

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { getDeadlineMeta, DEADLINE_TONE_CLASSES } from '@/lib/deadline';
import { parseRecommendationDetails, type RecommendationDetails } from '@/lib/recommendation-details';
import { downloadRecommendationLetterDoc } from '@/lib/download-doc';
import RecommendationBragSheet from '../RecommendationBragSheet';

type Angle = 'academic' | 'leadership' | 'challenge' | 'well_rounded';
type SectionKey = 'opening' | 'body1' | 'body2' | 'closing';

const SECTION_ORDER: SectionKey[] = ['opening', 'body1', 'body2', 'closing'];
const SECTION_LABELS: Record<SectionKey, string> = {
  opening: 'Opening',
  body1: 'Body paragraph 1 — academic strengths',
  body2: 'Body paragraph 2 — personal character',
  closing: 'Closing',
};

const ANGLE_OPTIONS: { value: Angle; label: string; description: string }[] = [
  {
    value: 'academic',
    label: 'Academic Strength',
    description: 'Leads with rigor, curiosity, and habits of mind in the classroom.',
  },
  {
    value: 'leadership',
    label: 'Leadership & Initiative',
    description: 'Leads with how they take charge and influence the people around them.',
  },
  {
    value: 'challenge',
    label: 'Overcoming a Challenge',
    description: 'Leads with honest growth — a real limitation and how they worked through it.',
  },
  {
    value: 'well_rounded',
    label: 'Well-Rounded',
    description: 'Balances academics, character, and outside interests evenly.',
  },
];

interface RequestRow {
  id: number;
  title: string;
  description: string;
  category: string;
  student_id: string;
  student_name: string;
  recommendation_details: unknown;
}

interface LetterDocument {
  id: number;
  request_id: number;
  angle: Angle | null;
  opening: string;
  body1: string;
  body2: string;
  closing: string;
  merged_content: string;
  is_merged: boolean;
  status: 'drafting' | 'final';
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null;
  return (
    <span className="text-xs text-muted-foreground">
      {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : 'Could not save — check your connection'}
    </span>
  );
}

export default function TeacherLetterWorkspacePage() {
  return (
    <Suspense fallback={null}>
      <TeacherLetterWorkspaceInner />
    </Suspense>
  );
}

function TeacherLetterWorkspaceInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const requestId = Number(searchParams.get('requestId'));

  const [requestRow, setRequestRow] = useState<RequestRow | null>(null);
  const [details, setDetails] = useState<RecommendationDetails | undefined>(undefined);
  const [doc, setDoc] = useState<LetterDocument | null>(null);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);

  const [sections, setSections] = useState<Record<SectionKey, string>>({
    opening: '',
    body1: '',
    body2: '',
    closing: '',
  });
  const [mergedContent, setMergedContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [generating, setGenerating] = useState<SectionKey | 'full' | null>(null);
  const [genError, setGenError] = useState('');

  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const loadAll = useCallback(async () => {
    if (!requestId || Number.isNaN(requestId)) {
      setLoadError('No letter request specified.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError('');

    const { data: reqData, error: reqErr } = await supabase
      .from('requests')
      .select('id, title, description, category, student_id, student_name, recommendation_details')
      .eq('id', requestId)
      .maybeSingle();

    if (reqErr || !reqData) {
      setLoadError('Could not find this letter request.');
      setIsLoading(false);
      return;
    }
    if (reqData.category !== 'recommendation') {
      setLoadError('This request is not a recommendation letter request.');
      setIsLoading(false);
      return;
    }

    setRequestRow(reqData);
    setDetails(parseRecommendationDetails(reqData.recommendation_details));

    const { data: docData } = await supabase
      .from('recommendation_letter_documents')
      .select('*')
      .eq('request_id', requestId)
      .maybeSingle();

    if (docData) {
      setDoc(docData as LetterDocument);
      setSections({
        opening: docData.opening || '',
        body1: docData.body1 || '',
        body2: docData.body2 || '',
        closing: docData.closing || '',
      });
      setMergedContent(docData.merged_content || '');
    }

    setIsLoading(false);
  }, [requestId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const chooseAngle = async (angle: Angle) => {
    if (!user?.id || !requestRow || isCreatingDoc) return;
    setIsCreatingDoc(true);
    const { data, error } = await supabase
      .from('recommendation_letter_documents')
      .insert({
        request_id: requestRow.id,
        teacher_id: user.id,
        student_id: requestRow.student_id,
        school_id: user.schoolId,
        angle,
      })
      .select('*')
      .single();
    setIsCreatingDoc(false);

    if (!error && data) {
      setDoc(data as LetterDocument);
    } else {
      setLoadError(error?.message || 'Unable to start this letter right now.');
    }
  };

  const scheduleFieldSave = useCallback(
    (docId: number, field: 'opening' | 'body1' | 'body2' | 'closing' | 'merged_content', value: string) => {
      setSaveStatus('saving');
      const key = field;
      if (saveTimers.current[key]) clearTimeout(saveTimers.current[key]);
      saveTimers.current[key] = setTimeout(async () => {
        const { error } = await supabase
          .from('recommendation_letter_documents')
          .update({ [field]: value })
          .eq('id', docId);
        setSaveStatus(error ? 'error' : 'saved');
      }, 800);
    },
    []
  );

  const handleSectionChange = (key: SectionKey, value: string) => {
    setSections((prev) => ({ ...prev, [key]: value }));
    if (doc) scheduleFieldSave(doc.id, key, value);
  };

  const handleMergedChange = (value: string) => {
    setMergedContent(value);
    if (doc) scheduleFieldSave(doc.id, 'merged_content', value);
  };

  const generateSection = async (key: SectionKey) => {
    if (!doc?.angle || !requestRow || generating) return;
    setGenerating(key);
    setGenError('');
    try {
      const res = await fetch('/api/ai-recommendation-drafter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: requestRow.id,
          teacherName: user ? `${user.firstName} ${user.lastName}` : undefined,
          angle: doc.angle,
          mode: 'section',
          section: key,
          otherSections: { ...sections, [key]: undefined },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to generate this section right now.');
      handleSectionChange(key, data.content as string);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Unable to generate this section right now.');
    } finally {
      setGenerating(null);
    }
  };

  const generateFullDraft = async () => {
    if (!doc?.angle || !requestRow || generating) return;
    setGenerating('full');
    setGenError('');
    try {
      const res = await fetch('/api/ai-recommendation-drafter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: requestRow.id,
          teacherName: user ? `${user.firstName} ${user.lastName}` : undefined,
          angle: doc.angle,
          mode: 'full',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to generate a draft right now.');
      const newSections = data.sections as Record<SectionKey, string>;
      setSections(newSections);
      if (doc) {
        setSaveStatus('saving');
        const { error } = await supabase
          .from('recommendation_letter_documents')
          .update(newSections)
          .eq('id', doc.id);
        setSaveStatus(error ? 'error' : 'saved');
      }
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Unable to generate a draft right now.');
    } finally {
      setGenerating(null);
    }
  };

  const mergeIntoDocument = async () => {
    if (!doc) return;
    const merged = SECTION_ORDER.map((key) => sections[key].trim()).filter(Boolean).join('\n\n');
    setMergedContent(merged);
    setSaveStatus('saving');
    const { error } = await supabase
      .from('recommendation_letter_documents')
      .update({ merged_content: merged, is_merged: true })
      .eq('id', doc.id);
    if (!error) {
      setDoc((prev) => (prev ? { ...prev, merged_content: merged, is_merged: true } : prev));
      setSaveStatus('saved');
    } else {
      setSaveStatus('error');
    }
  };

  const backToSections = async () => {
    if (!doc) return;
    const { error } = await supabase
      .from('recommendation_letter_documents')
      .update({ is_merged: false })
      .eq('id', doc.id);
    if (!error) setDoc((prev) => (prev ? { ...prev, is_merged: false } : prev));
  };

  const markAsFinal = async () => {
    if (!doc) return;
    const nextStatus = doc.status === 'final' ? 'drafting' : 'final';
    const { error } = await supabase
      .from('recommendation_letter_documents')
      .update({ status: nextStatus })
      .eq('id', doc.id);
    if (!error) setDoc((prev) => (prev ? { ...prev, status: nextStatus } : prev));
  };

  const handleDownload = () => {
    if (!requestRow || !user) return;
    downloadRecommendationLetterDoc({
      studentName: requestRow.student_name,
      teacherName: `${user.firstName} ${user.lastName}`,
      teacherSubject: user.subject,
      schoolName: user.schoolName,
      bodyText: mergedContent,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-muted-foreground">Loading…</div>
    );
  }

  if (loadError || !requestRow) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Card className="p-4 border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive font-medium">{loadError || 'Something went wrong.'}</p>
        </Card>
        <Link href="/teacher/referrals" className="text-sm text-primary hover:underline">
          ← Back to Referrals
        </Link>
      </div>
    );
  }

  const deadlineMeta = details?.deadline ? getDeadlineMeta(details.deadline) : null;
  const allSectionsHaveContent = SECTION_ORDER.every((key) => sections[key].trim().length > 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div>
        <Link href="/teacher/referrals" className="text-sm text-primary hover:underline">
          ← Back to Referrals
        </Link>
        <div className="flex items-start justify-between gap-3 mt-2 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-heading">
              Letter for {requestRow.student_name}
            </h1>
            <p className="text-muted-foreground mt-1">
              This letter is private to you — the student never sees its contents.
            </p>
          </div>
          {doc?.status === 'final' && <Badge variant="success">Final</Badge>}
        </div>
        {deadlineMeta && (
          <div
            className={`inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-lg border text-xs font-medium ${DEADLINE_TONE_CLASSES[deadlineMeta.tone]}`}
          >
            <span>Letter needed by {deadlineMeta.formatted}</span>
            <span className="opacity-70">· {deadlineMeta.relative}</span>
          </div>
        )}
      </div>

      {details && (
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-foreground select-none">
            What the student shared
          </summary>
          <div className="mt-2">
            <RecommendationBragSheet details={details} />
          </div>
        </details>
      )}

      {!doc && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-1">Choose a starting angle</h2>
          <p className="text-sm text-muted-foreground mb-4">
            This shapes what the AI leans into when it helps you write — you can still cover everything either way.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {ANGLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={isCreatingDoc}
                onClick={() => chooseAngle(option.value)}
                className="text-left p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors disabled:opacity-50"
              >
                <p className="font-medium text-foreground">{option.label}</p>
                <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {doc && !doc.is_merged && (
        <div className="space-y-4">
          <Card className="p-4 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-medium text-foreground">
                Angle: {ANGLE_OPTIONS.find((o) => o.value === doc.angle)?.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Write each part yourself, ask AI for help section by section, or generate a full draft to start from.
              </p>
            </div>
            <Button size="sm" variant="outline" isLoading={generating === 'full'} onClick={generateFullDraft}>
              ✨ Generate full draft
            </Button>
          </Card>

          {genError && (
            <Card className="p-3 border-destructive/30 bg-destructive/5">
              <p className="text-sm text-destructive">{genError}</p>
            </Card>
          )}

          {SECTION_ORDER.map((key) => (
            <Card key={key} className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <label className="text-sm font-medium text-foreground">{SECTION_LABELS[key]}</label>
                <Button
                  size="sm"
                  variant="outline"
                  isLoading={generating === key}
                  onClick={() => generateSection(key)}
                >
                  ✨ Help me write this
                </Button>
              </div>
              <Textarea
                value={sections[key]}
                onChange={(e) => handleSectionChange(key, e.target.value)}
                rows={key === 'opening' || key === 'closing' ? 4 : 6}
                placeholder="Write it yourself, or click 'Help me write this' for a starting point…"
              />
            </Card>
          ))}

          <div className="flex items-center gap-3 flex-wrap">
            <Button disabled={!allSectionsHaveContent} onClick={mergeIntoDocument}>
              Merge into one document
            </Button>
            {!allSectionsHaveContent && (
              <span className="text-xs text-muted-foreground">Fill in all four parts to merge</span>
            )}
            <SaveIndicator status={saveStatus} />
          </div>
        </div>
      )}

      {doc && doc.is_merged && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button type="button" onClick={backToSections} className="text-sm text-primary hover:underline">
              ← Back to sections
            </button>
            <SaveIndicator status={saveStatus} />
          </div>
          <Textarea
            value={mergedContent}
            onChange={(e) => handleMergedChange(e.target.value)}
            rows={20}
            className="leading-relaxed"
          />
          <p className="text-xs text-muted-foreground">
            This is your working draft — verify every detail before sending it anywhere.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={handleDownload} disabled={!mergedContent.trim()}>
              Download as Word doc
            </Button>
            <Button variant="outline" onClick={markAsFinal}>
              {doc.status === 'final' ? 'Reopen for editing' : 'Mark as Final'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
