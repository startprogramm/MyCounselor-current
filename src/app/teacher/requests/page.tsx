'use client';

import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Card, ContentCard } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { makeUserCacheKey, readCachedData, writeCachedData } from '@/lib/client-cache';
import {
  getRequestStatusLabel,
  normalizeRequestStatus,
  type RequestStatus,
} from '@/lib/request-status';
import {
  parseRecommendationDetails,
  type RecommendationDetails,
} from '@/lib/recommendation-details';
import { getDeadlineMeta, DEADLINE_TONE_CLASSES } from '@/lib/deadline';
import RecommendationBragSheet from '@/components/recommendation/RecommendationBragSheet';

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

  // Which requests need a look vs. are done, so the list can lead with what's urgent
  const [filter, setFilter] = useState<'needs_attention' | 'completed' | 'all'>('needs_attention');
  const [expandedNotesId, setExpandedNotesId] = useState<number | null>(null);

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

    const cached = readCachedData<TeacherRequestsCachePayload>(
      cacheKey,
      TEACHER_REQUESTS_CACHE_TTL_MS
    );
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
      .select(
        'id,title,description,status,category,teacher_id,student_name,student_id,school_id,response,recommendation_details,created_at'
      )
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
        .in(
          'request_id',
          requests.map((r) => r.id)
        );
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
      .select(
        'id,title,description,status,category,teacher_id,student_name,student_id,school_id,response,recommendation_details,created_at'
      )
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
      case 'pending':
        return 'warning' as const;
      case 'in_progress':
        return 'primary' as const;
      case 'completed':
        return 'success' as const;
      case 'approved':
        return 'success' as const;
      default:
        return 'secondary' as const;
    }
  };

  const isDone = (r: StudentRequest) => r.status === 'completed' || r.status === 'approved';
  const needsAttentionCount = requests.filter((r) => !isDone(r)).length;
  const completedCount = requests.filter(isDone).length;

  const urgencyRank = (r: StudentRequest) => {
    const meta = r.recommendationDetails?.deadline
      ? getDeadlineMeta(r.recommendationDetails.deadline)
      : null;
    if (!meta) return 3;
    if (meta.tone === 'overdue') return 0;
    if (meta.tone === 'soon') return 1;
    return 2;
  };

  const visibleRequests = (
    filter === 'needs_attention'
      ? requests.filter((r) => !isDone(r))
      : filter === 'completed'
        ? requests.filter(isDone)
        : requests
  )
    .slice()
    .sort((a, b) => urgencyRank(a) - urgencyRank(b));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Requests</h1>
        <p className="text-muted-foreground mt-1">
          Recommendation letters your students have asked you to write
        </p>
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

      {requests.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {[
            {
              key: 'needs_attention' as const,
              label: 'Needs Attention',
              count: needsAttentionCount,
            },
            { key: 'completed' as const, label: 'Completed', count: completedCount },
            { key: 'all' as const, label: 'All', count: requests.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filter === tab.key
                  ? 'bg-amber-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab.label}
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  filter === tab.key ? 'bg-white/20' : 'bg-background'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      <ContentCard title="Requests From Students">
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <p className="font-medium text-foreground">No requests yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              When a student asks you for a recommendation letter, it will show up here.
            </p>
          </div>
        ) : visibleRequests.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="w-10 h-10 mx-auto text-success mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-medium text-foreground">You&apos;re all caught up</p>
            <p className="text-sm text-muted-foreground mt-1">
              No letters need your attention right now.
            </p>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => setFilter('all')}>
              View all requests
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleRequests.map((req) => {
              const deadlineMeta = req.recommendationDetails?.deadline
                ? getDeadlineMeta(req.recommendationDetails.deadline)
                : null;
              const isFinalized = letterDocStatus[req.id] === 'final';
              const needsStatusNudge = isFinalized && !isDone(req);

              return (
                <Card key={req.id} className="p-4" hover>
                  {/* Who, when, and how urgent */}
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 flex-shrink-0 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-semibold text-sm">
                        {req.studentName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{req.studentName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {req.title} · Requested {req.createdAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {deadlineMeta && (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${DEADLINE_TONE_CLASSES[deadlineMeta.tone]}`}
                        >
                          <svg
                            className="w-3.5 h-3.5 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Due {deadlineMeta.formatted} · {deadlineMeta.relative}
                        </span>
                      )}
                      <Badge variant={getStatusVariant(req.status)} size="sm">
                        {getRequestStatusLabel(req.status)}
                      </Badge>
                    </div>
                  </div>

                  {req.description && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        What it&apos;s for, in their words
                      </p>
                      <p className="text-sm text-foreground">{req.description}</p>
                    </div>
                  )}

                  {req.recommendationDetails && (
                    <div className="mt-3">
                      <button
                        onClick={() =>
                          setExpandedNotesId(expandedNotesId === req.id ? null : req.id)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 transition-colors"
                      >
                        <svg
                          className={`w-3.5 h-3.5 transition-transform ${expandedNotesId === req.id ? 'rotate-90' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        {expandedNotesId === req.id ? 'Hide' : 'Read'} what{' '}
                        {req.studentName.split(' ')[0]} told you
                      </button>
                      {expandedNotesId === req.id && (
                        <div className="mt-2">
                          <RecommendationBragSheet details={req.recommendationDetails} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Primary action */}
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        Write this letter on MyCounselor
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Pick an angle, get AI help section by section, and download it when
                        it&apos;s ready.
                      </p>
                    </div>
                    <Link href={`/teacher/requests/letter?requestId=${req.id}`}>
                      <Button size="sm" variant="primary">
                        {isFinalized
                          ? 'Letter finalized →'
                          : letterDocStatus[req.id] === 'drafting'
                            ? 'Continue writing →'
                            : 'Write this letter →'}
                      </Button>
                    </Link>
                  </div>

                  {needsStatusNudge && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-success">
                      <svg
                        className="w-3.5 h-3.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        Letter&apos;s done — mark this request completed so it drops off your list.
                      </span>
                    </div>
                  )}

                  {req.response && expandedId !== req.id && (
                    <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Your note to the student:
                      </p>
                      <p className="text-sm text-foreground line-clamp-2">{req.response}</p>
                    </div>
                  )}

                  {expandedId === req.id && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Send a quick note to the student
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
                          Save Note
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleExpand(req)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border">
                    {expandedId !== req.id && (
                      <button
                        onClick={() => handleExpand(req)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
                      >
                        {req.response
                          ? 'Edit your note to the student'
                          : 'Add a note for the student'}
                      </button>
                    )}
                    {req.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(req.id, 'in_progress')}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
                      >
                        Mark in progress
                      </button>
                    )}
                    {!isDone(req) && req.status !== 'pending' && (
                      <button
                        onClick={() => handleStatusChange(req.id, 'completed')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          needsStatusNudge
                            ? 'bg-success/10 text-success hover:bg-success/15'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        }`}
                      >
                        Mark completed
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </ContentCard>
    </div>
  );
}
