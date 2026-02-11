'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StatsCard, ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

interface CounselingRequest {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  counselor: string;
  category: string;
  studentName?: string;
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

export default function CounselorDashboardPage() {
  const { user, getSchoolStudents } = useAuth();
  const [studentCount, setStudentCount] = useState(0);
  const [requests, setRequests] = useState<CounselingRequest[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const counselorName = user ? `${user.firstName} ${user.lastName}` : '';

  useEffect(() => {
    if (user?.schoolId) {
      setStudentCount(getSchoolStudents(user.schoolId).length);
    }

    // Load requests assigned to this counselor
    const storedRequests = localStorage.getItem('mycounselor_student_requests');
    if (storedRequests) {
      try {
        const all: CounselingRequest[] = JSON.parse(storedRequests);
        setRequests(all.filter(r => r.counselor === counselorName));
      } catch {
        setRequests([]);
      }
    }

    // Load meetings for this counselor
    const storedMeetings = localStorage.getItem('mycounselor_student_meetings');
    if (storedMeetings) {
      try {
        const all: Meeting[] = JSON.parse(storedMeetings);
        setMeetings(all.filter(m => m.counselor === counselorName));
      } catch {
        setMeetings([]);
      }
    }
  }, [user?.schoolId, counselorName, getSchoolStudents]);

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const completedRequests = requests.filter(r => r.status === 'completed');
  const upcomingMeetings = meetings.filter(m => m.status === 'confirmed' || m.status === 'pending');

  const stats = [
    { title: 'Students', value: studentCount, subtitle: 'At your school', accent: 'primary' as const },
    { title: 'Pending Requests', value: pendingRequests.length, subtitle: `${requests.length} total`, accent: 'warning' as const },
    { title: 'Upcoming Meetings', value: upcomingMeetings.length, subtitle: 'Scheduled', accent: 'accent' as const },
    { title: 'Completed', value: completedRequests.length, subtitle: 'Tasks finished', accent: 'success' as const },
  ];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
            Welcome back, {user?.firstName || 'Counselor'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s your counseling overview for today.
          </p>
          {user?.schoolName && (
            <p className="text-sm text-muted-foreground mt-1">
              {user.schoolName} {user.title && `\u2022 ${user.title}`}
            </p>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {today}
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            accentColor={stat.accent}
            icon={
              index === 0 ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : index === 1 ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              ) : index === 2 ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )
            }
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Requests */}
        <ContentCard
          title="Pending Requests"
          description="Student requests needing attention"
          action={
            <Link href="/counselor/tasks" className="text-sm text-primary hover:text-primary/80">
              View all
            </Link>
          }
          className="lg:col-span-2"
        >
          {pendingRequests.length > 0 ? (
            <div className="space-y-3">
              {pendingRequests.slice(0, 4).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {(request.studentName || '?').split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{request.title}</p>
                      <p className="text-sm text-muted-foreground">{request.studentName || 'Unknown Student'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-warning/10 text-warning border-warning/20">
                      {request.createdAt}
                    </span>
                    <Link href="/counselor/tasks">
                      <Button variant="ghost" size="sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-medium">All caught up!</p>
              <p className="text-sm mt-1">No pending student requests</p>
            </div>
          )}
        </ContentCard>

        {/* Upcoming Meetings */}
        <ContentCard
          title="Upcoming Meetings"
          action={
            <Link href="/counselor/meetings" className="text-sm text-primary hover:text-primary/80">
              Full schedule
            </Link>
          }
        >
          {upcomingMeetings.length > 0 ? (
            <div className="space-y-3">
              {upcomingMeetings.slice(0, 5).map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-3 rounded-lg border bg-primary/5 border-primary/20"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-foreground">{meeting.time}</span>
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>
                  <p className="text-sm text-foreground">{meeting.title}</p>
                  <p className="text-xs text-muted-foreground">{meeting.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="font-medium">No upcoming meetings</p>
              <p className="text-sm mt-1">Meetings booked by students will appear here</p>
            </div>
          )}
        </ContentCard>
      </div>

      {/* Quick Actions */}
      <ContentCard title="Quick Actions">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/counselor/students"
            className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-center"
          >
            <svg className="w-8 h-8 mx-auto text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-sm font-medium text-foreground">View Students</span>
          </Link>
          <Link
            href="/counselor/tasks"
            className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-center"
          >
            <svg className="w-8 h-8 mx-auto text-warning mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="text-sm font-medium text-foreground">Review Tasks</span>
          </Link>
          <Link
            href="/counselor/availability"
            className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-center"
          >
            <svg className="w-8 h-8 mx-auto text-secondary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-foreground">Set Hours</span>
          </Link>
          <Link
            href="/counselor/guidance"
            className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-center"
          >
            <svg className="w-8 h-8 mx-auto text-accent mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-sm font-medium text-foreground">Add Resource</span>
          </Link>
        </div>
      </ContentCard>
    </div>
  );
}
