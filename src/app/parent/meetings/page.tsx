'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  type: string;
  status: string;
  counselorName: string;
  studentName: string;
}

export default function ParentMeetingsPage() {
  const { user, getSchoolStudents } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    if (!user?.id || !user?.schoolId) return;

    const loadMeetings = async () => {
      const allStudents = getSchoolStudents(user.schoolId);
      const childIds: string[] = [];
      const studentNameById = new Map<string, string>();

      allStudents.forEach((student) => {
        studentNameById.set(student.id, `${student.firstName} ${student.lastName}`);
      });

      if (user.childrenNames) {
        for (const name of user.childrenNames) {
          const match = allStudents.find(
            s => `${s.firstName} ${s.lastName}`.toLowerCase() === name.toLowerCase().trim()
          );
          if (match) childIds.push(match.id);
        }
      }

      if (childIds.length === 0) return;

      const { data } = await supabase
        .from('meetings')
        .select('*')
        .in('student_id', childIds)
        .order('created_at', { ascending: false });

      setMeetings(
        (data || []).map(row => ({
          id: row.id,
          title: row.title,
          date: row.date,
          time: row.time,
          type: row.type,
          status: row.status,
          counselorName: row.counselor_name,
          studentName: studentNameById.get(row.student_id) || '',
        }))
      );
    };

    loadMeetings();
  }, [user?.id, user?.schoolId, user?.childrenNames, getSchoolStudents]);

  const upcoming = meetings.filter(m => m.status === 'confirmed' || m.status === 'pending');
  const past = meetings.filter(m => m.status === 'completed' || m.status === 'cancelled');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Meetings</h1>
        <p className="text-muted-foreground mt-1">Your children&apos;s meetings with counselors</p>
      </div>

      {meetings.length === 0 ? (
        <Card className="p-8 text-center">
          <svg className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="font-medium text-foreground">No meetings yet</p>
          <p className="text-sm text-muted-foreground mt-1">Meetings booked by your children will appear here.</p>
        </Card>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map(m => (
                  <Card key={m.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{m.title}</p>
                        <p className="text-sm text-muted-foreground">{m.date} at {m.time} &bull; with {m.counselorName}</p>
                        {m.studentName && <p className="text-xs text-muted-foreground mt-1">Student: {m.studentName}</p>}
                      </div>
                      <Badge variant={m.status === 'confirmed' ? 'success' : 'warning'}>{m.status}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Past</h2>
              <div className="space-y-3">
                {past.map(m => (
                  <Card key={m.id} className="p-4 opacity-70">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{m.title}</p>
                        <p className="text-sm text-muted-foreground">{m.date} at {m.time} &bull; {m.counselorName}</p>
                      </div>
                      <Badge variant={m.status === 'completed' ? 'success' : 'destructive'} size="sm">{m.status}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
