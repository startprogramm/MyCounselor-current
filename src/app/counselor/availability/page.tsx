'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Json } from '@/lib/database.types';

type DayId = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

interface BreakRange {
  start: string;
  end: string;
}

interface DaySchedule {
  enabled: boolean;
  start: string;
  end: string;
  breaks: BreakRange[];
}

type WeeklySchedule = Record<DayId, DaySchedule>;

interface BlockedSlot {
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM
  reason?: string;
}

const weekDays: { id: DayId; label: string }[] = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
];

const defaultSchedule: WeeklySchedule = {
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

function toMinutes(value: string) {
  const [hoursText, minutesText] = value.split(':');
  const hours = Number(hoursText);
  const minutes = Number(minutesText);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;
  return hours * 60 + minutes;
}

function fromMinutes(value: number) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function toTwelveHourLabel(value: string) {
  const [hoursText, minutesText] = value.split(':');
  const hours = Number(hoursText);
  const minutes = Number(minutesText);
  const period = hours >= 12 ? 'PM' : 'AM';
  const normalizedHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${normalizedHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

function normalizeBreakRanges(value: unknown): BreakRange[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry) => !!entry && typeof entry === 'object')
    .map((entry) => {
      const record = entry as Record<string, unknown>;
      const start = typeof record.start === 'string' ? record.start : '';
      const end = typeof record.end === 'string' ? record.end : '';
      return { start, end };
    })
    .filter((entry) => toMinutes(entry.end) > toMinutes(entry.start));
}

function normalizeWeeklySchedule(value: unknown): WeeklySchedule {
  const parsed = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const normalized = { ...defaultSchedule } as WeeklySchedule;

  weekDays.forEach(({ id }) => {
    const rawDay = parsed[id];
    if (!rawDay || typeof rawDay !== 'object') return;

    const day = rawDay as Record<string, unknown>;
    const start = typeof day.start === 'string' ? day.start : defaultSchedule[id].start;
    const end = typeof day.end === 'string' ? day.end : defaultSchedule[id].end;
    const enabled = typeof day.enabled === 'boolean' ? day.enabled : defaultSchedule[id].enabled;

    normalized[id] = {
      enabled,
      start,
      end,
      breaks: normalizeBreakRanges(day.breaks),
    };
  });

  return normalized;
}

function normalizeBlockedSlots(value: unknown): BlockedSlot[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((entry) => !!entry && typeof entry === 'object')
    .map((entry) => {
      const record = entry as Record<string, unknown>;
      const date = typeof record.date === 'string' ? record.date : '';
      const start = typeof record.start === 'string' ? record.start : '';
      const end = typeof record.end === 'string' ? record.end : '';
      const reason = typeof record.reason === 'string' ? record.reason : '';
      return { date, start, end, reason };
    })
    .filter((entry) => entry.date && toMinutes(entry.end) > toMinutes(entry.start))
    .sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
}

function calculateDayWorkMinutes(day: DaySchedule) {
  if (!day.enabled) return 0;
  const totalMinutes = Math.max(0, toMinutes(day.end) - toMinutes(day.start));
  const breakMinutes = day.breaks.reduce((sum, breakRange) => {
    return sum + Math.max(0, toMinutes(breakRange.end) - toMinutes(breakRange.start));
  }, 0);
  return Math.max(0, totalMinutes - breakMinutes);
}

function computeApproxSlots(schedule: WeeklySchedule, duration: number, buffer: number) {
  const slotSpan = Math.max(5, duration + buffer);
  return weekDays.reduce((sum, { id }) => {
    const workMinutes = calculateDayWorkMinutes(schedule[id]);
    return sum + Math.floor(workMinutes / slotSpan);
  }, 0);
}

function validateWeeklySchedule(schedule: WeeklySchedule): string | null {
  for (const { id, label } of weekDays) {
    const day = schedule[id];
    if (!day.enabled) continue;

    if (toMinutes(day.end) <= toMinutes(day.start)) {
      return `${label}: end time must be after start time.`;
    }

    for (const breakRange of day.breaks) {
      if (
        toMinutes(breakRange.start) < toMinutes(day.start) ||
        toMinutes(breakRange.end) > toMinutes(day.end) ||
        toMinutes(breakRange.end) <= toMinutes(breakRange.start)
      ) {
        return `${label}: break range is invalid.`;
      }
    }
  }
  return null;
}

export default function CounselorAvailabilityPage() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<WeeklySchedule>(defaultSchedule);
  const [meetingDuration, setMeetingDuration] = useState(30);
  const [bufferTime, setBufferTime] = useState(10);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);

  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockStart, setNewBlockStart] = useState('09:00');
  const [newBlockEnd, setNewBlockEnd] = useState('10:00');
  const [newBlockReason, setNewBlockReason] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const loadAvailability = useCallback(async () => {
    if (!user?.id || !user.schoolId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setSaveError('');

    const { data, error } = await supabase
      .from('counselor_availability')
      .select('*')
      .eq('counselor_id', user.id)
      .maybeSingle();

    if (error) {
      setSaveError(error.message || 'Unable to load your saved availability.');
      setIsLoading(false);
      return;
    }

    if (data) {
      setSchedule(normalizeWeeklySchedule(data.weekly_schedule));
      setBlockedSlots(normalizeBlockedSlots(data.blocked_slots));
      setMeetingDuration(data.meeting_duration || 30);
      setBufferTime(data.buffer_time || 10);
    } else {
      setSchedule(defaultSchedule);
      setBlockedSlots([]);
      setMeetingDuration(30);
      setBufferTime(10);
    }

    setIsLoading(false);
  }, [user?.id, user?.schoolId]);

  useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

  const toggleDay = (dayId: DayId) => {
    setSchedule((previous) => ({
      ...previous,
      [dayId]: {
        ...previous[dayId],
        enabled: !previous[dayId].enabled,
      },
    }));
  };

  const updateDayTime = (dayId: DayId, field: 'start' | 'end', value: string) => {
    setSchedule((previous) => ({
      ...previous,
      [dayId]: {
        ...previous[dayId],
        [field]: value,
      },
    }));
  };

  const updateDayBreak = (dayId: DayId, field: 'start' | 'end', value: string) => {
    setSchedule((previous) => ({
      ...previous,
      [dayId]: {
        ...previous[dayId],
        breaks: [{ ...previous[dayId].breaks[0], [field]: value }],
      },
    }));
  };

  const addBlockedSlot = () => {
    setSaveError('');
    if (!newBlockDate) {
      setSaveError('Please choose a date for blocked time.');
      return;
    }

    if (toMinutes(newBlockEnd) <= toMinutes(newBlockStart)) {
      setSaveError('Blocked slot end time must be after start time.');
      return;
    }

    const nextSlot: BlockedSlot = {
      date: newBlockDate,
      start: newBlockStart,
      end: newBlockEnd,
      reason: newBlockReason.trim() || undefined,
    };

    setBlockedSlots((previous) =>
      [...previous, nextSlot].sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`))
    );
    setNewBlockDate('');
    setNewBlockReason('');
  };

  const removeBlockedSlot = (index: number) => {
    setBlockedSlots((previous) => previous.filter((_, currentIndex) => currentIndex !== index));
  };

  const saveAvailability = async () => {
    if (!user?.id || !user.schoolId) return;

    const validationError = validateWeeklySchedule(schedule);
    if (validationError) {
      setSaveError(validationError);
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess('');

    const payload = {
      counselor_id: user.id,
      school_id: user.schoolId,
      weekly_schedule: schedule as unknown as Json,
      blocked_slots: blockedSlots as unknown as Json,
      meeting_duration: meetingDuration,
      buffer_time: bufferTime,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('counselor_availability')
      .upsert(payload, { onConflict: 'counselor_id' });

    if (error) {
      setSaveError(error.message || 'Unable to save availability right now.');
      setIsSaving(false);
      return;
    }

    setSaveSuccess('Availability saved successfully.');
    window.setTimeout(() => setSaveSuccess(''), 3000);
    setIsSaving(false);
  };

  const summary = useMemo(() => {
    const workingDays = weekDays.filter(({ id }) => schedule[id].enabled).length;
    const totalMinutes = weekDays.reduce((sum, { id }) => sum + calculateDayWorkMinutes(schedule[id]), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const totalSlots = computeApproxSlots(schedule, meetingDuration, bufferTime);
    return { workingDays, totalHours, totalSlots };
  }, [schedule, meetingDuration, bufferTime]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Availability</h1>
          <p className="text-muted-foreground mt-1">Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Availability</h1>
          <p className="text-muted-foreground mt-1">Set your working hours and meeting preferences</p>
        </div>
        <Button onClick={saveAvailability} isLoading={isSaving}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Save Changes
        </Button>
      </div>

      {saveError && (
        <Card className="p-4 border-destructive/30 bg-destructive/5">
          <p className="text-sm font-medium text-destructive">{saveError}</p>
        </Card>
      )}

      {saveSuccess && (
        <Card className="p-4 border-success/30 bg-success/5">
          <p className="text-sm font-medium text-success">{saveSuccess}</p>
        </Card>
      )}

      <ContentCard title="Meeting Settings">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Default Meeting Duration
            </label>
            <select
              value={String(meetingDuration)}
              onChange={(event) => setMeetingDuration(Number(event.target.value))}
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
              value={String(bufferTime)}
              onChange={(event) => setBufferTime(Number(event.target.value))}
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

      <ContentCard title="Weekly Schedule">
        <div className="space-y-4">
          {weekDays.map((day) => {
            const daySchedule = schedule[day.id];
            const dayHasBreak = daySchedule.breaks.length > 0;
            const breakRange = dayHasBreak ? daySchedule.breaks[0] : null;

            return (
              <div
                key={day.id}
                className={`p-4 rounded-lg border transition-colors ${
                  daySchedule.enabled ? 'bg-card border-border' : 'bg-muted/30 border-border opacity-70'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      aria-pressed={daySchedule.enabled}
                      className={`relative inline-flex w-12 h-6 items-center overflow-hidden flex-shrink-0 rounded-full transition-colors border ${
                        daySchedule.enabled
                          ? 'bg-primary border-primary/60'
                          : 'bg-muted border-border'
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                          daySchedule.enabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    <span className="font-medium text-foreground min-w-[100px]">{day.label}</span>
                  </div>

                  {daySchedule.enabled ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={daySchedule.start}
                        onChange={(event) => updateDayTime(day.id, 'start', event.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-input bg-card text-foreground text-sm"
                      >
                        {timeOptions.map((time) => (
                          <option key={`${day.id}-start-${time}`} value={time}>
                            {toTwelveHourLabel(time)}
                          </option>
                        ))}
                      </select>
                      <span className="text-muted-foreground text-sm">to</span>
                      <select
                        value={daySchedule.end}
                        onChange={(event) => updateDayTime(day.id, 'end', event.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-input bg-card text-foreground text-sm"
                      >
                        {timeOptions.map((time) => (
                          <option key={`${day.id}-end-${time}`} value={time}>
                            {toTwelveHourLabel(time)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unavailable</span>
                  )}
                </div>

                {daySchedule.enabled && breakRange && (
                  <div className="mt-3 lg:ml-16 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Break</span>
                    <select
                      value={breakRange.start}
                      onChange={(event) => updateDayBreak(day.id, 'start', event.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-input bg-card text-foreground text-sm"
                    >
                      {timeOptions.map((time) => (
                        <option key={`${day.id}-break-start-${time}`} value={time}>
                          {toTwelveHourLabel(time)}
                        </option>
                      ))}
                    </select>
                    <span className="text-muted-foreground">to</span>
                    <select
                      value={breakRange.end}
                      onChange={(event) => updateDayBreak(day.id, 'end', event.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-input bg-card text-foreground text-sm"
                    >
                      {timeOptions.map((time) => (
                        <option key={`${day.id}-break-end-${time}`} value={time}>
                          {toTwelveHourLabel(time)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ContentCard>

      <ContentCard title="Block Time Off" description="Block dates or times when you are unavailable">
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              type="date"
              value={newBlockDate}
              onChange={(event) => setNewBlockDate(event.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-card text-foreground"
            />
            <select
              value={newBlockStart}
              onChange={(event) => setNewBlockStart(event.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-card text-foreground"
            >
              {timeOptions.map((time) => (
                <option key={`block-start-${time}`} value={time}>
                  {toTwelveHourLabel(time)}
                </option>
              ))}
            </select>
            <select
              value={newBlockEnd}
              onChange={(event) => setNewBlockEnd(event.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-card text-foreground"
            >
              {timeOptions.map((time) => (
                <option key={`block-end-${time}`} value={time}>
                  {toTwelveHourLabel(time)}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newBlockReason}
              onChange={(event) => setNewBlockReason(event.target.value)}
              placeholder="Reason (optional)"
              className="px-3 py-2 rounded-lg border border-input bg-card text-foreground"
            />
            <Button type="button" variant="outline" onClick={addBlockedSlot}>
              Add Block
            </Button>
          </div>

          {blockedSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No blocked times configured.</p>
          ) : (
            <div className="space-y-2">
              {blockedSlots.map((slot, index) => (
                <div key={`${slot.date}-${slot.start}-${slot.end}-${index}`} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {slot.date} | {toTwelveHourLabel(slot.start)} - {toTwelveHourLabel(slot.end)}
                    </p>
                    {slot.reason && <p className="text-xs text-muted-foreground mt-0.5">{slot.reason}</p>}
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeBlockedSlot(index)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </ContentCard>

      <Card className="p-6 bg-primary/5 border-primary/20">
        <h3 className="font-semibold text-foreground mb-4">Availability Summary</h3>
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-primary">{summary.totalHours}</p>
            <p className="text-sm text-muted-foreground">Hours per week</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">{summary.totalSlots}</p>
            <p className="text-sm text-muted-foreground">Approx. slots/week</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">{summary.workingDays}</p>
            <p className="text-sm text-muted-foreground">Working days</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
