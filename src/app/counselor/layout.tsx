'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar, { SidebarItem } from '@/components/layout/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const counselorNavItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/counselor/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    label: 'Students',
    href: '/counselor/students',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    label: 'Tasks',
    href: '/counselor/tasks',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
  },
  {
    label: 'Meetings',
    href: '/counselor/meetings',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    label: 'Messages',
    href: '/counselor/messages',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
    ),
  },
  {
    label: 'Availability',
    href: '/counselor/availability',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    label: 'Guidance Content',
    href: '/counselor/guidance',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
];

export default function CounselorLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, getSchoolStudents } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});

  const isApproved = user?.approved === true;

  // Redirect unapproved counselors to dashboard only
  useEffect(() => {
    if (!isLoading && user && user.role === 'counselor' && !isApproved && pathname !== '/counselor/dashboard') {
      router.push('/counselor/dashboard');
    }
  }, [isLoading, user, isApproved, pathname, router]);

  // Compute badge counts
  const computeBadges = useCallback(async () => {
    if (!user) return;

    const counts: Record<string, number> = {};

    const { data: pendingTasks } = await supabase
      .from('requests')
      .select('id')
      .eq('counselor_id', user.id)
      .eq('status', 'pending');

    if ((pendingTasks || []).length > 0) {
      counts['/counselor/tasks'] = pendingTasks!.length;
    }

    if (user.schoolId) {
      const students = getSchoolStudents(user.schoolId).filter((student) => student.approved === true);
      if (students.length > 0) {
        const keys = students.map((student) => [student.id, user.id].sort().join('__'));
        const { data: messageRows } = await supabase
          .from('messages')
          .select('conversation_key,sender_role')
          .in('conversation_key', keys)
          .order('created_at', { ascending: true });

        let totalUnread = 0;
        keys.forEach((key) => {
          const rows = (messageRows || []).filter((row) => row.conversation_key === key);
          const lastCounselorIdx = [...rows]
            .reverse()
            .findIndex((row) => row.sender_role === 'counselor');
          if (lastCounselorIdx === -1) {
            totalUnread += rows.filter((row) => row.sender_role === 'student').length;
          } else {
            totalUnread += lastCounselorIdx;
          }
        });

        if (totalUnread > 0) counts['/counselor/messages'] = totalUnread;
      }
    }

    // Pending student approvals
    try {
      if (user.schoolId) {
        const students = getSchoolStudents(user.schoolId);
        const pendingStudents = students.filter(s => s.approved !== true).length;
        if (pendingStudents > 0) counts['/counselor/students'] = pendingStudents;
      }
    } catch { /* skip */ }

    setBadgeCounts(counts);
  }, [user, getSchoolStudents]);

  useEffect(() => {
    computeBadges();
    const interval = setInterval(() => {
      computeBadges();
    }, 5000);
    return () => clearInterval(interval);
  }, [computeBadges]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const visibleNavItems = isApproved
    ? counselorNavItems.map(item => ({
        ...item,
        badge: badgeCounts[item.href] || undefined,
      }))
    : counselorNavItems.filter(item => item.href === '/counselor/dashboard');

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        items={visibleNavItems}
        userType="counselor"
        userName={user ? `${user.firstName} ${user.lastName}` : 'Counselor'}
        userEmail={user?.email || 'counselor@school.edu'}
        userAvatar={user?.profileImage}
        userSchool={user?.schoolName}
        userTitle={user?.title}
        userDepartment={user?.department}
      />
      <main className="lg:pl-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
