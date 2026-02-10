'use client';

import React from 'react';
import Link from 'next/link';
import { StatsCard, ContentCard } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';

const stats = [
  { title: 'Counselor Meetings', value: 2, subtitle: 'This semester' },
  { title: 'New Messages', value: 2, subtitle: 'Unread' },
  { title: 'Goals Progress', value: '75%', subtitle: 'On track' },
  { title: 'Resources Viewed', value: 8, subtitle: 'This month' },
];

const childProgress = {
  name: 'Alex Smith',
  grade: '10th Grade',
  counselor: 'Ms. Sarah Martinez',
  goals: [
    { name: 'Improve Math grade', progress: 80, status: 'on-track' },
    { name: 'Join 2 extracurriculars', progress: 50, status: 'in-progress' },
    { name: 'Complete SAT prep', progress: 30, status: 'in-progress' },
  ],
  recentUpdates: [
    { date: 'Jan 23', update: 'Attended college planning workshop' },
    { date: 'Jan 20', update: 'Met with counselor for goal review' },
    { date: 'Jan 15', update: 'Joined robotics club' },
  ],
};

const recentMessages = [
  { id: 1, from: 'Ms. Martinez (Counselor)', subject: 'Monthly progress update', time: '2 hours ago', unread: true },
  { id: 2, from: 'Mr. Johnson (Teacher)', subject: 'Math improvement noticed', time: 'Yesterday', unread: true },
  { id: 3, from: 'School Admin', subject: 'Parent-teacher conference reminder', time: '2 days ago', unread: false },
];

const upcomingEvents = [
  { id: 1, title: 'Parent-Teacher Conference', date: 'Jan 28, 3:00 PM', type: 'meeting' },
  { id: 2, title: 'College Fair', date: 'Feb 5, 6:00 PM', type: 'event' },
  { id: 3, title: 'Counselor Check-in', date: 'Feb 10, 2:30 PM', type: 'meeting' },
];

const recommendedResources = [
  { id: 1, title: 'Supporting Your Teen Through High School', type: 'article' },
  { id: 2, title: 'College Application Timeline', type: 'guide' },
  { id: 3, title: 'Understanding SAT/ACT Scores', type: 'video' },
];

export default function ParentDashboardPage() {
  const { user } = useAuth();

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-success';
    if (progress >= 40) return 'bg-amber-500';
    return 'bg-destructive';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
            Welcome back, {user?.firstName || 'Parent'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay connected with your child&apos;s educational journey.
          </p>
          {user?.childrenNames && user.childrenNames.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Parent of {user.childrenNames.join(', ')}
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
            icon={
              index === 0 ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ) : index === 1 ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              ) : index === 2 ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              )
            }
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Child Progress */}
        <ContentCard
          title={`${childProgress.name}'s Progress`}
          description={`${childProgress.grade} • Counselor: ${childProgress.counselor}`}
          action={
            <Link href="/parent/progress" className="text-sm text-rose-500 hover:text-rose-600">
              Full report
            </Link>
          }
          className="lg:col-span-2"
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Current Goals</h4>
              {childProgress.goals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{goal.name}</span>
                    <span className="text-muted-foreground">{goal.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(goal.progress)} transition-all`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-3">Recent Updates</h4>
              <div className="space-y-2">
                {childProgress.recentUpdates.map((update, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <span className="text-muted-foreground w-16 flex-shrink-0">{update.date}</span>
                    <span className="text-foreground">{update.update}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ContentCard>

        {/* Upcoming Events */}
        <ContentCard
          title="Upcoming Events"
          action={
            <Link href="/parent/meetings" className="text-sm text-rose-500 hover:text-rose-600">
              View calendar
            </Link>
          }
        >
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="p-3 rounded-lg border bg-rose-500/5 border-rose-500/20"
              >
                <div className="flex items-center gap-2 mb-1">
                  {event.type === 'meeting' ? (
                    <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  <span className="font-medium text-sm text-foreground">{event.title}</span>
                </div>
                <p className="text-xs text-muted-foreground ml-6">{event.date}</p>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <ContentCard
          title="Recent Messages"
          action={
            <Link href="/parent/messages" className="text-sm text-rose-500 hover:text-rose-600">
              View all
            </Link>
          }
        >
          <div className="space-y-3">
            {recentMessages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg border ${message.unread ? 'bg-rose-500/5 border-rose-500/20' : 'bg-muted/30 border-border'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm ${message.unread ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>
                    {message.from}
                  </span>
                  {message.unread && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                </div>
                <p className="text-sm text-muted-foreground truncate">{message.subject}</p>
                <p className="text-xs text-muted-foreground mt-1">{message.time}</p>
              </div>
            ))}
          </div>
        </ContentCard>

        {/* Quick Actions & Resources */}
        <ContentCard title="Quick Actions">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Link
              href="/parent/messages"
              className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-center"
            >
              <svg className="w-8 h-8 mx-auto text-rose-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-medium text-foreground">Message Counselor</span>
            </Link>
            <Link
              href="/parent/meetings"
              className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-center"
            >
              <svg className="w-8 h-8 mx-auto text-secondary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-foreground">Book Meeting</span>
            </Link>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-medium text-foreground mb-3">Recommended for You</h4>
            <div className="space-y-2">
              {recommendedResources.map((resource) => (
                <Link
                  key={resource.id}
                  href="/parent/resources"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded bg-rose-500/10 flex items-center justify-center">
                    {resource.type === 'article' ? (
                      <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : resource.type === 'video' ? (
                      <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{resource.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{resource.type}</p>
                  </div>
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </ContentCard>
      </div>
    </div>
  );
}
