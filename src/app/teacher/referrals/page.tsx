'use client';

import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import { Card, ContentCard } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { makeUserCacheKey, readCachedData, writeCachedData } from '@/lib/client-cache';
import { getRequestStatusLabel, normalizeRequestStatus, type RequestStatus } from '@/lib/request-status';
import { parseRecommendationDetails, type RecommendationDetails } from '@/lib/recommendation-details';

const RECOMMENDATION_CATEGORY = 'recommendation';

type DeadlineTone = 'overdue' | 'soon' | 'plenty';

interface DeadlineMeta {
  formatted: string;
  relative: string;
  tone: DeadlineTone;
}

const DEADLINE_TONE_CLASSES: Record<DeadlineTone, string> = {
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  soon: 'bg-warning/10 text-warning border-warning/20',
  plenty: 'bg-muted/40 text-foreground border-border',
};

function getDeadlineMeta(deadline: string): DeadlineMeta | null {
  if (!deadline) return null;
  const target = new Date(`${deadline}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
  const formatted = target.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays);
    return { formatted, relative: `overdue by ${daysAgo} day${daysAgo === 1 ? '' : 's'}`, tone: 'overdue' };
  }
  if (diffDays === 0) return { formatted, relative: 'due today', tone: 'soon' };
  if (diffDays <= 7) return { formatted, relative: `${diffDays} day${diffDays === 1 ? '' : 's'} left`, tone: 'soon' };
  return { formatted, relative: `${diffDays} days left`, tone: 'plenty' };
}

interface Referral {
  id: number;
  title: string;
  description: string;
  studentName: string;
  counselorName: string;
  status: RequestStatus;
  category: string;
  response: string | null;
  createdAt: string;
  recommendationDetails?: RecommendationDetails;
}

interface TeacherReferralsCachePayload {
  referrals: Referral[];
}

const TEACHER_REFERRALS_CACHE_TTL_MS = 2 * 60 * 1000;

function mapRequestRowToReferral(row: {
  id: number;
  title: string;
  description: string;
  student_name: string;
  counselor_name: string;
  status: string;
  category: string;
  response: string | null;
  created_at: string;
  recommendation_details?: unknown;
}): Referral {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    studentName: row.student_name || 'Unknown',
    counselorName: row.counselor_name || '',
    status: normalizeRequestStatus(row.status),
    category: row.category,
    response: row.response,
    createdAt: new Date(row.created_at).toLocaleDateString(),
    recommendationDetails: parseRecommendationDetails(row.recommendation_details),
  };
}

export default function TeacherReferralsPage() {
  const { user, getSchoolStudents, getSchoolCounselors } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    category: 'academic',
    title: '',
    description: '',
    counselorId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [loadError, setLoadError] = useState('');
  const [hasWarmCache, setHasWarmCache] = useState(false);
  const [isCacheHydrated, setIsCacheHydrated] = useState(false);
  const [hasLoadedFromServer, setHasLoadedFromServer] = useState(false);

  // Respond-to-student-request state
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // AI recommendation-letter drafting state
  const [draftingId, setDraftingId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [draftErrors, setDraftErrors] = useState<Record<number, string>>({});
  const [copiedDraftId, setCopiedDraftId] = useState<number | null>(null);

  const cacheKey = useMemo(
    () => (user?.id ? makeUserCacheKey('teacher-referrals', user.id, user.schoolId) : null),
    [user?.id, user?.schoolId]
  );

  const students = user?.schoolId ? getSchoolStudents(user.schoolId).filter(s => s.approved) : [];
  const counselors = user?.schoolId ? getSchoolCounselors(user.schoolId) : [];

  useLayoutEffect(() => {
    setIsCacheHydrated(false);
    setHasLoadedFromServer(false);

    if (!cacheKey) {
      setReferrals([]);
      setLoadError('');
      setHasWarmCache(false);
      setIsCacheHydrated(true);
      return;
    }

    const cached = readCachedData<TeacherReferralsCachePayload>(
      cacheKey,
      TEACHER_REFERRALS_CACHE_TTL_MS
    );
    if (cached.found && cached.data) {
      setReferrals(cached.data.referrals || []);
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

    writeCachedData<TeacherReferralsCachePayload>(cacheKey, { referrals });
  }, [cacheKey, isCacheHydrated, hasWarmCache, hasLoadedFromServer, referrals]);

  const loadReferrals = useCallback(async () => {
    if (!user?.id || !user?.schoolId) return;

    const { data, error } = await supabase
      .from('requests')
      .select('id,title,description,status,category,counselor_name,counselor_id,teacher_id,teacher_name,student_name,student_id,school_id,response,recommendation_details,created_at')
      .eq('school_id', user.schoolId)
      .or(`teacher_id.eq.${user.id},counselor_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReferrals(data.map(mapRequestRowToReferral));
      setLoadError('');
      setHasLoadedFromServer(true);
      return;
    }

    setLoadError(error?.message || 'Unable to load referrals. Please refresh.');
  }, [user?.id, user?.schoolId]);

  useEffect(() => {
    if (!isCacheHydrated) return;
    void loadReferrals();
  }, [isCacheHydrated, loadReferrals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !formData.title || !formData.studentName) return;

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const selectedCounselor = counselors.find((c) => c.id === formData.counselorId);
      const selectedStudent = students.find(
        (s) => `${s.firstName} ${s.lastName}` === formData.studentName
      );

      if (!selectedStudent) {
        setSubmitError('Please select a valid student from the list.');
        return;
      }

      const { error } = await supabase.from('requests').insert({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        status: 'pending',
        student_name: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
        student_id: selectedStudent.id,
        teacher_id: user.id,
        counselor_name: selectedCounselor
          ? `${selectedCounselor.firstName} ${selectedCounselor.lastName}`
          : 'Unassigned',
        counselor_id: selectedCounselor?.id || null,
        school_id: user.schoolId,
      });

      if (error) {
        setSubmitError(error.message || 'Unable to submit referral right now.');
        return;
      }

      await loadReferrals();
      setFormData({
        studentName: '',
        category: 'academic',
        title: '',
        description: '',
        counselorId: '',
      });
      setShowForm(false);
      setSubmitSuccess('Referral submitted successfully.');
      window.setTimeout(() => setSubmitSuccess(''), 3500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExpand = (referral: Referral) => {
    setSaveError('');
    if (expandedId === referral.id) {
      setExpandedId(null);
      setResponseText('');
    } else {
      setExpandedId(referral.id);
      setResponseText(referral.response || '');
    }
  };

  const updateRequest = async (
    id: number,
    updates: { status?: RequestStatus; response?: string }
  ): Promise<{ ok: boolean; error?: string }> => {
    const payload: { status?: string; response?: string | null } = {};
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.response !== undefined) payload.response = updates.response || null;

    const { data, error } = await supabase
      .from('requests')
      .update(payload)
      .eq('id', id)
      .select('id,title,description,status,category,counselor_name,counselor_id,teacher_id,teacher_name,student_name,student_id,school_id,response,recommendation_details,created_at')
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message || 'Unable to save. Please try again.' };
    }

    const mapped = mapRequestRowToReferral(data);
    setReferrals((prev) => prev.map((r) => (r.id === id ? mapped : r)));
    return { ok: true };
  };

  const handleSaveResponse = async (id: number) => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess('');

    const result = await updateRequest(id, { response: responseText.trim() });
    setIsSaving(false);

    if (!result.ok) {
      setSaveError(result.error || 'Unable to save response.');
      return;
    }

    setSaveSuccess('Response saved.');
    window.setTimeout(() => setSaveSuccess(''), 3000);
    setExpandedId(null);
    setResponseText('');
  };

  const handleStatusChange = async (id: number, newStatus: RequestStatus) => {
    const result = await updateRequest(id, { status: newStatus });
    if (!result.ok) setSaveError(result.error || 'Unable to update status.');
  };

  const handleGenerateDraft = async (req: Referral) => {
    if (draftingId) return;
    setDraftingId(req.id);
    setDraftErrors((prev) => ({ ...prev, [req.id]: '' }));

    try {
      const res = await fetch('/api/ai-recommendation-drafter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: req.id,
          teacherName: user ? `${user.firstName} ${user.lastName}` : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to generate a draft right now.');
      setDrafts((prev) => ({ ...prev, [req.id]: data.draft }));
    } catch (err) {
      setDraftErrors((prev) => ({
        ...prev,
        [req.id]: err instanceof Error ? err.message : 'Unable to generate a draft right now.',
      }));
    } finally {
      setDraftingId(null);
    }
  };

  const handleCopyDraft = async (req: Referral) => {
    const text = drafts[req.id];
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedDraftId(req.id);
      window.setTimeout(() => setCopiedDraftId((id) => (id === req.id ? null : id)), 2000);
    } catch {
      // Clipboard API may be unavailable (e.g. insecure context) — nothing more we can do.
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning' as const;
      case 'in_progress': return 'primary' as const;
      case 'completed': return 'success' as const;
      case 'approved': return 'success' as const;
      default: return 'secondary' as const;
    }
  };

  const studentRequests = referrals.filter((r) => r.category === RECOMMENDATION_CATEGORY);
  const myReferrals = referrals.filter((r) => r.category !== RECOMMENDATION_CATEGORY);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Referrals & Requests</h1>
          <p className="text-muted-foreground mt-1">Submit referrals to counselors, and respond to requests students send you directly</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-500 text-white hover:bg-amber-600"
        >
          {showForm ? 'Cancel' : '+ New Referral'}
        </Button>
      </div>

      {loadError && (
        <Card className="p-4 border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive font-medium">{loadError}</p>
        </Card>
      )}

      {submitError && (
        <Card className="p-4 border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive font-medium">{submitError}</p>
        </Card>
      )}

      {submitSuccess && (
        <Card className="p-4 border-success/30 bg-success/5">
          <p className="text-sm text-success font-medium">{submitSuccess}</p>
        </Card>
      )}

      {saveSuccess && (
        <Card className="p-4 border-success/30 bg-success/5">
          <p className="text-sm text-success font-medium">{saveSuccess}</p>
        </Card>
      )}

      {saveError && (
        <Card className="p-4 border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive font-medium">{saveError}</p>
        </Card>
      )}

      {showForm && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">New Referral</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Student</label>
                <select
                  value={formData.studentName}
                  onChange={e => setFormData(p => ({ ...p, studentName: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  required
                >
                  <option value="">Select student</option>
                  {students.map(s => (
                    <option key={s.id} value={`${s.firstName} ${s.lastName}`}>{s.firstName} {s.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="academic">Academic</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="emotional">Emotional</option>
                  <option value="social">Social</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Concern Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                placeholder="Brief description of concern"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Details</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="Provide additional details about the concern..."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground resize-none"
              />
            </div>
            {counselors.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Assign to Counselor</label>
                <select
                  value={formData.counselorId}
                  onChange={e => setFormData(p => ({ ...p, counselorId: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="">Auto-assign</option>
                  {counselors.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>
            )}
            <Button type="submit" isLoading={isSubmitting} className="bg-amber-500 text-white hover:bg-amber-600">
              Submit Referral
            </Button>
          </form>
        </Card>
      )}

      {/* Requests from students, directed at this teacher (e.g. recommendation letters) */}
      <ContentCard title="Requests From Students">
        {studentRequests.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="font-medium text-foreground">No requests yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              When a student asks you directly for something — like a recommendation letter — it will show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {studentRequests.map((req) => (
              <Card key={req.id} className="p-4" hover>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-medium text-foreground">{req.title}</p>
                      <Badge variant={getStatusVariant(req.status)} size="sm">{getRequestStatusLabel(req.status)}</Badge>
                      {req.category === RECOMMENDATION_CATEGORY && (
                        <Badge variant="accent" size="sm">Recommendation Letter</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Requested by: {req.studentName}</p>

                    {req.recommendationDetails?.deadline && (() => {
                      const meta = getDeadlineMeta(req.recommendationDetails!.deadline);
                      if (!meta) return null;
                      return (
                        <div
                          className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg border text-xs font-medium ${DEADLINE_TONE_CLASSES[meta.tone]}`}
                        >
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Letter needed by {meta.formatted}</span>
                          <span className="opacity-70">· {meta.relative}</span>
                        </div>
                      );
                    })()}

                    {req.description && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground">What it's for, in their words</p>
                        <p className="text-sm text-foreground">{req.description}</p>
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground mt-2 inline-block">Requested {req.createdAt}</span>

                    {req.recommendationDetails && (
                      <div className="mt-3 rounded-lg border border-border bg-muted/20 divide-y divide-border text-sm overflow-hidden">
                        <div className="px-3 py-2 bg-muted/30">
                          <p className="text-xs text-muted-foreground">
                            The student answered a few questions to help you write a stronger, more specific letter.
                          </p>
                        </div>

                        {(req.recommendationDetails.courses || req.recommendationDetails.reasonForChoosing) && (
                          <div className="p-3 space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">Context</p>
                            {req.recommendationDetails.courses && (
                              <div>
                                <p className="text-xs font-medium text-foreground">Course(s) taken with you</p>
                                <p className="text-[11px] text-muted-foreground">So you can recall which class and when</p>
                                <p className="text-foreground mt-0.5">{req.recommendationDetails.courses}</p>
                              </div>
                            )}
                            {req.recommendationDetails.reasonForChoosing && (
                              <div>
                                <p className="text-xs font-medium text-foreground">Why they asked you specifically</p>
                                <p className="text-foreground mt-0.5">{req.recommendationDetails.reasonForChoosing}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {(req.recommendationDetails.adjectives.length > 0 ||
                          req.recommendationDetails.proudProject ||
                          req.recommendationDetails.favoriteLesson ||
                          req.recommendationDetails.attributes.length > 0 ||
                          req.recommendationDetails.somethingTheyDontKnow) && (
                          <div className="p-3 space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                              Material for the letter
                            </p>
                            {req.recommendationDetails.adjectives.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-foreground">How they'd describe themselves</p>
                                <p className="text-foreground mt-0.5">{req.recommendationDetails.adjectives.join(', ')}</p>
                              </div>
                            )}
                            {req.recommendationDetails.proudProject && (
                              <div>
                                <p className="text-xs font-medium text-foreground">A project or piece of work they're proud of</p>
                                <p className="text-[11px] text-muted-foreground">A concrete example you can cite</p>
                                <p className="text-foreground mt-0.5">{req.recommendationDetails.proudProject}</p>
                              </div>
                            )}
                            {req.recommendationDetails.favoriteLesson && (
                              <div>
                                <p className="text-xs font-medium text-foreground">A lesson or moment in your class they enjoyed</p>
                                <p className="text-foreground mt-0.5">{req.recommendationDetails.favoriteLesson}</p>
                              </div>
                            )}
                            {req.recommendationDetails.attributes.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-foreground mb-1.5">
                                  Qualities they'd like you to highlight
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {req.recommendationDetails.attributes.map((attribute) => (
                                    <Badge key={attribute} variant="secondary" size="sm">{attribute}</Badge>
                                  ))}
                                </div>
                                {req.recommendationDetails.attributeStory && (
                                  <p className="text-foreground mt-1.5">
                                    <span className="text-[11px] text-muted-foreground">Supporting story: </span>
                                    {req.recommendationDetails.attributeStory}
                                  </p>
                                )}
                              </div>
                            )}
                            {req.recommendationDetails.somethingTheyDontKnow && (
                              <div>
                                <p className="text-xs font-medium text-foreground">Something they think you might not know</p>
                                <p className="text-[11px] text-muted-foreground">A personal detail to add color</p>
                                <p className="text-foreground mt-0.5">{req.recommendationDetails.somethingTheyDontKnow}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {(req.recommendationDetails.targetColleges ||
                          req.recommendationDetails.intendedMajor ||
                          req.recommendationDetails.additionalInfo) && (
                          <div className="p-3 space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                              Where this is going
                            </p>
                            {(req.recommendationDetails.targetColleges || req.recommendationDetails.intendedMajor) && (
                              <div>
                                <p className="text-xs font-medium text-foreground">Applying to</p>
                                <p className="text-[11px] text-muted-foreground">Tailor examples toward these, if relevant</p>
                                <p className="text-foreground mt-0.5">
                                  {[req.recommendationDetails.targetColleges, req.recommendationDetails.intendedMajor]
                                    .filter(Boolean)
                                    .join(' · ')}
                                </p>
                              </div>
                            )}
                            {req.recommendationDetails.additionalInfo && (
                              <div>
                                <p className="text-xs font-medium text-foreground">Anything else from the student</p>
                                <p className="text-foreground mt-0.5">{req.recommendationDetails.additionalInfo}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 overflow-hidden">
                      <div className="px-3 py-2.5 flex items-center justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            Draft this letter with AI
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Builds a first draft from what {req.studentName.split(' ')[0] || 'the student'} shared above, in your voice — read it over and personalize it before using it anywhere.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          isLoading={draftingId === req.id}
                          onClick={() => handleGenerateDraft(req)}
                        >
                          {drafts[req.id] ? 'Regenerate' : 'Generate draft'}
                        </Button>
                      </div>

                      {draftErrors[req.id] && (
                        <p className="px-3 pb-2.5 text-xs text-destructive">{draftErrors[req.id]}</p>
                      )}

                      {drafts[req.id] && (
                        <div className="border-t border-primary/20 p-3 space-y-2">
                          <textarea
                            value={drafts[req.id]}
                            onChange={(e) => setDrafts((prev) => ({ ...prev, [req.id]: e.target.value }))}
                            rows={10}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm leading-relaxed resize-y"
                          />
                          <div className="flex items-center gap-3 flex-wrap">
                            <Button size="sm" onClick={() => handleCopyDraft(req)}>
                              {copiedDraftId === req.id ? 'Copied!' : 'Copy draft'}
                            </Button>
                            <span className="text-xs text-muted-foreground">
                              This is a starting point, not a final letter — verify every detail before sending.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {req.response && expandedId !== req.id && (
                      <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Your response:</p>
                        <p className="text-sm text-foreground line-clamp-2">{req.response}</p>
                      </div>
                    )}

                    {expandedId === req.id && (
                      <div className="mt-3 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Write your response
                          </label>
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Let the student know where things stand..."
                            rows={3}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground resize-none"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            isLoading={isSaving}
                            disabled={!responseText.trim()}
                            onClick={() => handleSaveResponse(req.id)}
                          >
                            Save Response
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleExpand(req)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {expandedId !== req.id && (
                        <Button size="sm" variant="outline" onClick={() => handleExpand(req)}>
                          {req.response ? 'Edit Response' : 'Respond'}
                        </Button>
                      )}
                      {req.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(req.id, 'in_progress')}>
                          Mark In Progress
                        </Button>
                      )}
                      {req.status === 'in_progress' && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(req.id, 'completed')}>
                          Mark Completed
                        </Button>
                      )}
                      {req.status !== 'completed' && req.status !== 'pending' && req.status !== 'in_progress' && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(req.id, 'completed')}>
                          Mark Completed
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ContentCard>

      {/* Referrals this teacher has raised with counselors */}
      <ContentCard title="My Referrals">
        {myReferrals.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <p className="font-medium text-foreground">No referrals yet</p>
            <p className="text-sm text-muted-foreground mt-1">Submit a referral when you have a concern about a student.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myReferrals.map(ref => (
              <Card key={ref.id} className="p-4" hover>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground">{ref.title}</p>
                      <Badge variant={getStatusVariant(ref.status)} size="sm">{getRequestStatusLabel(ref.status)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Student: {ref.studentName}</p>
                    {ref.description && <p className="text-sm text-muted-foreground mt-1">{ref.description}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="accent" size="sm">{ref.category}</Badge>
                      <span className="text-xs text-muted-foreground">{ref.createdAt}</span>
                    </div>
                    {ref.response && (
                      <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Counselor Response:</p>
                        <p className="text-sm text-foreground">{ref.response}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ContentCard>
    </div>
  );
}
