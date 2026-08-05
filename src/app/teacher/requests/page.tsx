'use client';

import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Card, ContentCard } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { makeUserCacheKey, readCachedData, writeCachedData } from '@/lib/client-cache';
import { getRequestStatusLabel, normalizeRequestStatus, type RequestStatus } from '@/lib/request-status';
import { parseRecommendationDetails, type RecommendationDetails } from '@/lib/recommendation-details';
import { getDeadlineMeta, DEADLINE_TONE_CLASSES } from '@/lib/deadline';
import RecommendationBragSheet from './RecommendationBragSheet';

interface StudentRequest {
  id: number;
  title: string;
  description: string;
  studentName: string;
  status: RequestStatus;
  response: string | null;
  createdAt: string;
  recommendationDetails?: RecommendationDetails;
}

interface TeacherRequestsCachePayload {
  requests: StudentRequest[];
}

const TEACHER_REQUESTS_CACHE_TTL_MS = 2 * 60 * 1000;

function mapRow(row: {
  id: number;
  title: string;
  description: string;
  student_name: string;
  status: string;
  response: string | null;
  created_at: string;
  recommendation_details?: unknown;
}): StudentRequest {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    studentName: row.student_name || 'Unknown',
    status: normalizeRequestStatus(row.status),
    response: row.response,
    createdAt: new Date(row.created_at).toLocaleDateString(),
    recommendationDetails: parseRecommendationDetails(row.recommendation_details),
  };
}

export default function TeacherRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<StudentRequest[]>([]);
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

  // Letter-workspace status per request (for the "Write this letter" button label)
  const [letterDocStatus, setLetterDocStatus] = useState<Record<number, 'drafting' | 'final'>>({});

  const cacheKey = useMemo(
    () => (user?.id ? makeUserCacheKey('teacher-requests', user.id, user.schoolId) : null),
    [user?.id, user?.schoolId]
  );

  useLayoutEffect(() => {
    setIsCacheHydrated(false);
    setHasLoadedFromServer(false);

    if (!cacheKey) {
      setRequests([]);
      setLoadError('');
      setHasWarmCache(false);
      setIsCacheHydrated(true);
      return;
    }

    const cached = readCachedData<TeacherRequestsCachePayload>(cacheKey, TEACHER_REQUESTS_CACHE_TTL_MS);
    if (cached.found && cached.data) {
      setRequests(cached.data.requests || []);
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

    writeCachedData<TeacherRequestsCachePayload>(cacheKey, { requests });
  }, [cacheKey, isCacheHydrated, hasWarmCache, hasLoadedFromServer, requests]);

  const loadRequests = useCallback(async () => {
    if (!user?.id || !user?.schoolId) return;

    const { data, error } = await supabase
      .from('requests')
      .select('id,title,description,status,category,teacher_id,student_name,student_id,school_id,response,recommendation_details,created_at')
      .eq('school_id', user.schoolId)
      .eq('teacher_id', user.id)
      .eq('category', 'recommendation')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRequests(data.map(mapRow));
      setLoadError('');
      setHasLoadedFromServer(true);
      return;
    }

    setLoadError(error?.message || 'Unable to load requests. Please refresh.');
  }, [user?.id, user?.schoolId]);

  useEffect(() => {
    if (!isCacheHydrated) return;
    void loadRequests();
  }, [isCacheHydrated, loadRequests]);

  useEffect(() => {
    if (!user?.id || requests.length === 0) return;

    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('recommendation_letter_documents')
        .select('request_id, status')
        .in('request_id', requests.map((r) => r.id));
      if (!cancelled && data) {
        setLetterDocStatus(Object.fromEntries(data.map((d) => [d.request_id, d.status])));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, requests]);

  const handleExpand = (request: StudentRequest) => {
    setSaveError('');
    if (expandedId === request.id) {
      setExpandedId(null);
      setResponseText('');
    } else {
      setExpandedId(request.id);
      setResponseText(request.response || '');
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
      .select('id,title,description,status,category,teacher_id,student_name,student_id,school_id,response,recommendation_details,created_at')
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message || 'Unable to save. Please try again.' };
    }

    const mapped = mapRow(data);
    setRequests((prev) => prev.map((r) => (r.id === id ? mapped : r)));
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Requests</h1>
        <p className="text-muted-foreground mt-1">Respond to requests students send you directly</p>
      </div>

      {loadError && (
        <Card className="p-4 border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive font-medium">{loadError}</p>
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

      <ContentCard title="Requests From Students">
        {requests.length === 0 ? (
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
            {requests.map((req) => (
              <Card key={req.id} className="p-4" hover>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-medium text-foreground">{req.title}</p>
                      <Badge variant={getStatusVariant(req.status)} size="sm">{getRequestStatusLabel(req.status)}</Badge>
                      <Badge variant="accent" size="sm">Recommendation Letter</Badge>
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
                      <div className="mt-3">
                        <RecommendationBragSheet details={req.recommendationDetails} />
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 flex-wrap">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">Write this letter on MyCounselor</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Pick an angle, get AI help section by section, and download it when it's ready — no need for Google Docs.
                        </p>
                      </div>
                      <Link href={`/teacher/requests/letter?requestId=${req.id}`}>
                        <Button size="sm" variant="outline">
                          {letterDocStatus[req.id] === 'final'
                            ? 'Letter finalized →'
                            : letterDocStatus[req.id] === 'drafting'
                            ? 'Continue writing →'
                            : 'Write this letter →'}
                        </Button>
                      </Link>
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
    </div>
  );
}
