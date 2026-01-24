'use client';

import React, { useState } from 'react';
import { Card, ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const weekDays = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
];

const defaultSchedule = {
  monday: { enabled: true, start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
  tuesday: { enabled: true, start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
  wednesday: { enabled: true, start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
  thursday: { enabled: true, start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
  friday: { enabled: true, start: '09:00', end: '15:00', breaks: [] },
};

const timeOptions = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00',
];

export default function CounselorAvailabilityPage() {
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [meetingDuration, setMeetingDuration] = useState('30');
  const [bufferTime, setBufferTime] = useState('10');

  const toggleDay = (dayId: string) => {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: { ...prev[dayId as keyof typeof prev], enabled: !prev[dayId as keyof typeof prev].enabled },
    }));
  };

  const updateTime = (dayId: string, field: 'start' | 'end', value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: { ...prev[dayId as keyof typeof prev], [field]: value },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
            Availability
          </h1>
          <p className="text-muted-foreground mt-1">
            Set your working hours and meeting preferences
          </p>
        </div>
        <Button>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Save Changes
        </Button>
      </div>

      {/* Meeting Settings */}
      <ContentCard title="Meeting Settings">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Default Meeting Duration
            </label>
            <select
              value={meetingDuration}
              onChange={(e) => setMeetingDuration(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Buffer Time Between Meetings
            </label>
            <select
              value={bufferTime}
              onChange={(e) => setBufferTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground"
            >
              <option value="0">No buffer</option>
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
            </select>
          </div>
        </div>
      </ContentCard>

      {/* Weekly Schedule */}
      <ContentCard title="Weekly Schedule">
        <div className="space-y-4">
          {weekDays.map((day) => {
            const daySchedule = schedule[day.id as keyof typeof schedule];
            return (
              <div
                key={day.id}
                className={`p-4 rounded-lg border transition-colors ${
                  daySchedule.enabled
                    ? 'bg-card border-border'
                    : 'bg-muted/30 border-border opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleDay(day.id)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        daySchedule.enabled ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          daySchedule.enabled ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="font-medium text-foreground min-w-[100px]">{day.label}</span>
                  </div>
                  {daySchedule.enabled && (
                    <div className="flex items-center gap-3">
                      <select
                        value={daySchedule.start}
                        onChange={(e) => updateTime(day.id, 'start', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-input bg-card text-foreground text-sm"
                      >
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <span className="text-muted-foreground">to</span>
                      <select
                        value={daySchedule.end}
                        onChange={(e) => updateTime(day.id, 'end', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-input bg-card text-foreground text-sm"
                      >
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                {daySchedule.enabled && daySchedule.breaks.length > 0 && (
                  <div className="mt-3 pl-16">
                    <p className="text-sm text-muted-foreground">
                      Break: {daySchedule.breaks[0].start} - {daySchedule.breaks[0].end}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ContentCard>

      {/* Block Time Off */}
      <ContentCard
        title="Block Time Off"
        description="Block specific dates or times when you're unavailable"
        action={
          <Button variant="outline" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Block
          </Button>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center text-destructive">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-foreground">Professional Development Day</p>
                <p className="text-sm text-muted-foreground">February 14, 2026 - All Day</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">Remove</Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center text-warning">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-foreground">Staff Meeting</p>
                <p className="text-sm text-muted-foreground">Every Monday, 8:00 AM - 9:00 AM</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">Remove</Button>
          </div>
        </div>
      </ContentCard>

      {/* Summary */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <h3 className="font-semibold text-foreground mb-4">Your Availability Summary</h3>
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-primary">36</p>
            <p className="text-sm text-muted-foreground">Hours per week</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">72</p>
            <p className="text-sm text-muted-foreground">Available slots</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">5</p>
            <p className="text-sm text-muted-foreground">Working days</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
