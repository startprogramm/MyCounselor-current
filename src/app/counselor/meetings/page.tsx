'use client';

import React, { useState, useEffect } from 'react';
import { Card, ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Meeting {
  id: number;
  title: string;
  counselor: string;
  date: string;
  time: string;
  type: string;
  status: string;
}

function mapMeeting(row: {
  id: number;
  title: string;
  counselor_name: string;
  date: string;
  time: string;
  type: string;
  status: string;
}): Meeting {
  return {
    id: row.id,
    title: row.title,
    counselor: row.counselor_name,
    date: row.date,
    time: row.time,
    type: row.type,
    status: row.status,
  };
}

export default function CounselorMeetingsPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [view, setView] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

  useEffect(() => {
    if (!user?.id) return;

    const loadMeetings = async () => {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('counselor_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !data) {
        setMeetings([]);
        return;
      }

      setMeetings(data.map(mapMeeting));
    };

    loadMeetings();
  }, [user?.id]);

  const updateMeetingStatus = async (id: number, newStatus: string) => {
    const { error } = await supabase.from('meetings').update({ status: newStatus }).eq('id', id);
    if (error) return;
    setMeetings((prev) => prev.map((meeting) => (meeting.id === id ? { ...meeting, status: newStatus } : meeting)));
  };

  const upcomingMeetings = meetings.filter(m => m.status === 'confirmed' || m.status === 'pending');
  const pastMeetings = meetings.filter(m => m.status === 'completed');
  const cancelledMeetings = meetings.filter(m => m.status === 'cancelled');

  const displayedMeetings = view === 'upcoming' ? upcomingMeetings
    : view === 'past' ? pastMeetings
    : cancelledMeetings;

  const counts = {
    upcoming: upcomingMeetings.length,
    past: pastMeetings.length,
    cancelled: cancelledMeetings.length,
  };

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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary">{counts.upcoming}</p>
          <p className="text-sm text-muted-foreground">Upcoming</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-success">{counts.past}</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-muted-foreground">{counts.cancelled}</p>
          <p className="text-sm text-muted-foreground">Cancelled</p>
        </Card>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2">
        {(['upcoming', 'past', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setView(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              view === tab
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              view === tab ? 'bg-primary-foreground/20' : 'bg-background'
            }`}>
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Meetings List */}
      {displayedMeetings.length > 0 ? (
        <div className="space-y-3">
          {displayedMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className={`flex items-center justify-between p-4 bg-card rounded-xl border transition-all ${
                meeting.status === 'completed' || meeting.status === 'cancelled'
                  ? 'border-border opacity-60'
                  : 'border-primary/20 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[80px]">
                  <p className="font-semibold text-foreground">{meeting.date}</p>
                  <p className="text-sm text-muted-foreground">{meeting.time}</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <p className="font-medium text-foreground">{meeting.title}</p>
                  <p className="text-sm text-muted-foreground">{meeting.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {meeting.status === 'completed' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                    Completed
                  </span>
                ) : meeting.status === 'cancelled' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    Cancelled
                  </span>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => updateMeetingStatus(meeting.id, 'cancelled')}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => updateMeetingStatus(meeting.id, 'completed')}>
                      Complete
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <svg className="w-12 h-12 mx-auto text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-muted-foreground">
            {view === 'upcoming' ? 'No upcoming meetings' :
             view === 'past' ? 'No completed meetings yet' :
             'No cancelled meetings'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Meetings booked by students will appear here
          </p>
        </div>
      )}
    </div>
  );
}
