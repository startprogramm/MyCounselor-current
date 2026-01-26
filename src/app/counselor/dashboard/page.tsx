'use client';

import React from 'react';
import Link from 'next/link';
import { Card, StatsCard, ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

// Mock data
const stats = [
  { title: 'Active Students', value: 24, trend: { value: 8, isPositive: true } },
  { title: 'Pending Tasks', value: 8, subtitle: '3 high priority' },
  { title: "Today's Meetings", value: 5, subtitle: 'Next in 30 min' },
  { title: 'This Week', value: 18, subtitle: 'Meetings completed', trend: { value: 12, isPositive: true } },
];

const priorityTasks = [
  { id: 1, student: 'Alex Johnson', task: 'College Essay Review', deadline: 'Today', priority: 'high' },
  { id: 2, student: 'Emily Rodriguez', task: 'Letter of Recommendation', deadline: 'Tomorrow', priority: 'high' },
  { id: 3, student: 'James Wilson', task: 'Schedule Change Approval', deadline: 'Jan 26', priority: 'medium' },
  { id: 4, student: 'Sarah Kim', task: 'SAT Prep Plan Review', deadline: 'Jan 27', priority: 'medium' },
];

const todaysMeetings = [
  { id: 1, student: 'Alex Johnson', time: '9:00 AM', type: 'College Review', status: 'completed' },
  { id: 2, student: 'Emily Rodriguez', time: '10:30 AM', type: 'Career Guidance', status: 'completed' },
  { id: 3, student: 'James Wilson', time: '2:00 PM', type: 'Academic Support', status: 'upcoming' },
  { id: 4, student: 'Sarah Kim', time: '3:30 PM', type: 'Goal Setting', status: 'upcoming' },
  { id: 5, student: 'Michael Chen', time: '4:30 PM', type: 'College Prep', status: 'upcoming' },
];

const recentActivity = [
  { id: 1, action: 'Approved schedule change', student: 'Lisa Park', time: '2 hours ago' },
  { id: 2, action: 'Sent recommendation letter', student: 'Tom Brown', time: '3 hours ago' },
  { id: 3, action: 'Completed meeting', student: 'Emily Rodriguez', time: '4 hours ago' },
  { id: 4, action: 'Reviewed college essay', student: 'Alex Johnson', time: 'Yesterday' },
];

export default function CounselorDashboardPage() {
  const { user } = useAuth();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

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
              {user.schoolName} {user.title && `• ${user.title}`}
            </p>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Friday, January 24, 2026
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
            trend={stat.trend}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )
            }
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Priority Tasks */}
        <ContentCard
          title="Priority Tasks"
          description="Tasks requiring your attention"
          action={
            <Link href="/counselor/tasks" className="text-sm text-primary hover:text-primary/80">
              View all
            </Link>
          }
          className="lg:col-span-2"
        >
          <div className="space-y-3">
            {priorityTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {task.student.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{task.task}</p>
                    <p className="text-sm text-muted-foreground">{task.student}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                    {task.deadline}
                  </span>
                  <Button variant="ghost" size="sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>

        {/* Today's Schedule */}
        <ContentCard
          title="Today's Schedule"
          action={
            <Link href="/counselor/meetings" className="text-sm text-primary hover:text-primary/80">
              Full calendar
            </Link>
          }
        >
          <div className="space-y-3">
            {todaysMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className={`p-3 rounded-lg border ${
                  meeting.status === 'completed'
                    ? 'bg-muted/30 border-border opacity-60'
                    : 'bg-primary/5 border-primary/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-foreground">{meeting.time}</span>
                  {meeting.status === 'completed' ? (
                    <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
                <p className="text-sm text-foreground">{meeting.student}</p>
                <p className="text-xs text-muted-foreground">{meeting.type}</p>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <ContentCard title="Recent Activity">
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    {activity.action} for <span className="font-medium">{activity.student}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>

        {/* Quick Actions */}
        <ContentCard title="Quick Actions">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/counselor/students"
              className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-center"
            >
              <svg className="w-8 h-8 mx-auto text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="text-sm font-medium text-foreground">Add Student</span>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-foreground">Add Resource</span>
            </Link>
            <Link
              href="/counselor/tasks"
              className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-center"
            >
              <svg className="w-8 h-8 mx-auto text-warning mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-sm font-medium text-foreground">Send Announcement</span>
            </Link>
          </div>
        </ContentCard>
      </div>
    </div>
  );
}
