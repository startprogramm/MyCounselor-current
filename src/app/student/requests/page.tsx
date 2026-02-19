'use client';

import React, { useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef } from 'react';
import { ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input, { Textarea, Select } from '@/components/ui/Input';
import { useAuth, User } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { startVisibilityAwarePolling } from '@/lib/polling';
import { parseRequestDocuments, type RequestDocument } from '@/lib/request-documents';
import { makeUserCacheKey, readCachedData, writeCachedData } from '@/lib/client-cache';
import {
  getRequestStatusLabel,
  normalizeRequestStatus,
  type RequestStatus,
} from '@/lib/request-status';

interface CounselingRequest {
  id: number;
  title: string;
  description: string;
  status: RequestStatus;
  createdAt: string;
  counselor: string;
  category: string;
  studentName?: string;
  studentId?: string;
  response?: string;
  documents?: RequestDocument[];
}

interface StudentRequestsCachePayload {
  requests: CounselingRequest[];
  schoolCounselors: User[];
}

const STUDENT_REQUESTS_CACHE_TTL_MS = 3 * 60 * 1000;

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

function formatCreatedAt(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function mapRequest(row: {
  id: number;
  title: string;
  description: string;
  status: string;
  created_at: string;
  counselor_name: string;
  category: string;
  student_name: string;
  student_id: string;
  response: string | null;
  documents: unknown;
}): CounselingRequest {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: normalizeRequestStatus(row.status),
    createdAt: formatCreatedAt(row.created_at),
    counselor: row.counselor_name,
    category: row.category,
    studentName: row.student_name,
    studentId: row.student_id,
    response: row.response || undefined,
    documents: parseRequestDocuments(row.documents),
  };
}

function mapProfileToUser(profile: ProfileRow): User {
  return {
    id: profile.id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    role: profile.role,
    schoolId: profile.school_id,
    schoolName: profile.school_name || undefined,
    gradeLevel: profile.grade_level || undefined,
    title: profile.title || undefined,
    department: profile.department || undefined,
    profileImage: profile.profile_image || undefined,
    approved: profile.approved,
    subject: profile.subject || undefined,
    childrenNames: profile.children_names || undefined,
    relationship: profile.relationship || undefined,
  };
}

export default function StudentRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<CounselingRequest[]>([]);
  const [schoolCounselors, setSchoolCounselors] = useState<User[]>([]);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [filter, setFilter] = useState<'all' | RequestStatus>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [loadRequestsError, setLoadRequestsError] = useState('');
  const [hasWarmCache, setHasWarmCache] = useState(false);
  const [isCacheHydrated, setIsCacheHydrated] = useState(false);
  const [hasLoadedFromServer, setHasLoadedFromServer] = useState(false);
  const loadRequestIdRef = useRef(0);
  const requestsRef = useRef<CounselingRequest[]>([]);
  const emptyFetchStreakRef = useRef(0);
  const hasWarmCacheRef = useRef(false);
  const cacheKey = useMemo(
    () => (user?.id ? makeUserCacheKey('student-requests', user.id, user.schoolId) : null),
    [user?.id, user?.schoolId]
  );
  // Refs so we can access latest values inside loadRequests without adding
  // them as dependencies (which would restart polling on every data change).
  const cacheKeyRef = useRef<string | null>(null);
  const schoolCounselorsRef = useRef<User[]>([]);

  useEffect(() => {
    requestsRef.current = requests;
  }, [requests]);

  useEffect(() => {
    hasWarmCacheRef.current = hasWarmCache;
  }, [hasWarmCache]);

  useEffect(() => {
    cacheKeyRef.current = cacheKey;
  }, [cacheKey]);

  useEffect(() => {
    schoolCounselorsRef.current = schoolCounselors;
  }, [schoolCounselors]);

  useLayoutEffect(() => {
    setIsCacheHydrated(false);
    setHasLoadedFromServer(false);

    if (!cacheKey) {
      setRequests([]);
      setSchoolCounselors([]);
      setHasWarmCache(false);
      setIsCacheHydrated(true);
      return;
    }

    const cached = readCachedData<StudentRequestsCachePayload>(
      cacheKey,
      STUDENT_REQUESTS_CACHE_TTL_MS
    );

    if (cached.found && cached.data) {
      setRequests(cached.data.requests || []);
      setSchoolCounselors(cached.data.schoolCounselors || []);
      setIsLoadingRequests(false);
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

    writeCachedData<StudentRequestsCachePayload>(cacheKey, {
      requests,
      schoolCounselors,
    });
  }, [cacheKey, requests, schoolCounselors, isCacheHydrated, hasWarmCache, hasLoadedFromServer]);

  const loadRequests = useCallback(async () => {
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;

    if (!user?.id) {
      if (loadRequestIdRef.current === requestId) {
        setRequests([]);
        setLoadRequestsError('');
      }
      return;
    }

    const fetchRows = async () =>
      supabase
        .from('requests')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

    const { data, error } = await fetchRows();

    if (loadRequestIdRef.current !== requestId) return;

    if (error || !data) {
      setLoadRequestsError(error?.message || 'Unable to load your requests. Please retry.');
      return;
    }

    let mappedRequests = data.map(mapRequest);

    // Guard against transient empty results during auth/session refresh.
    if (mappedRequests.length === 0 && requestsRef.current.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 450));
      const { data: retryData, error: retryError } = await fetchRows();

      if (loadRequestIdRef.current !== requestId) return;

      if (!retryError && retryData) {
        mappedRequests = retryData.map(mapRequest);
      }
    }

    if (mappedRequests.length === 0 && requestsRef.current.length > 0) {
      emptyFetchStreakRef.current += 1;
      if (emptyFetchStreakRef.current < 2) {
        setLoadRequestsError('');
        setHasLoadedFromServer(true);
        return;
      }
    } else {
      emptyFetchStreakRef.current = 0;
    }

    // Write cache immediately (synchronous localStorage write) so it is
    // available on the very next page navigation, even if the component
    // unmounts before the writeCachedData effect has a chance to fire.
    if (cacheKeyRef.current) {
      writeCachedData<StudentRequestsCachePayload>(cacheKeyRef.current, {
        requests: mappedRequests,
        schoolCounselors: schoolCounselorsRef.current,
      });
    }

    setLoadRequestsError('');
    setHasLoadedFromServer(true);
    setRequests(mappedRequests);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setRequests([]);
      setIsLoadingRequests(false);
      return;
    }

    // Wait until we know whether there is cached data before starting the
    // network fetch.  This prevents Effect from double-firing: once with the
    // stale hasWarmCache=false value and again after cache hydration sets it
    // to true, which previously triggered two Supabase queries and briefly
    // showed the loading spinner even when cached data was available.
    if (!isCacheHydrated) return;

    // Read via ref so this effect doesn't re-run just because hasWarmCache
    // changed (which would start a second fetch and reset the polling timer).
    setIsLoadingRequests(!hasWarmCacheRef.current);
    void loadRequests().finally(() => setIsLoadingRequests(false));
    return startVisibilityAwarePolling(() => loadRequests(), 15000);
  }, [user?.id, loadRequests, isCacheHydrated]);

  // Load school counselors directly from DB
  useEffect(() => {
    if (!user?.schoolId) {
      setSchoolCounselors([]);
      return;
    }

    const loadCounselors = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('school_id', user.schoolId)
        .eq('role', 'counselor');

      if (error || !data) {
        setSchoolCounselors([]);
        return;
      }

      setSchoolCounselors(data.map(mapProfileToUser));
    };

    loadCounselors();
  }, [user?.schoolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError('');

    const errors: Record<string, string> = {};
    if (!newTitle.trim()) errors.title = 'Title is required';
    if (!newCategory) errors.category = 'Category is required';
    if (!newDescription.trim()) errors.description = 'Description is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!user) return;

    setIsSubmitting(true);

    const availableCounselors = schoolCounselors.filter((c) => c.approved === true);
    const counselorPool = availableCounselors.length > 0 ? availableCounselors : schoolCounselors;
    const assignedCounselor =
      counselorPool.length > 0
        ? counselorPool[Math.floor(Math.random() * counselorPool.length)]
        : null;

    const { data, error } = await supabase
      .from('requests')
      .insert({
        title: newTitle.trim(),
        description: newDescription.trim(),
        status: 'pending',
        category: newCategory,
        counselor_name: assignedCounselor
          ? `${assignedCounselor.firstName} ${assignedCounselor.lastName}`
          : 'Unassigned',
        counselor_id: assignedCounselor?.id || null,
        student_name: `${user.firstName} ${user.lastName}`,
        student_id: user.id,
        school_id: user.schoolId,
      })
      .select('*')
      .single();

    if (error || !data) {
      setSubmitError(error?.message || 'Unable to submit request. Please try again.');
      setIsSubmitting(false);
      return;
    }

    setHasLoadedFromServer(true);
    setRequests((prev) => [mapRequest(data), ...prev]);

    // Reset form
    setNewTitle('');
    setNewCategory('');
    setNewDescription('');
    setFormErrors({});
    setShowNewRequest(false);
    setSuccessMessage(
      assignedCounselor
        ? 'Request submitted successfully! Your counselor will review it shortly.'
        : 'Request submitted successfully! A counselor will be assigned soon.'
    );
    setTimeout(() => setSuccessMessage(''), 4000);
    setIsSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('requests')
      .delete()
      .eq('id', id)
      .eq('student_id', user.id);

    if (error) return;
    setHasLoadedFromServer(true);
    setRequests((prev) => prev.filter((request) => request.id !== id));
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'in_progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'approved': return 'bg-success/10 text-success border-success/20';
      case 'completed': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'college':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'academic':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'career':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'personal':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter);
  const hasAnyRequests = requests.length > 0;

  // Show loading whenever data isn't ready yet:
  // 1. Cache not checked yet (first render gap)
  // 2. Actively fetching with no data to show
  // 3. Cache miss: cache checked, no warm data, server hasn't responded yet
  //    (covers the gap between isCacheHydrated becoming true and the load
  //    effect setting isLoadingRequests=true - without this a brief "No
  //    requests found" flash appeared even when data was on its way)
  const showLoadingState =
    (!isCacheHydrated && !!user?.id) ||
    (isLoadingRequests && requests.length === 0) ||
    (isCacheHydrated && !hasWarmCache && !hasLoadedFromServer && !!user?.id);

  const filterCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    in_progress: requests.filter(r => r.status === 'in_progress').length,
    approved: requests.filter(r => r.status === 'approved').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
            My Requests
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and track your counseling requests
          </p>
        </div>
        <Button onClick={() => { setShowNewRequest(true); setSuccessMessage(''); }}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Request
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-lg">
          <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm text-success font-medium">{successMessage}</p>
          <button onClick={() => setSuccessMessage('')} className="ml-auto text-success hover:text-success/80">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {submitError && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <svg className="w-5 h-5 text-destructive flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-2.5L13.73 4.5c-.77-.83-2.69-.83-3.46 0L3.34 16.5c-.77.83.19 2.5 1.73 2.5z" />
          </svg>
          <p className="text-sm text-destructive font-medium">{submitError}</p>
          <button onClick={() => setSubmitError('')} className="ml-auto text-destructive hover:text-destructive/80">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {loadRequestsError && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <svg className="w-5 h-5 text-destructive flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-2.5L13.73 4.5c-.77-.83-2.69-.83-3.46 0L3.34 16.5c-.77.83.19 2.5 1.73 2.5z" />
          </svg>
          <p className="text-sm text-destructive font-medium">{loadRequestsError}</p>
          <Button size="sm" variant="outline" className="ml-auto" onClick={() => void loadRequests()}>
            Retry
          </Button>
        </div>
      )}

      {/* New Request Form */}
      {showNewRequest && (
        <ContentCard title="Create New Request">
          <form onSubmit={handleSubmit} className="space-y-4">
            {schoolCounselors.length === 0 && (
              <div className="p-3 rounded-lg border border-warning/30 bg-warning/10 text-sm text-warning">
                No counselors registered yet. Your request will be saved and marked as unassigned.
              </div>
            )}
            <Input
              label="Request Title"
              placeholder="Brief description of your request"
              value={newTitle}
              onChange={(e) => { setNewTitle(e.target.value); setFormErrors(prev => ({ ...prev, title: '' })); }}
              error={formErrors.title}
            />
            <Select
              label="Category"
              value={newCategory}
              onChange={(e) => { setNewCategory(e.target.value); setFormErrors(prev => ({ ...prev, category: '' })); }}
              error={formErrors.category}
              options={[
                { value: '', label: 'Select a category' },
                { value: 'academic', label: 'Academic Support' },
                { value: 'college', label: 'College Planning' },
                { value: 'career', label: 'Career Guidance' },
                { value: 'personal', label: 'Personal Support' },
                { value: 'other', label: 'Other' },
              ]}
            />
            <Textarea
              label="Description"
              placeholder="Provide details about your request..."
              value={newDescription}
              onChange={(e) => { setNewDescription(e.target.value); setFormErrors(prev => ({ ...prev, description: '' })); }}
              error={formErrors.description}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => {
                setShowNewRequest(false);
                setNewTitle('');
                setNewCategory('');
                setNewDescription('');
                setFormErrors({});
                setSubmitError('');
              }}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>Submit Request</Button>
            </div>
          </form>
        </ContentCard>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'in_progress', 'approved', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {status === 'all' ? 'All Requests' : getRequestStatusLabel(status)}
            <span className="ml-1.5 opacity-70">({filterCounts[status]})</span>
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {showLoadingState && (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">Loading requests...</p>
          </div>
        )}

        {filteredRequests.length === 0 && !showLoadingState ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <svg className="w-12 h-12 mx-auto text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {filter === 'all' ? (
              <>
                <p className="text-muted-foreground">No requests found</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowNewRequest(true)}>
                  Create your first request
                </Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">
                  No {getRequestStatusLabel(filter).toLowerCase()} requests right now
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setFilter('all')}>
                    Show all requests
                  </Button>
                  {!hasAnyRequests && (
                    <Button variant="outline" size="sm" onClick={() => setShowNewRequest(true)}>
                      Create request
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        ) : !showLoadingState ? (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-card rounded-xl border border-border p-5 hover:border-primary/20 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                  {getCategoryIcon(request.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{request.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(request.status)}`}>
                      {getRequestStatusLabel(request.status)}
                    </span>
                  </div>
                  {/* Counselor Response */}
                  {request.response && (
                    <div className="mt-3 p-3 bg-primary/5 border border-primary/10 rounded-lg">
                      <p className="text-xs font-medium text-primary mb-1">Counselor Response:</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{request.response}</p>
                    </div>
                  )}

                  {/* Attached Documents */}
                  {request.documents && request.documents.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Attached Documents:</p>
                      {request.documents.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc.data}
                          download={doc.name}
                          className="flex items-center gap-3 p-2.5 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                        >
                          <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.uploadedAt}</p>
                          </div>
                          <span className="text-xs text-primary font-medium">Download</span>
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {request.counselor}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {request.createdAt}
                      </span>
                    </div>
                    {request.status === 'pending' && (
                      <button
                        onClick={() => handleDelete(request.id)}
                        className="text-xs text-destructive hover:text-destructive/80 font-medium"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : null}
      </div>
    </div>
  );
}
