'use client';

import React, { useState } from 'react';
import { Card, ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const mockMeetings = {
  today: [
    { id: 1, student: 'Alex Johnson', time: '9:00 AM', duration: '30 min', type: 'College Review', status: 'completed' },
    { id: 2, student: 'Emily Rodriguez', time: '10:30 AM', duration: '30 min', type: 'Career Guidance', status: 'completed' },
    { id: 3, student: 'James Wilson', time: '2:00 PM', duration: '30 min', type: 'Academic Support', status: 'upcoming' },
    { id: 4, student: 'Sarah Kim', time: '3:30 PM', duration: '30 min', type: 'Goal Setting', status: 'upcoming' },
    { id: 5, student: 'Michael Chen', time: '4:30 PM', duration: '30 min', type: 'College Prep', status: 'upcoming' },
  ],
  upcoming: [
    { id: 6, student: 'Lisa Park', date: 'Jan 27', time: '9:00 AM', duration: '30 min', type: 'Initial Consultation' },
    { id: 7, student: 'Alex Johnson', date: 'Jan 27', time: '2:00 PM', duration: '30 min', type: 'Essay Follow-up' },
    { id: 8, student: 'Tom Brown', date: 'Jan 28', time: '10:00 AM', duration: '30 min', type: 'Schedule Planning' },
    { id: 9, student: 'Emily Rodriguez', date: 'Jan 28', time: '3:00 PM', duration: '30 min', type: 'Recommendation Review' },
  ],
};

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const timeSlots = ['9:00', '10:00', '11:00', '12:00', '1:00', '2:00', '3:00', '4:00'];

export default function CounselorMeetingsPage() {
  const [view, setView] = useState<'list' | 'calendar'>('list');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
            Meetings
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage your meeting schedule
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'calendar' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      {view === 'list' ? (
        <>
          {/* Today's Meetings */}
          <ContentCard title="Today's Meetings" description="Friday, January 24, 2026">
            <div className="space-y-3">
              {mockMeetings.today.map((meeting) => (
                <div
                  key={meeting.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    meeting.status === 'completed'
                      ? 'bg-muted/30 border-border opacity-60'
                      : 'bg-primary/5 border-primary/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <p className="font-semibold text-foreground">{meeting.time}</p>
                      <p className="text-xs text-muted-foreground">{meeting.duration}</p>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div>
                      <p className="font-medium text-foreground">{meeting.student}</p>
                      <p className="text-sm text-muted-foreground">{meeting.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {meeting.status === 'completed' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                        Completed
                      </span>
                    ) : (
                      <>
                        <Button variant="outline" size="sm">Reschedule</Button>
                        <Button size="sm">Start Meeting</Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ContentCard>

          {/* Upcoming Meetings */}
          <ContentCard title="Upcoming Meetings">
            <div className="space-y-3">
              {mockMeetings.upcoming.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[80px]">
                      <p className="font-semibold text-foreground">{meeting.date}</p>
                      <p className="text-sm text-muted-foreground">{meeting.time}</p>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div>
                      <p className="font-medium text-foreground">{meeting.student}</p>
                      <p className="text-sm text-muted-foreground">{meeting.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">Cancel</Button>
                    <Button variant="outline" size="sm">Reschedule</Button>
                  </div>
                </div>
              ))}
            </div>
          </ContentCard>
        </>
      ) : (
        /* Calendar View */
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Week of January 27 - 31, 2026</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <Button variant="ghost" size="sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Header */}
              <div className="grid grid-cols-6 gap-2 mb-2">
                <div className="p-2" />
                {weekDays.map((day, i) => (
                  <div key={day} className="p-2 text-center">
                    <p className="text-sm font-medium text-muted-foreground">{day}</p>
                    <p className="text-lg font-semibold text-foreground">{27 + i}</p>
                  </div>
                ))}
              </div>
              {/* Time slots */}
              <div className="space-y-1">
                {timeSlots.map((time) => (
                  <div key={time} className="grid grid-cols-6 gap-2">
                    <div className="p-2 text-sm text-muted-foreground text-right">{time}</div>
                    {weekDays.map((day, i) => {
                      const hasEvent = Math.random() > 0.7;
                      return (
                        <div
                          key={`${day}-${time}`}
                          className={`p-2 rounded-lg border border-border min-h-[50px] ${
                            hasEvent ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted/50'
                          }`}
                        >
                          {hasEvent && (
                            <p className="text-xs font-medium text-primary truncate">
                              Student Meeting
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-foreground">5</p>
          <p className="text-sm text-muted-foreground">Today</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-foreground">18</p>
          <p className="text-sm text-muted-foreground">This Week</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-success">42</p>
          <p className="text-sm text-muted-foreground">This Month</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary">30 min</p>
          <p className="text-sm text-muted-foreground">Avg Duration</p>
        </Card>
      </div>
    </div>
  );
}
