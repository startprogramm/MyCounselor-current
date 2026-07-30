'use client';

import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input, { Textarea, Select } from '@/components/ui/Input';
import { useAuth, User } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { startVisibilityAwarePolling } from '@/lib/polling';
import { parseRequestDocuments, type RequestDocument } from '@/lib/request-documents';
import {
  getRequestStatusLabel,
  normalizeRequestStatus,
  type RequestStatus,
} from '@/lib/request-status';
import {
  EMPTY_RECOMMENDATION_DETAILS,
  MAX_RECOMMENDATION_ATTRIBUTES,
  RECOMMENDATION_ATTRIBUTES,
  parseRecommendationDetails,
  type RecommendationDetails,
} from '@/lib/recommendation-details';

// ─── Types ────────────────────────────────────────────────────────────────────

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
  teacherId?: string;
  teacherName?: string;
  recommendationDetails?: RecommendationDetails;
}

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

// ─── localStorage helpers ─────────────────────────────────────────────────────

function cacheKey(userId: string) {
  return `mycounselor_requests_${userId}`;
}

interface RequestsCachePayload {
  requests: CounselingRequest[];
  counselors: User[];
  teachers: User[];
}

function readCache(userId: string): RequestsCachePayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(cacheKey(userId));
    return raw ? (JSON.parse(raw) as RequestsCachePayload) : null;
  } catch {
    return null;
  }
}

function writeCache(userId: string, requests: CounselingRequest[], counselors: User[], teachers: User[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify({ requests, counselors, teachers }));
  } catch {
    // ignore quota errors
  }
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

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
  teacher_id?: string | null;
  teacher_name?: string | null;
  recommendation_details?: unknown;
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
    teacherId: row.teacher_id || undefined,
    teacherName: row.teacher_name || undefined,
    recommendationDetails: parseRecommendationDetails(row.recommendation_details),
  };
}

const RECOMMENDATION_CATEGORY = 'recommendation';

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

// ─── Page component ───────────────────────────────────────────────────────────

export default function StudentRequestsPage() {
  const { user } = useAuth();

  // Data
  const [requests, setRequests] = useState<CounselingRequest[]>([]);
  const [schoolCounselors, setSchoolCounselors] = useState<User[]>([]);
  const [schoolTeachers, setSchoolTeachers] = useState<User[]>([]);
  const [profileDefaults, setProfileDefaults] = useState<{ targetColleges: string; intendedMajor: string } | null>(null);

  // Loading / error
  const [initialized, setInitialized] = useState(false); // true after localStorage check
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // Form
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [filter, setFilter] = useState<'all' | RequestStatus>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTeacherId, setNewTeacherId] = useState('');
  const [recDetails, setRecDetails] = useState<RecommendationDetails>(EMPTY_RECOMMENDATION_DETAILS);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateRecField = <K extends keyof RecommendationDetails>(
    field: K,
    value: RecommendationDetails[K]
  ) => {
    setRecDetails((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const toggleRecAttribute = (attribute: string) => {
    setRecDetails((prev) => {
      const already = prev.attributes.includes(attribute);
      if (already) {
        return { ...prev, attributes: prev.attributes.filter((a) => a !== attribute) };
      }
      if (prev.attributes.length >= MAX_RECOMMENDATION_ATTRIBUTES) return prev;
      return { ...prev, attributes: [...prev.attributes, attribute] };
    });
  };

  // Stale-response guard
  const fetchIdRef = useRef(0);

  // ── Step 1: Read from localStorage before first paint ──────────────────────
  useLayoutEffect(() => {
    if (!user?.id) return; // layout already shows spinner until user is ready

    const cached = readCache(user.id);
    if (cached) {
      setRequests(cached.requests || []);
      setSchoolCounselors(cached.counselors || []);
      setSchoolTeachers(cached.teachers || []);
    }
    setInitialized(true);
  }, [user?.id]);

  // ── Step 2: Fetch from Supabase (requests + counselors + teachers in parallel) ──
  const fetchData = useCallback(async () => {
    if (!user?.id || !user?.schoolId) return;

    const fetchId = ++fetchIdRef.current;

    const [
      { data: requestData, error: requestError },
      { data: counselorData },
      { data: teacherData },
      { data: profileData },
    ] = await Promise.all([
      supabase
        .from('requests')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('*')
        .eq('school_id', user.schoolId)
        .eq('role', 'counselor'),
      supabase
        .from('profiles')
        .select('*')
        .eq('school_id', user.schoolId)
        .eq('role', 'teacher'),
      supabase
        .from('student_academic_profiles')
        .select('college_list, intended_major')
        .eq('student_id', user.id)
        .maybeSingle(),
    ]);

    if (fetchIdRef.current !== fetchId) return; // stale, another fetch started

    if (requestError) {
      setFetchError(requestError.message || 'Unable to load requests. Please retry.');
      return;
    }

    const mappedRequests = (requestData || []).map(mapRequest);
    const mappedCounselors = (counselorData || []).map(mapProfileToUser);
    const mappedTeachers = (teacherData || []).map(mapProfileToUser);

    if (profileData) {
      const collegeList = Array.isArray(profileData.college_list)
        ? (profileData.college_list as Array<{ name?: string }>)
        : [];
      setProfileDefaults({
        targetColleges: collegeList.map((c) => c.name).filter(Boolean).join(', '),
        intendedMajor: profileData.intended_major || '',
      });
    }

    // Write to localStorage synchronously right here — never miss this write
    writeCache(user.id, mappedRequests, mappedCounselors, mappedTeachers);

    setFetchError('');
    setRequests(mappedRequests);
    setSchoolCounselors(mappedCounselors);
    setSchoolTeachers(mappedTeachers);
  }, [user?.id, user?.schoolId]);

  // ── Step 3: Kick off fetch once initialized, then poll every 30 s ──────────
  useEffect(() => {
    if (!initialized || !user?.id) return;

    setIsFetching(true);
    void fetchData().finally(() => setIsFetching(false));

    return startVisibilityAwarePolling(() => fetchData(), 30_000);
  }, [initialized, user?.id, fetchData]);

  // ── Loading state: only show spinner if we have zero data AND fetching ──────
  const showLoading = !initialized || (isFetching && requests.length === 0);

  // Prefill target colleges / intended major from the student's own Academic
  // Profile the first time they open a recommendation letter request, so they
  // don't have to type the same thing twice.
  useEffect(() => {
    if (newCategory !== RECOMMENDATION_CATEGORY || !profileDefaults) return;
    setRecDetails((prev) => ({
      ...prev,
      targetColleges: prev.targetColleges || profileDefaults.targetColleges,
      intendedMajor: prev.intendedMajor || profileDefaults.intendedMajor,
    }));
  }, [newCategory, profileDefaults]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError('');

    const isRecommendation = newCategory === RECOMMENDATION_CATEGORY;

    const errors: Record<string, string> = {};
    if (!newTitle.trim()) errors.title = 'Title is required';
    if (!newCategory) errors.category = 'Category is required';
    if (!newDescription.trim()) errors.description = 'Description is required';
    if (isRecommendation) {
      if (!newTeacherId) errors.teacher = 'Please select a teacher';
      if (!recDetails.courses.trim()) errors.courses = 'Let them know which class(es) they had you in';
      if (!recDetails.reasonForChoosing.trim()) errors.reasonForChoosing = 'This helps them understand why you asked them';
      if (!recDetails.deadline) errors.deadline = 'Deadline is required';
      if (!recDetails.adjectives.some((a) => a.trim())) errors.adjectives = 'Give at least one word';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!user) return;
    setIsSubmitting(true);

    let assignedCounselor: User | null = null;
    let assignedTeacher: User | null = null;

    if (isRecommendation) {
      assignedTeacher = schoolTeachers.find((t) => t.id === newTeacherId) || null;
    } else {
      const availableCounselors = schoolCounselors.filter((c) => c.approved === true);
      const counselorPool = availableCounselors.length > 0 ? availableCounselors : schoolCounselors;
      assignedCounselor =
        counselorPool.length > 0
          ? counselorPool[Math.floor(Math.random() * counselorPool.length)]
          : null;
    }

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
        teacher_id: assignedTeacher?.id || null,
        teacher_name: assignedTeacher ? `${assignedTeacher.firstName} ${assignedTeacher.lastName}` : null,
        student_name: `${user.firstName} ${user.lastName}`,
        student_id: user.id,
        school_id: user.schoolId,
        recommendation_details: isRecommendation
          ? {
              ...recDetails,
              adjectives: recDetails.adjectives.filter((a) => a.trim()),
            }
          : null,
      })
      .select('*')
      .single();

    if (error || !data) {
      setSubmitError(error?.message || 'Unable to submit request. Please try again.');
      setIsSubmitting(false);
      return;
    }

    const newRequest = mapRequest(data);
    const updated = [newRequest, ...requests];
    setRequests(updated);
    writeCache(user.id, updated, schoolCounselors, schoolTeachers);

    setNewTitle('');
    setNewCategory('');
    setNewDescription('');
    setNewTeacherId('');
    setRecDetails(EMPTY_RECOMMENDATION_DETAILS);
    setFormErrors({});
    setShowNewRequest(false);
    setSuccessMessage(
      isRecommendation
        ? `Request sent to ${assignedTeacher ? assignedTeacher.firstName + ' ' + assignedTeacher.lastName : 'your teacher'}!`
        : assignedCounselor
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

    const updated = requests.filter((r) => r.id !== id);
    setRequests(updated);
    writeCache(user.id, updated, schoolCounselors, schoolTeachers);
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const filteredRequests =
    filter === 'all' ? requests : requests.filter((r) => r.status === filter);
  const hasAnyRequests = requests.length > 0;

  const filterCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    in_progress: requests.filter((r) => r.status === 'in_progress').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    completed: requests.filter((r) => r.status === 'completed').length,
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

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
      case RECOMMENDATION_CATEGORY:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7zM17 7a4 4 0 013.87 5.06M20 21h1a2 2 0 002-2 7 7 0 00-4-6.33" />
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

  // ── Render ────────────────────────────────────────────────────────────────

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

      {fetchError && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <svg className="w-5 h-5 text-destructive flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-2.5L13.73 4.5c-.77-.83-2.69-.83-3.46 0L3.34 16.5c-.77.83.19 2.5 1.73 2.5z" />
          </svg>
          <p className="text-sm text-destructive font-medium">{fetchError}</p>
          <Button size="sm" variant="outline" className="ml-auto" onClick={() => void fetchData()}>
            Retry
          </Button>
        </div>
      )}

      {/* New Request Form */}
      {showNewRequest && (
        <ContentCard title="Create New Request">
          <form onSubmit={handleSubmit} className="space-y-4">
            {newCategory !== RECOMMENDATION_CATEGORY && schoolCounselors.length === 0 && (
              <div className="p-3 rounded-lg border border-warning/30 bg-warning/10 text-sm text-warning">
                No counselors registered yet. Your request will be saved and marked as unassigned.
              </div>
            )}
            {newCategory === RECOMMENDATION_CATEGORY && schoolTeachers.length === 0 && (
              <div className="p-3 rounded-lg border border-warning/30 bg-warning/10 text-sm text-warning">
                No teachers are registered at your school yet, so there&apos;s no one to select.
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
              onChange={(e) => {
                setNewCategory(e.target.value);
                setFormErrors(prev => ({ ...prev, category: '', teacher: '' }));
                if (e.target.value !== RECOMMENDATION_CATEGORY) setNewTeacherId('');
              }}
              error={formErrors.category}
              options={[
                { value: '', label: 'Select a category' },
                { value: RECOMMENDATION_CATEGORY, label: 'Recommendation Letter' },
                { value: 'academic', label: 'Academic Support' },
                { value: 'college', label: 'College Planning' },
                { value: 'career', label: 'Career Guidance' },
                { value: 'personal', label: 'Personal Support' },
                { value: 'other', label: 'Other' },
              ]}
            />
            {newCategory === RECOMMENDATION_CATEGORY && (
              <Select
                label="Teacher"
                value={newTeacherId}
                onChange={(e) => { setNewTeacherId(e.target.value); setFormErrors(prev => ({ ...prev, teacher: '' })); }}
                error={formErrors.teacher}
                options={[
                  { value: '', label: 'Select a teacher' },
                  ...schoolTeachers.map((t) => ({
                    value: t.id,
                    label: `${t.firstName} ${t.lastName}${t.subject ? ` — ${t.subject}` : ''}`,
                  })),
                ]}
              />
            )}
            <Textarea
              label="Description"
              placeholder={
                newCategory === RECOMMENDATION_CATEGORY
                  ? 'In one or two sentences, what is this letter for?'
                  : 'Provide details about your request...'
              }
              value={newDescription}
              onChange={(e) => { setNewDescription(e.target.value); setFormErrors(prev => ({ ...prev, description: '' })); }}
              error={formErrors.description}
            />

            {newCategory === RECOMMENDATION_CATEGORY && (
              <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Help them write a great letter</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    The more specific detail you give, the more personal and effective the letter will be. Based
                    on the questions counselors and teachers actually use to write strong recommendations.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Course(s) you took with them"
                    placeholder="e.g. AP Biology (Grade 11), Chemistry (Grade 10)"
                    value={recDetails.courses}
                    onChange={(e) => updateRecField('courses', e.target.value)}
                    error={formErrors.courses}
                  />
                  <Input
                    label="Deadline"
                    type="date"
                    value={recDetails.deadline}
                    onChange={(e) => updateRecField('deadline', e.target.value)}
                    error={formErrors.deadline}
                  />
                </div>

                <Textarea
                  label="Why did you choose this teacher?"
                  placeholder="What makes them the right person to speak to who you are?"
                  value={recDetails.reasonForChoosing}
                  onChange={(e) => updateRecField('reasonForChoosing', e.target.value)}
                  error={formErrors.reasonForChoosing}
                />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Three words that describe you
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((i) => (
                      <Input
                        key={i}
                        placeholder={`Word ${i + 1}`}
                        value={recDetails.adjectives[i] || ''}
                        onChange={(e) => {
                          const next = [...recDetails.adjectives];
                          next[i] = e.target.value;
                          updateRecField('adjectives', next);
                        }}
                      />
                    ))}
                  </div>
                  {formErrors.adjectives && (
                    <p className="text-xs text-destructive mt-1">{formErrors.adjectives}</p>
                  )}
                </div>

                <Textarea
                  label="A project or piece of work in their class you're proud of"
                  placeholder="What did you make or write, and why does it matter to you?"
                  value={recDetails.proudProject}
                  onChange={(e) => updateRecField('proudProject', e.target.value)}
                />

                <Textarea
                  label="A lesson or discussion in their class you enjoyed (optional)"
                  value={recDetails.favoriteLesson}
                  onChange={(e) => updateRecField('favoriteLesson', e.target.value)}
                />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Pick up to {MAX_RECOMMENDATION_ATTRIBUTES} qualities colleges look for, and tell a specific story about them
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                    {RECOMMENDATION_ATTRIBUTES.map((attribute) => {
                      const checked = recDetails.attributes.includes(attribute);
                      const disabled = !checked && recDetails.attributes.length >= MAX_RECOMMENDATION_ATTRIBUTES;
                      return (
                        <label
                          key={attribute}
                          className={`flex items-center gap-2 text-xs px-2.5 py-2 rounded-lg border cursor-pointer transition-colors ${
                            checked
                              ? 'border-primary bg-primary/10 text-primary'
                              : disabled
                              ? 'border-border text-muted-foreground/50 cursor-not-allowed'
                              : 'border-border text-foreground hover:bg-muted/40'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="accent-primary"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => toggleRecAttribute(attribute)}
                          />
                          {attribute}
                        </label>
                      );
                    })}
                  </div>
                  <Textarea
                    placeholder="Describe a specific moment that shows this — a real story is far more convincing than a general claim."
                    value={recDetails.attributeStory}
                    onChange={(e) => updateRecField('attributeStory', e.target.value)}
                  />
                </div>

                <Textarea
                  label="Something they might not know about you (optional)"
                  value={recDetails.somethingTheyDontKnow}
                  onChange={(e) => updateRecField('somethingTheyDontKnow', e.target.value)}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Colleges / programs this is for"
                    placeholder="e.g. MIT, Stanford, Oxford"
                    value={recDetails.targetColleges}
                    onChange={(e) => updateRecField('targetColleges', e.target.value)}
                  />
                  <Input
                    label="Intended major or field"
                    value={recDetails.intendedMajor}
                    onChange={(e) => updateRecField('intendedMajor', e.target.value)}
                  />
                </div>

                <Textarea
                  label="Anything else they should know? (optional)"
                  value={recDetails.additionalInfo}
                  onChange={(e) => updateRecField('additionalInfo', e.target.value)}
                />
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => {
                setShowNewRequest(false);
                setNewTitle('');
                setNewCategory('');
                setNewDescription('');
                setNewTeacherId('');
                setRecDetails(EMPTY_RECOMMENDATION_DETAILS);
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
        {showLoading && (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">Loading requests...</p>
          </div>
        )}

        {!showLoading && filteredRequests.length === 0 ? (
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
        ) : !showLoading ? (
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

                  {/* Response */}
                  {request.response && (
                    <div className="mt-3 p-3 bg-primary/5 border border-primary/10 rounded-lg">
                      <p className="text-xs font-medium text-primary mb-1">
                        {request.teacherName ? 'Teacher Response:' : 'Counselor Response:'}
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{request.response}</p>
                    </div>
                  )}

                  {/* Recommendation letter details the student shared */}
                  {request.recommendationDetails && (
                    <details className="mt-3 group">
                      <summary className="text-xs font-medium text-primary cursor-pointer select-none">
                        View what you shared with {request.teacherName || 'them'}
                      </summary>
                      <dl className="mt-2 space-y-2 p-3 bg-muted/20 border border-border rounded-lg text-sm">
                        {request.recommendationDetails.courses && (
                          <div>
                            <dt className="text-xs font-medium text-muted-foreground">Course(s)</dt>
                            <dd className="text-foreground">{request.recommendationDetails.courses}</dd>
                          </div>
                        )}
                        {request.recommendationDetails.deadline && (
                          <div>
                            <dt className="text-xs font-medium text-muted-foreground">Deadline</dt>
                            <dd className="text-foreground">{request.recommendationDetails.deadline}</dd>
                          </div>
                        )}
                        {request.recommendationDetails.reasonForChoosing && (
                          <div>
                            <dt className="text-xs font-medium text-muted-foreground">Why this teacher</dt>
                            <dd className="text-foreground">{request.recommendationDetails.reasonForChoosing}</dd>
                          </div>
                        )}
                        {request.recommendationDetails.adjectives.length > 0 && (
                          <div>
                            <dt className="text-xs font-medium text-muted-foreground">Three words</dt>
                            <dd className="text-foreground">{request.recommendationDetails.adjectives.join(', ')}</dd>
                          </div>
                        )}
                        {request.recommendationDetails.proudProject && (
                          <div>
                            <dt className="text-xs font-medium text-muted-foreground">Proud project</dt>
                            <dd className="text-foreground">{request.recommendationDetails.proudProject}</dd>
                          </div>
                        )}
                        {request.recommendationDetails.favoriteLesson && (
                          <div>
                            <dt className="text-xs font-medium text-muted-foreground">Favorite lesson</dt>
                            <dd className="text-foreground">{request.recommendationDetails.favoriteLesson}</dd>
                          </div>
                        )}
                        {request.recommendationDetails.attributes.length > 0 && (
                          <div>
                            <dt className="text-xs font-medium text-muted-foreground">
                              Qualities: {request.recommendationDetails.attributes.join(', ')}
                            </dt>
                            <dd className="text-foreground">{request.recommendationDetails.attributeStory}</dd>
                          </div>
                        )}
                        {request.recommendationDetails.somethingTheyDontKnow && (
                          <div>
                            <dt className="text-xs font-medium text-muted-foreground">They might not know</dt>
                            <dd className="text-foreground">{request.recommendationDetails.somethingTheyDontKnow}</dd>
                          </div>
                        )}
                        {(request.recommendationDetails.targetColleges || request.recommendationDetails.intendedMajor) && (
                          <div>
                            <dt className="text-xs font-medium text-muted-foreground">Applying to</dt>
                            <dd className="text-foreground">
                              {[request.recommendationDetails.targetColleges, request.recommendationDetails.intendedMajor]
                                .filter(Boolean)
                                .join(' · ')}
                            </dd>
                          </div>
                        )}
                        {request.recommendationDetails.additionalInfo && (
                          <div>
                            <dt className="text-xs font-medium text-muted-foreground">Additional info</dt>
                            <dd className="text-foreground">{request.recommendationDetails.additionalInfo}</dd>
                          </div>
                        )}
                      </dl>
                    </details>
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
                        {request.teacherName ? `${request.teacherName} (Teacher)` : request.counselor}
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
