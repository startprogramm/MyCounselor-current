'use client';

import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Card, StatsCard, ContentCard } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth, User } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { startVisibilityAwarePolling } from '@/lib/polling';
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
}

interface Meeting {
  id: number;
  title: string;
  counselor: string;
  date: string;
  time: string;
  type: string;
  status: string;
}

interface Conversation {
  id: number;
  counselor: string;
  unread: number;
  messages: { id: number }[];
}

interface Goal {
  id: number;
  title: string;
  progress: number;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}

interface GuidanceResourceSummary {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  createdAt: string;
}

interface StudentDashboardCachePayload {
  requests: CounselingRequest[];
  meetings: Meeting[];
  conversations: Conversation[];
  goals: Goal[];
  guidanceResources: GuidanceResourceSummary[];
  counselors: User[];
  teachers: User[];
  parents: User[];
  pendingParents: PendingParent[];
}

const STUDENT_DASHBOARD_CACHE_TTL_MS = 2 * 60 * 1000;

function buildConversationKey(studentId: string, counselorId: string) {
  return [studentId, counselorId].sort().join('__');
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatGuidanceType(value: string) {
  if (!value) return 'Guide';
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getGuidanceCategoryLabel(category: string) {
  switch (category) {
    case 'college':
      return 'College Prep';
    case 'career':
      return 'Career Planning';
    case 'academic':
      return 'Academic Success';
    case 'wellness':
      return 'Wellness';
    default:
      return 'General';
  }
}

const quickActions = [
  {
    label: 'Book Meeting',
    description: 'Schedule with counselor',
    href: '/student/meetings',
    icon: 'calendar',
    color: 'bg-[#2563EB]',
    hoverBorder: 'hover:border-[#2563EB]',
  },
  {
    label: 'New Request',
    description: 'Submit support need',
    href: '/student/requests',
    icon: 'document',
    color: 'bg-[#16A34A]',
    hoverBorder: 'hover:border-[#16A34A]',
  },
  {
    label: 'View Resources',
    description: 'Guides and articles',
    href: '/student/guidance',
    icon: 'book',
    color: 'bg-[#C2410C]',
    hoverBorder: 'hover:border-[#C2410C]',
  },
  {
    label: 'Send Message',
    description: 'Start conversation',
    href: '/student/messages',
    icon: 'chat',
    color: 'bg-[#B91C1C]',
    hoverBorder: 'hover:border-[#B91C1C]',
  },
];

interface PendingParent {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
}

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

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
    studentConfirmed: profile.student_confirmed,
    subject: profile.subject || undefined,
    childrenNames: profile.children_names || undefined,
    relationship: profile.relationship || undefined,
  };
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<CounselingRequest[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [guidanceResources, setGuidanceResources] = useState<GuidanceResourceSummary[]>([]);
  const [editingGoal, setEditingGoal] = useState<number | null>(null);
  const [counselors, setCounselors] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [pendingParents, setPendingParents] = useState<PendingParent[]>([]);
  const [hasWarmCache, setHasWarmCache] = useState(false);
  const [isCacheHydrated, setIsCacheHydrated] = useState(false);
  const [hasLoadedFromServer, setHasLoadedFromServer] = useState(false);
  const dashboardLoadIdRef = useRef(0);
  const guidanceResourcesRef = useRef<GuidanceResourceSummary[]>([]);
  const guidanceEmptyStreakRef = useRef(0);
  const cacheKey = useMemo(
    () => (user?.id ? makeUserCacheKey('student-dashboard', user.id, user.schoolId) : null),
    [user?.id, user?.schoolId]
  );

  useEffect(() => {
    guidanceResourcesRef.current = guidanceResources;
  }, [guidanceResources]);

  const applyDashboardSnapshot = useCallback((snapshot: StudentDashboardCachePayload) => {
    setRequests(snapshot.requests || []);
    setMeetings(snapshot.meetings || []);
    setConversations(snapshot.conversations || []);
    setGoals(snapshot.goals || []);
    setGuidanceResources(snapshot.guidanceResources || []);
    setCounselors(snapshot.counselors || []);
    setTeachers(snapshot.teachers || []);
    setParents(snapshot.parents || []);
    setPendingParents(snapshot.pendingParents || []);
  }, []);

  useLayoutEffect(() => {
    setIsCacheHydrated(false);
    setHasLoadedFromServer(false);

    if (!cacheKey) {
      setRequests([]);
      setMeetings([]);
      setConversations([]);
      setGoals([]);
      setGuidanceResources([]);
      setCounselors([]);
      setTeachers([]);
      setParents([]);
      setPendingParents([]);
      setHasWarmCache(false);
      setIsCacheHydrated(true);
      return;
    }

    const cached = readCachedData<StudentDashboardCachePayload>(
      cacheKey,
      STUDENT_DASHBOARD_CACHE_TTL_MS
    );

    if (cached.found && cached.data) {
      applyDashboardSnapshot(cached.data);
      setHasWarmCache(true);
      setIsCacheHydrated(true);
      return;
    }

    setHasWarmCache(false);
    setIsCacheHydrated(true);
  }, [cacheKey, applyDashboardSnapshot]);

  useEffect(() => {
    if (!cacheKey || !isCacheHydrated) return;
    if (!hasWarmCache && !hasLoadedFromServer) return;

    writeCachedData<StudentDashboardCachePayload>(cacheKey, {
      requests,
      meetings,
      conversations,
      goals,
      guidanceResources,
      counselors,
      teachers,
      parents,
      pendingParents,
    });
  }, [
    cacheKey,
    isCacheHydrated,
    hasWarmCache,
    hasLoadedFromServer,
    requests,
    meetings,
    conversations,
    goals,
    guidanceResources,
    counselors,
    teachers,
    parents,
    pendingParents,
  ]);

  const loadDashboardData = useCallback(async () => {
      if (!user?.id) return;

      const requestId = dashboardLoadIdRef.current + 1;
      dashboardLoadIdRef.current = requestId;

      const fetchResources = async () =>
        supabase
          .from('resources')
          .select('id,title,description,category,type,created_at')
          .eq('school_id', user.schoolId)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(4);

      const [requestsResult, meetingsResult, goalsResult, supportUsersResult, resourcesResult] =
        await Promise.all([
        supabase
          .from('requests')
          .select('*')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('meetings')
          .select('*')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('goals')
          .select('*')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('*')
          .eq('school_id', user.schoolId)
          .in('role', ['counselor', 'teacher', 'parent']),
        fetchResources(),
      ]);

      if (dashboardLoadIdRef.current !== requestId) return;

      if (!resourcesResult.error && resourcesResult.data) {
        let mappedGuidance = resourcesResult.data.map((row) => ({
            id: row.id,
            title: row.title,
            description: row.description,
            category: row.category,
            type: formatGuidanceType(row.type),
            createdAt: formatDate(row.created_at),
          }));

        if (mappedGuidance.length === 0 && guidanceResourcesRef.current.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const { data: retryData, error: retryError } = await fetchResources();
          if (dashboardLoadIdRef.current !== requestId) return;

          if (!retryError && retryData) {
            mappedGuidance = retryData.map((row) => ({
              id: row.id,
              title: row.title,
              description: row.description,
              category: row.category,
              type: formatGuidanceType(row.type),
              createdAt: formatDate(row.created_at),
            }));
          }
        }

        if (mappedGuidance.length === 0 && guidanceResourcesRef.current.length > 0) {
          guidanceEmptyStreakRef.current += 1;
          if (guidanceEmptyStreakRef.current >= 2) {
            setGuidanceResources([]);
          }
        } else {
          guidanceEmptyStreakRef.current = 0;
          setGuidanceResources(mappedGuidance);
        }
      }

      const supportUsers =
        !supportUsersResult.error && supportUsersResult.data
          ? supportUsersResult.data.map(mapProfileToUser)
          : null;
      const schoolCounselors = supportUsers?.filter((member) => member.role === 'counselor') || [];
      const schoolTeachers = supportUsers?.filter((member) => member.role === 'teacher') || [];
      const schoolParents = supportUsers?.filter((member) => member.role === 'parent') || [];

      if (supportUsers) {
        setCounselors(schoolCounselors);
        setTeachers(schoolTeachers);
        setParents(schoolParents);
      }

      if (!requestsResult.error && requestsResult.data) {
        setRequests(
          requestsResult.data.map((row) => ({
            id: row.id,
            title: row.title,
            description: row.description,
            status: normalizeRequestStatus(row.status),
            createdAt: formatDate(row.created_at),
            counselor: row.counselor_name,
            category: row.category,
          }))
        );
      }

      if (!meetingsResult.error && meetingsResult.data) {
        setMeetings(
          meetingsResult.data.map((row) => ({
            id: row.id,
            title: row.title,
            counselor: row.counselor_name,
            date: row.date,
            time: row.time,
            type: row.type,
            status: row.status,
          }))
        );
      }

      if (!goalsResult.error && goalsResult.data) {
        setGoals(
          goalsResult.data.map((row) => ({
            id: row.id,
            title: row.title,
            progress: row.progress,
            deadline: row.deadline,
            priority: row.priority as Goal['priority'],
          }))
        );
      }

      if (supportUsers) {
        const activeCounselors = schoolCounselors.filter((c) => c.approved === true);
        if (activeCounselors.length === 0) {
          setConversations([]);
        } else {
        const keys = activeCounselors.map((c) => buildConversationKey(user.id, c.id));
        const { data: messageRows } = await supabase
          .from('messages')
          .select('*')
          .in('conversation_key', keys)
          .order('created_at', { ascending: true });

        const nextConversations: Conversation[] = activeCounselors.map((counselor, index) => {
          const key = buildConversationKey(user.id, counselor.id);
          const rows = (messageRows || []).filter((row) => row.conversation_key === key);
          const lastStudentIdx = [...rows]
            .reverse()
            .findIndex((row) => row.sender_role === 'student');

          let unread = 0;
          if (lastStudentIdx === -1) {
            unread = rows.filter((row) => row.sender_role === 'counselor').length;
          } else {
            unread = lastStudentIdx;
          }

          return {
            id: index + 1,
            counselor: `${counselor.firstName} ${counselor.lastName}`,
            unread,
            messages: rows.map((row) => ({ id: row.id })),
          };
        });

          setConversations(nextConversations);
        }
      }

      // Load pending parents who want to link to this student
      if (user.approved === true) {
        const studentFullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const { data: parentRows, error: parentRowsError } = await supabase
          .from('profiles')
          .select('*')
          .eq('school_id', user.schoolId)
          .eq('role', 'parent')
          .eq('student_confirmed', false);

        if (!parentRowsError && parentRows) {
          const pending = parentRows
            .filter((p) => {
              const names = p.children_names || [];
              return names.some((n) => n.toLowerCase().trim() === studentFullName);
            })
            .map((p) => ({
              id: p.id,
              firstName: p.first_name,
              lastName: p.last_name,
              relationship: p.relationship || 'Parent',
            }));

          setPendingParents(pending);
        }
      }
      setHasLoadedFromServer(true);
  }, [user?.approved, user?.firstName, user?.id, user?.lastName, user?.schoolId]);

  useEffect(() => {
    if (!user?.id) return;
    if (!isCacheHydrated) return;

    void loadDashboardData();
    return startVisibilityAwarePolling(() => loadDashboardData(), 15000);
  }, [user?.id, isCacheHydrated, loadDashboardData]);

  // Computed stats from real data
  const upcomingMeetings = meetings.filter(
    (m) => m.status === 'confirmed' || m.status === 'pending'
  );
  const unreadMessages = conversations.reduce((sum, c) => sum + (c.unread || 0), 0);
  const goalsOnTrack = goals.filter((g) => g.progress >= 50).length;
  const pendingRequests = requests.filter((r) => r.status === 'pending').length;
  const recentRequests = requests.slice(0, 3);
  const upcomingMeetingsList = upcomingMeetings.slice(0, 2);

  const stats = [
    {
      title: 'Upcoming Meetings',
      value: upcomingMeetings.length,
      subtitle: 'Scheduled',
      accent: 'primary' as const,
    },
    {
      title: 'Goals Progress',
      value: `${goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0}%`,
      subtitle: `${goalsOnTrack} of ${goals.length} on track`,
      accent: 'success' as const,
    },
    {
      title: 'Unread Messages',
      value: unreadMessages,
      subtitle: 'From counselors',
      accent: 'warning' as const,
    },
    {
      title: 'Pending Requests',
      value: pendingRequests,
      subtitle: `${requests.length} total requests`,
      accent: 'accent' as const,
    },
  ];

  const updateGoalProgress = async (goalId: number, newProgress: number) => {
    if (!user) return;
    const progress = Math.min(100, Math.max(0, newProgress));

    const { error } = await supabase
      .from('goals')
      .update({ progress })
      .eq('id', goalId)
      .eq('student_id', user.id);

    if (error) return;

    setGoals((prev) => prev.map((goal) => (goal.id === goalId ? { ...goal, progress } : goal)));
    setEditingGoal(null);
  };

  const getActionIcon = (icon: string) => {
    switch (icon) {
      case 'calendar':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case 'document':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      case 'book':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        );
      case 'chat':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleConfirmParent = async (parentId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ student_confirmed: true })
      .eq('id', parentId);
    if (error) return;
    setPendingParents(prev => prev.filter(p => p.id !== parentId));
  };

  const handleRejectParent = async (parentId: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', parentId);
    if (error) return;
    setPendingParents(prev => prev.filter(p => p.id !== parentId));
  };

  // Pending approval view for unapproved students
  if (user?.approved !== true) {
    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
            Welcome, {user?.firstName || 'Student'}!
          </h1>
          {user?.schoolName && (
            <p className="text-sm text-muted-foreground mt-1">
              {user.schoolName} {user.gradeLevel && `| Grade ${user.gradeLevel}`}
            </p>
          )}
        </div>

        {/* Pending Approval Notice */}
        <Card className="p-0 overflow-hidden border-warning">
          <div className="h-1 bg-warning" />
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-warning flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Account Pending Approval</h2>
                <p className="text-muted-foreground mt-1">
                  Your account has been created successfully. A school counselor needs to approve
                  your account before you can access all features. This usually happens within 1-2
                  school days.
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-warning font-medium">
                  <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                  Waiting for counselor approval
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Counselor Info (read-only) */}
        {counselors.length > 0 && (
          <ContentCard
            title="Your School Counselor(s)"
            description="Your counselors will review your account."
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {counselors.map((c) => (
                <Card key={c.id} className="p-0 overflow-hidden">
                  <div className="h-1 bg-[#2563EB]" />
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full border border-border bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
                        {c.profileImage ? (
                          <img
                            src={c.profileImage}
                            alt={`${c.firstName} ${c.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span
                            className="font-bold text-sm text-[#2563EB]"
                          >
                            {c.firstName[0]}
                            {c.lastName[0]}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {c.firstName} {c.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {c.title || 'School Counselor'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {c.department || 'General'} Department
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ContentCard>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
            Welcome back, {user?.firstName || 'Student'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your counseling journey.
          </p>
          {user?.schoolName && (
            <p className="text-sm text-muted-foreground mt-1">
              {user.schoolName} {user.gradeLevel && `| Grade ${user.gradeLevel}`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`group p-4 bg-card rounded-xl border border-border ${action.hoverBorder} hover:shadow-md transition-all`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 ${action.color} rounded-lg flex items-center justify-center text-white flex-shrink-0`}
              >
                {getActionIcon(action.icon)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{action.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pending Parent Confirmations */}
      {pendingParents.length > 0 && (
        <ContentCard
          title="Parent Confirmation Requests"
          description="These people want to link as your parent"
        >
          <div className="space-y-3">
            {pendingParents.map(parent => (
              <div
                key={parent.id}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#16A34A] flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-sm text-white">
                      {parent.firstName[0]}{parent.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {parent.firstName} {parent.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {parent.relationship.charAt(0).toUpperCase() + parent.relationship.slice(1)} - wants to link as your parent
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleConfirmParent(parent.id)}
                    className="bg-[#16A34A] hover:bg-[#15803D] text-white"
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectParent(parent.id)}
                    className="border-[#B91C1C] bg-[#B91C1C] text-white hover:bg-[#991B1B]"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>
      )}

      {/* Your School Counselor(s) */}
      {counselors.length > 0 && (
        <ContentCard
          title="Your School Counselor(s)"
          description="Your assigned support team, organized for quick contact."
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {counselors.map((c) => (
              <Card key={c.id} className="p-0 overflow-hidden h-full border-border" hover>
                <div className="h-1 bg-[#2563EB]" />
                <div className="relative p-4 space-y-4">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute right-4 top-4 w-3 h-3 rounded-full bg-[#2563EB]"
                  />
                  <div className="relative flex items-start gap-3">
                    <div className="w-14 h-14 rounded-full border border-border bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
                      {c.profileImage ? (
                        <img
                          src={c.profileImage}
                          alt={`${c.firstName} ${c.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span
                          className="font-bold text-base text-[#2563EB]"
                        >
                          {c.firstName[0]}
                          {c.lastName[0]}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {c.firstName} {c.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {c.title || 'School Counselor'}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full border border-[#2563EB] bg-[#2563EB] text-[11px] font-semibold text-white mt-0.5">
                          Assigned
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2">
                    <div className="rounded-lg border border-border bg-muted px-3 py-2.5">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Department
                      </p>
                      <p className="text-sm font-semibold text-foreground capitalize mt-0.5">
                        {c.department || 'General'}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted px-3 py-2.5">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        School
                      </p>
                      <p className="text-sm font-semibold text-foreground mt-0.5 truncate">
                        {c.schoolName || user?.schoolName || 'Assigned School'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/student/messages"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#B91C1C] bg-[#B91C1C] text-sm font-medium text-white hover:bg-[#991B1B] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Message
                    </Link>
                    <Link
                      href="/student/meetings"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#2563EB] bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Book Meeting
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ContentCard>
      )}

      {(counselors.length > 0 || teachers.length > 0 || parents.length > 0) && (
        <ContentCard
          title="Registered School Contacts"
          description="Everyone registered at your school by role."
        >
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-muted p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#2563EB]" />
                  <p className="font-semibold text-foreground">Counselors</p>
                </div>
                <Badge variant="primary" size="sm">{counselors.length}</Badge>
              </div>
              {counselors.length === 0 ? (
                <p className="text-sm text-muted-foreground">No counselors registered yet.</p>
              ) : (
                <div className="space-y-2">
                  {counselors.map((member) => (
                    <div key={member.id} className="p-2.5 rounded-lg bg-card border border-border">
                      <p className="text-sm font-medium text-foreground">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.title || 'School Counselor'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-muted p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#C2410C]" />
                  <p className="font-semibold text-foreground">Teachers</p>
                </div>
                <Badge variant="accent" size="sm">{teachers.length}</Badge>
              </div>
              {teachers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No teachers registered yet.</p>
              ) : (
                <div className="space-y-2">
                  {teachers.map((member) => (
                    <div key={member.id} className="p-2.5 rounded-lg bg-card border border-border">
                      <p className="text-sm font-medium text-foreground">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.subject || 'Teacher'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-muted p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#B91C1C]" />
                  <p className="font-semibold text-foreground">Parents</p>
                </div>
                <Badge variant="warning" size="sm">{parents.length}</Badge>
              </div>
              {parents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No parents registered yet.</p>
              ) : (
                <div className="space-y-2">
                  {parents.map((member) => (
                    <div key={member.id} className="p-2.5 rounded-lg bg-card border border-border">
                      <p className="text-sm font-medium text-foreground">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.relationship || 'Parent'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ContentCard>
      )}

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            accentColor={stat.accent}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Requests */}
        <ContentCard
          title="Recent Requests"
          description="Your latest counseling requests"
          action={
            <Link href="/student/requests" className="text-sm text-primary hover:text-primary">
              View all
            </Link>
          }
          className="lg:col-span-2"
        >
          {recentRequests.length > 0 ? (
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <div key={request.id} className="rounded-xl border border-border bg-muted p-3.5">
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 w-2.5 h-2.5 rounded-full ${
                        request.status === 'pending'
                          ? 'bg-warning'
                          : request.status === 'in_progress'
                            ? 'bg-primary'
                            : request.status === 'approved'
                              ? 'bg-success'
                              : 'bg-muted-foreground'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-foreground leading-5">{request.title}</p>
                        <Badge
                          variant={
                            request.status === 'pending'
                              ? 'warning'
                              : request.status === 'in_progress'
                                ? 'primary'
                                : request.status === 'approved'
                                  ? 'success'
                                  : 'default'
                          }
                          size="sm"
                        >
                          {getRequestStatusLabel(request.status)}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-2.5 py-1 rounded-full border border-border bg-background text-muted-foreground">
                          {request.counselor}
                        </span>
                        <span className="px-2.5 py-1 rounded-full border border-border bg-background text-muted-foreground">
                          {request.createdAt}
                        </span>
                        <span className="px-2.5 py-1 rounded-full border border-[#C2410C] bg-[#C2410C] text-white capitalize">
                          {request.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 rounded-xl border border-dashed border-border bg-muted text-muted-foreground">
              <svg className="w-10 h-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No requests yet.</p>
              <Link
                href="/student/requests"
                className="text-primary text-sm hover:underline mt-1 inline-block"
              >
                Create your first request
              </Link>
            </div>
          )}
        </ContentCard>

        {/* Upcoming Meetings */}
        <ContentCard
          title="Upcoming Meetings"
          action={
            <Link href="/student/meetings" className="text-sm text-primary hover:text-primary">
              View all
            </Link>
          }
        >
          {upcomingMeetingsList.length > 0 ? (
            <div className="space-y-3">
              {upcomingMeetingsList.map((meeting) => (
                <div key={meeting.id} className="rounded-xl border border-border bg-muted p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm leading-5">{meeting.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 truncate">{meeting.counselor}</p>
                    </div>
                    <Badge variant={meeting.type === 'video' ? 'primary' : 'accent'} size="sm">
                      {meeting.type === 'video' ? 'Video' : 'In-Person'}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-border bg-background">
                      <svg
                        className="w-3.5 h-3.5"
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
                      {meeting.date}
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-border bg-background">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {meeting.time}
                    </span>
                  </div>
                </div>
              ))}
              <Link href="/student/meetings">
                <Button variant="outline" fullWidth size="sm">
                  Book New Meeting
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-6 rounded-xl border border-dashed border-border bg-muted text-muted-foreground">
              <svg className="w-10 h-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>No upcoming meetings.</p>
              <Link href="/student/meetings">
                <Button variant="outline" size="sm" className="mt-3">
                  Book a Meeting
                </Button>
              </Link>
            </div>
          )}
        </ContentCard>
      </div>

      <ContentCard
        title="Latest Guidance"
        description="Fresh resources published for students at your school."
        action={
          <Link href="/student/guidance" className="text-sm text-primary hover:text-primary">
            Open guidance
          </Link>
        }
      >
        {guidanceResources.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {guidanceResources.map((resource) => (
              <div
                key={resource.id}
                className="rounded-xl border border-border bg-muted p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                      {getGuidanceCategoryLabel(resource.category)}
                    </p>
                    <h3 className="font-semibold text-foreground mt-1 line-clamp-2">
                      {resource.title}
                    </h3>
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {resource.type}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{resource.createdAt}</span>
                  <Link
                    href="/student/guidance"
                    className="text-xs font-medium text-primary hover:text-primary"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 rounded-xl border border-dashed border-border bg-muted text-muted-foreground">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl border border-border bg-background flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p>No published guidance resources yet.</p>
            <p className="text-sm mt-1">
              Ask your counselor to publish resources, then they will appear here.
            </p>
          </div>
        )}
      </ContentCard>

      {/* Goals Progress */}
      <ContentCard
        title="Goals Progress"
        description="Track your academic and personal goals"
        action={goals.length > 0 ? undefined : undefined}
      >
        {goals.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {goals.map((goal) => (
              <Card key={goal.id} className="p-4" hover>
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant={
                      goal.priority === 'high'
                        ? 'destructive'
                        : goal.priority === 'medium'
                          ? 'warning'
                          : 'default'
                    }
                    size="sm"
                  >
                    {goal.priority}
                  </Badge>
                  <span className="text-sm font-semibold text-primary">{goal.progress}%</span>
                </div>
                <p className="font-medium text-foreground text-sm mb-1">{goal.title}</p>
                <p className="text-xs text-muted-foreground mb-3">Due: {goal.deadline}</p>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      goal.progress >= 75
                        ? 'bg-success'
                        : goal.progress >= 50
                          ? 'bg-primary'
                          : goal.progress >= 25
                            ? 'bg-warning'
                            : 'bg-destructive'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                {editingGoal === goal.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={goal.progress}
                      onChange={(e) => {
                        const newGoals = goals.map((g) =>
                          g.id === goal.id ? { ...g, progress: parseInt(e.target.value) } : g
                        );
                        setGoals(newGoals);
                      }}
                      className="flex-1 h-1.5 accent-primary"
                    />
                    <button
                      onClick={() => updateGoalProgress(goal.id, goal.progress)}
                      className="text-xs text-primary font-medium hover:text-primary"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingGoal(goal.id)}
                    className="text-xs text-primary hover:text-primary font-medium"
                  >
                    Update Progress
                  </button>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <svg
              className="w-12 h-12 mx-auto mb-3"
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
            <p className="font-medium">No goals set yet</p>
            <p className="text-sm mt-1">
              Talk to your counselor to set academic and personal goals
            </p>
          </div>
        )}
      </ContentCard>
    </div>
  );
}
