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

function getGuidanceCategoryStyles(category: string) {
  switch (category) {
    case 'college':
      return {
        card: 'border-[#AECBFA] dark:border-[#355C9A] bg-[#E8F0FE] dark:bg-[#0F2747]',
        label: 'text-[#1A73E8] dark:text-[#8AB4F8]',
        type: 'border-[#AECBFA] dark:border-[#355C9A] bg-[#D2E3FC] dark:bg-[#1B3B6F] text-[#1A73E8] dark:text-[#8AB4F8]',
        link: 'text-[#1A73E8] dark:text-[#8AB4F8] hover:text-[#185ABC] dark:hover:text-[#AECBFA]',
      };
    case 'career':
      return {
        card: 'border-[#81C995] dark:border-[#2E7D32] bg-[#E6F4EA] dark:bg-[#102E18]',
        label: 'text-[#1E8E3E] dark:text-[#81C995]',
        type: 'border-[#81C995] dark:border-[#2E7D32] bg-[#CEEAD6] dark:bg-[#1A4A28] text-[#1E8E3E] dark:text-[#81C995]',
        link: 'text-[#1E8E3E] dark:text-[#81C995] hover:text-[#137333] dark:hover:text-[#A8DAB5]',
      };
    case 'academic':
      return {
        card: 'border-[#F6C26B] dark:border-[#A86A08] bg-[#FEF7E0] dark:bg-[#33240E]',
        label: 'text-[#EA8600] dark:text-[#F6C26B]',
        type: 'border-[#F6C26B] dark:border-[#A86A08] bg-[#FDE293] dark:bg-[#4A340F] text-[#EA8600] dark:text-[#F6C26B]',
        link: 'text-[#EA8600] dark:text-[#F6C26B] hover:text-[#C26401] dark:hover:text-[#FDE293]',
      };
    case 'wellness':
      return {
        card: 'border-[#D7AEFB] dark:border-[#6F4E93] bg-[#F3E8FD] dark:bg-[#261537]',
        label: 'text-[#7B1FA2] dark:text-[#D7AEFB]',
        type: 'border-[#D7AEFB] dark:border-[#6F4E93] bg-[#E9D4FA] dark:bg-[#3B2455] text-[#7B1FA2] dark:text-[#D7AEFB]',
        link: 'text-[#7B1FA2] dark:text-[#D7AEFB] hover:text-[#6A1B9A] dark:hover:text-[#E9D4FA]',
      };
    default:
      return {
        card: 'border-border bg-muted',
        label: 'text-primary',
        type: 'border-border bg-background text-muted-foreground',
        link: 'text-primary hover:text-primary',
      };
  }
}

const quickActions = [
  {
    label: 'Book Meeting',
    description: 'Schedule with counselor',
    href: '/student/meetings',
    icon: 'calendar',
    iconColor: 'bg-[#1A73E8] dark:bg-[#355C9A]',
    cardColor: 'border-[#AECBFA] dark:border-[#355C9A] bg-[#E8F0FE] dark:bg-[#0F2747] hover:bg-[#D2E3FC] dark:hover:bg-[#1B3B6F]',
    textColor: 'text-[#1A73E8] dark:text-[#8AB4F8]',
  },
  {
    label: 'New Request',
    description: 'Submit support need',
    href: '/student/requests',
    icon: 'document',
    iconColor: 'bg-[#1E8E3E] dark:bg-[#2E7D32]',
    cardColor: 'border-[#81C995] dark:border-[#2E7D32] bg-[#E6F4EA] dark:bg-[#102E18] hover:bg-[#CEEAD6] dark:hover:bg-[#1A4A28]',
    textColor: 'text-[#1E8E3E] dark:text-[#81C995]',
  },
  {
    label: 'View Resources',
    description: 'Guides and articles',
    href: '/student/guidance',
    icon: 'book',
    iconColor: 'bg-[#EA8600] dark:bg-[#A86A08]',
    cardColor: 'border-[#F6C26B] dark:border-[#A86A08] bg-[#FEF7E0] dark:bg-[#33240E] hover:bg-[#FDE293] dark:hover:bg-[#4A340F]',
    textColor: 'text-[#EA8600] dark:text-[#F6C26B]',
  },
  {
    label: 'Send Message',
    description: 'Start conversation',
    href: '/student/messages',
    icon: 'chat',
    iconColor: 'bg-[#7B1FA2] dark:bg-[#6F4E93]',
    cardColor: 'border-[#D7AEFB] dark:border-[#6F4E93] bg-[#F3E8FD] dark:bg-[#261537] hover:bg-[#E9D4FA] dark:hover:bg-[#3B2455]',
    textColor: 'text-[#7B1FA2] dark:text-[#D7AEFB]',
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

  const statCardClasses = [
    'border-[#AECBFA] dark:border-[#355C9A] bg-[#E8F0FE] dark:bg-[#0F2747]',
    'border-[#81C995] dark:border-[#2E7D32] bg-[#E6F4EA] dark:bg-[#102E18]',
    'border-[#F6C26B] dark:border-[#A86A08] bg-[#FEF7E0] dark:bg-[#33240E]',
    'border-[#D7AEFB] dark:border-[#6F4E93] bg-[#F3E8FD] dark:bg-[#261537]',
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
        <Card className="p-0 overflow-hidden border-[#F6C26B] dark:border-[#A86A08]">
          <div className="h-1 bg-warning" />
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FDE293] dark:bg-[#4A340F] flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-warning"
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
              {counselors.map((c, index) => (
                <Card key={c.id} className="p-0 overflow-hidden">
                  <div
                    className={`h-1 ${index % 3 === 0 ? 'bg-primary' : index % 3 === 1 ? 'bg-secondary' : 'bg-accent'}`}
                  />
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
                            className={`font-bold text-sm ${index % 3 === 0 ? 'text-primary' : index % 3 === 1 ? 'text-secondary' : 'text-accent'}`}
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
      <div className="rounded-2xl border border-[#AECBFA] dark:border-[#355C9A] bg-[#E8F0FE] dark:bg-[#0F2747] p-5 sm:p-6">
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
          <div className="inline-flex items-center gap-2 rounded-full border border-[#AECBFA] dark:border-[#355C9A] bg-[#D2E3FC] dark:bg-[#1B3B6F] px-3 py-1.5 text-sm text-muted-foreground">
            <svg className="w-4 h-4 text-[#1A73E8] dark:text-[#8AB4F8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`group relative overflow-hidden rounded-xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${action.cardColor}`}
          >
            <div className={`absolute left-0 top-0 h-1 w-full ${action.iconColor}`} />
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 ${action.iconColor} rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-sm`}
              >
                {getActionIcon(action.icon)}
              </div>
              <div className="relative min-w-0">
                <p className={`text-sm font-semibold ${action.textColor}`}>{action.label}</p>
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
                className="flex items-center justify-between p-4 bg-[#FEF7E0] dark:bg-[#33240E] border border-[#F6C26B] dark:border-[#A86A08] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FDE293] dark:bg-[#4A340F] flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-sm text-warning">
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
                    className="bg-success hover:bg-success text-white"
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectParent(parent.id)}
                    className="border-destructive text-destructive hover:bg-[#FCE8E6] dark:hover:bg-[#5F1D1D]"
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
          className="border-[#AECBFA] dark:border-[#355C9A] bg-[#E8F0FE] dark:bg-[#0F2747]"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {counselors.map((c, index) => (
              <Card
                key={c.id}
                className={`p-0 overflow-hidden h-full ${
                  index % 3 === 0
                    ? 'border-[#AECBFA] dark:border-[#355C9A] bg-[#E8F0FE] dark:bg-[#0F2747]'
                    : index % 3 === 1
                      ? 'border-[#81C995] dark:border-[#2E7D32] bg-[#E6F4EA] dark:bg-[#102E18]'
                      : 'border-[#F6C26B] dark:border-[#A86A08] bg-[#FEF7E0] dark:bg-[#33240E]'
                }`}
                hover
              >
                <div
                  className={`h-1 ${
                    index % 3 === 0
                      ? 'bg-[#1A73E8] dark:bg-[#355C9A]'
                      : index % 3 === 1
                        ? 'bg-[#1E8E3E] dark:bg-[#2E7D32]'
                        : 'bg-[#EA8600] dark:bg-[#A86A08]'
                  }`}
                />
                <div className="relative p-4 space-y-4">
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute -right-10 -top-10 w-24 h-24 rounded-full blur-2xl ${
                      index % 3 === 0
                        ? 'bg-[#D2E3FC] dark:bg-[#1B3B6F]'
                        : index % 3 === 1
                          ? 'bg-[#CEEAD6] dark:bg-[#1A4A28]'
                          : 'bg-[#FDE293] dark:bg-[#4A340F]'
                    }`}
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
                          className={`font-bold text-base ${
                            index % 3 === 0
                              ? 'text-[#1A73E8] dark:text-[#8AB4F8]'
                              : index % 3 === 1
                                ? 'text-[#1E8E3E] dark:text-[#81C995]'
                                : 'text-[#EA8600] dark:text-[#F6C26B]'
                          }`}
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
                        <span className="px-2.5 py-1 rounded-full border border-[#AECBFA] dark:border-[#355C9A] bg-[#D2E3FC] dark:bg-[#1B3B6F] text-[11px] font-semibold text-[#1A73E8] dark:text-[#8AB4F8] mt-0.5">
                          Assigned
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2">
                    <div className="rounded-lg border border-[#81C995] dark:border-[#2E7D32] bg-[#E6F4EA] dark:bg-[#102E18] px-3 py-2.5">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Department
                      </p>
                      <p className="text-sm font-semibold text-foreground capitalize mt-0.5">
                        {c.department || 'General'}
                      </p>
                    </div>
                    <div className="rounded-lg border border-[#F6C26B] dark:border-[#A86A08] bg-[#FEF7E0] dark:bg-[#33240E] px-3 py-2.5">
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
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#D7AEFB] dark:border-[#6F4E93] bg-[#E9D4FA] dark:bg-[#3B2455] text-sm font-medium text-[#7B1FA2] dark:text-[#D7AEFB] hover:bg-[#D7AEFB] dark:hover:bg-[#6F4E93] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Message
                    </Link>
                    <Link
                      href="/student/meetings"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#AECBFA] dark:border-[#355C9A] bg-[#D2E3FC] dark:bg-[#1B3B6F] text-[#1A73E8] dark:text-[#8AB4F8] text-sm font-medium hover:bg-[#AECBFA] dark:hover:bg-[#355C9A] transition-colors"
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
          className="border-[#81C995] dark:border-[#2E7D32] bg-[#E6F4EA] dark:bg-[#102E18]"
        >
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-[#AECBFA] dark:border-[#355C9A] bg-[#E8F0FE] dark:bg-[#0F2747] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-foreground">Counselors</p>
                <Badge variant="primary" size="sm">{counselors.length}</Badge>
              </div>
              {counselors.length === 0 ? (
                <p className="text-sm text-muted-foreground">No counselors registered yet.</p>
              ) : (
                <div className="space-y-2">
                  {counselors.map((member) => (
                    <div key={member.id} className="p-2.5 rounded-lg bg-[#D2E3FC] dark:bg-[#1B3B6F] border border-[#AECBFA] dark:border-[#355C9A]">
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

            <div className="rounded-xl border border-[#81C995] dark:border-[#2E7D32] bg-[#E6F4EA] dark:bg-[#102E18] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-foreground">Teachers</p>
                <Badge variant="accent" size="sm">{teachers.length}</Badge>
              </div>
              {teachers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No teachers registered yet.</p>
              ) : (
                <div className="space-y-2">
                  {teachers.map((member) => (
                    <div key={member.id} className="p-2.5 rounded-lg bg-[#CEEAD6] dark:bg-[#1A4A28] border border-[#81C995] dark:border-[#2E7D32]">
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

            <div className="rounded-xl border border-[#F6C26B] dark:border-[#A86A08] bg-[#FEF7E0] dark:bg-[#33240E] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-foreground">Parents</p>
                <Badge variant="warning" size="sm">{parents.length}</Badge>
              </div>
              {parents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No parents registered yet.</p>
              ) : (
                <div className="space-y-2">
                  {parents.map((member) => (
                    <div key={member.id} className="p-2.5 rounded-lg bg-[#FDE293] dark:bg-[#4A340F] border border-[#F6C26B] dark:border-[#A86A08]">
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
            className={statCardClasses[index]}
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
          className="lg:col-span-2 border-[#AECBFA] dark:border-[#355C9A] bg-[#E8F0FE] dark:bg-[#0F2747]"
        >
          {recentRequests.length > 0 ? (
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <div key={request.id} className="rounded-xl border border-[#AECBFA] dark:border-[#355C9A] bg-[#D2E3FC] dark:bg-[#1B3B6F] p-3.5">
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
                        <span className="px-2.5 py-1 rounded-full border border-[#AECBFA] dark:border-[#355C9A] bg-[#D2E3FC] dark:bg-[#1B3B6F] text-[#1A73E8] dark:text-[#8AB4F8] capitalize">
                          {request.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 rounded-xl border border-dashed border-[#AECBFA] dark:border-[#355C9A] bg-[#E8F0FE] dark:bg-[#0F2747] text-muted-foreground">
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
          className="border-[#F6C26B] dark:border-[#A86A08] bg-[#FEF7E0] dark:bg-[#33240E]"
        >
          {upcomingMeetingsList.length > 0 ? (
            <div className="space-y-3">
              {upcomingMeetingsList.map((meeting) => (
                <div key={meeting.id} className="rounded-xl border border-[#F6C26B] dark:border-[#A86A08] bg-[#FDE293] dark:bg-[#4A340F] p-3.5">
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
                    <span className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-[#F6C26B] dark:border-[#A86A08] bg-[#FEF7E0] dark:bg-[#33240E]">
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
                    <span className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-[#F6C26B] dark:border-[#A86A08] bg-[#FEF7E0] dark:bg-[#33240E]">
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
                <Button variant="outline" fullWidth size="sm" className="border-[#F6C26B] dark:border-[#A86A08] text-[#EA8600] dark:text-[#F6C26B] hover:bg-[#FDE293] dark:hover:bg-[#4A340F]">
                  Book New Meeting
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-6 rounded-xl border border-dashed border-[#F6C26B] dark:border-[#A86A08] bg-[#FEF7E0] dark:bg-[#33240E] text-muted-foreground">
              <svg className="w-10 h-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>No upcoming meetings.</p>
              <Link href="/student/meetings">
                <Button variant="outline" size="sm" className="mt-3 border-[#F6C26B] dark:border-[#A86A08] text-[#EA8600] dark:text-[#F6C26B] hover:bg-[#FDE293] dark:hover:bg-[#4A340F]">
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
        className="border-[#81C995] dark:border-[#2E7D32] bg-[#E6F4EA] dark:bg-[#102E18]"
      >
        {guidanceResources.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {guidanceResources.map((resource) => {
              const color = getGuidanceCategoryStyles(resource.category);
              return (
                <div
                  key={resource.id}
                  className={`rounded-xl border p-4 space-y-3 ${color.card}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`text-[11px] font-semibold uppercase tracking-wide ${color.label}`}>
                        {getGuidanceCategoryLabel(resource.category)}
                      </p>
                      <h3 className="font-semibold text-foreground mt-1 line-clamp-2">
                        {resource.title}
                      </h3>
                    </div>
                    <span className={`text-[11px] whitespace-nowrap rounded-full border px-2 py-1 ${color.type}`}>
                      {resource.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{resource.createdAt}</span>
                    <Link
                      href="/student/guidance"
                      className={`text-xs font-medium ${color.link}`}
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 rounded-xl border border-dashed border-[#81C995] dark:border-[#2E7D32] bg-[#E6F4EA] dark:bg-[#102E18] text-muted-foreground">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl border border-[#81C995] dark:border-[#2E7D32] bg-[#CEEAD6] dark:bg-[#1A4A28] flex items-center justify-center">
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
        className="border-[#D7AEFB] dark:border-[#6F4E93] bg-[#F3E8FD] dark:bg-[#261537]"
      >
        {goals.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {goals.map((goal) => (
              <Card
                key={goal.id}
                className={`p-4 ${
                  goal.priority === 'high'
                    ? 'border-[#F6C26B] dark:border-[#A86A08] bg-[#FEF7E0] dark:bg-[#33240E]'
                    : goal.priority === 'medium'
                      ? 'border-[#AECBFA] dark:border-[#355C9A] bg-[#E8F0FE] dark:bg-[#0F2747]'
                      : 'border-[#81C995] dark:border-[#2E7D32] bg-[#E6F4EA] dark:bg-[#102E18]'
                }`}
                hover
              >
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

