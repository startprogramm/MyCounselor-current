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
                    {req.description && <p className="text-sm text-muted-foreground mt-1">{req.description}</p>}
                    <span className="text-xs text-muted-foreground mt-2 inline-block">{req.createdAt}</span>

                    {req.recommendationDetails && (
                      <dl className="mt-3 space-y-2.5 p-3 bg-muted/20 border border-border rounded-lg text-sm">
                        {(req.recommendationDetails.courses || req.recommendationDetails.deadline) && (
                          <div className="flex flex-wrap gap-x-6 gap-y-1">
                            {req.recommendationDetails.courses && (
                              <div>
                                <dt className="text-xs font-medium text-muted-foreground">Course(s)</dt>
                                <dd className="text-foreground">{req.recommendationDetails.courses}</dd>
                              </div>
                            )}
                            {req.recommendationDetails.deadline && (
                              <div>
                                <dt className="text-xs font-medium text-muted-foreground">Deadline</dt>
                                <dd className="text-foreground">{req.recommendationDetails.deadline}</dd>
                              </div>
                            )}
                          </div>
                        )}
                        {req.recommendationDetails.reasonForChoosing && (
                          <div>
                            <dt className="text-xs font-medium text-muted-foreground">Why they chose you</dt>
                            <dd className="text-foreground">{req.recommendationDetails.reasonForChoosing}</dd>
                          </div>
                        )}
                        {req.recommendationDetails.adjectives.length > 0 && (
                          <div>
                            <dt className="text-xs font-medium text-muted-foreground">Three words</dt>
                            <dd className="text-foreground">{req.recommendationDetails.adjectives.join(', ')}</dd>
                          </div>
                        )}
                        {req.recommendationDetails.proudProject && (
                          <div>
                            <dt className="text-xs font-medium text-muted-foreground">A project they're proud of</dt>
                            <dd className="text-foreground">{req.recommendationDetails.proudProject}</dd>
                          </div>
                        )}
                        {req.recommendationDetails.favoriteLesson && (
                          <div>
                            <dt className="text-xs font-medium text-muted-foreground">A lesson they enjoyed</dt>
                            <dd className="text-foreground">{req.recommendationDetails.favoriteLesson}</dd>
                          </div>
                        )}
                        {req.recommendationDetails.attributes.length > 0 && (
                          <div>
                            <dt className="text-xs font-medium text-muted-foreground">
                              Qualities to highlight: {req.recommendationDetails.attributes.join(', ')}
                            </dt>
                            <dd className="text-foreground">{req.recommendationDetails.attributeStory}</dd>
                          </div>
                        )}
                        {req.recommendationDetails.somethingTheyDontKnow && (
                          <div>
                            <dt className="text-xs font-medium text-muted-foreground">Something you might not know</dt>
                            <dd className="text-foreground">{req.recommendationDetails.somethingTheyDontKnow}</dd>
                          </div>
                        )}
                        {(req.recommendationDetails.targetColleges || req.recommendationDetails.intendedMajor) && (
                          <div>
                            <dt className="text-xs font-medium text-muted-foreground">Applying to</dt>
                            <dd className="text-foreground">
                              {[req.recommendationDetails.targetColleges, req.recommendationDetails.intendedMajor]
                                .filter(Boolean)
                                .join(' · ')}
                            </dd>
                          </div>
                        )}
                        {req.recommendationDetails.additionalInfo && (
                          <div>
                            <dt className="text-xs font-medium text-muted-foreground">Anything else</dt>
                            <dd className="text-foreground">{req.recommendationDetails.additionalInfo}</dd>
                          </div>
                        )}
                      </dl>
                    )}

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
