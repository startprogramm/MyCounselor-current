'use client';

import React, { useState, useEffect, useCallback, useMemo, useLayoutEffect, useRef } from 'react';
import { ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { useAuth, User } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { startVisibilityAwarePolling } from '@/lib/polling';
import { makeUserCacheKey, readCachedData, writeCachedData } from '@/lib/client-cache';

interface Meeting {
  id: number;
  title: string;
  counselor: string;
  date: string;
  time: string;
  type: 'video' | 'in-person';
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  notes?: string;
}

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
  date: string;
  start: string;
  end: string;
}

interface CounselorAvailability {
  counselorId: string;
  meetingDuration: number;
  bufferTime: number;
  weeklySchedule: WeeklySchedule;
  blockedSlots: BlockedSlot[];
}

interface BusySlot {
  date: string;
  start: string;
  end: string;
}

interface AvailableSlot {
  start24: string;
  end24: string;
  label: string;
}

interface AvailableDay {
  dateKey: string;
  dateLabel: string;
  dateLong: string;
  slots: AvailableSlot[];
}

interface StudentMeetingsCachePayload {
  meetings: Meeting[];
  schoolCounselors: User[];
  counselorAvailability: CounselorAvailability[];
  counselorBusySlots: Record<string, BusySlot[]>;
}

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

const STUDENT_MEETINGS_CACHE_TTL_MS = 3 * 60 * 1000;

const weekDays: { id: DayId; jsDay: number }[] = [
  { id: 'monday', jsDay: 1 },
  { id: 'tuesday', jsDay: 2 },
  { id: 'wednesday', jsDay: 3 },
  { id: 'thursday', jsDay: 4 },
  { id: 'friday', jsDay: 5 },
];

const defaultWeeklySchedule: WeeklySchedule = {
  monday: { enabled: true, start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
  tuesday: { enabled: true, start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
  wednesday: { enabled: true, start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
  thursday: { enabled: true, start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
  friday: { enabled: true, start: '09:00', end: '15:00', breaks: [] },
};

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
    type: row.type === 'in-person' ? 'in-person' : 'video',
    status:
      row.status === 'confirmed' ||
      row.status === 'pending' ||
      row.status === 'completed' ||
      row.status === 'cancelled'
        ? row.status
        : 'pending',
  };
}

function toMinutes(value: string) {
  const [hoursText, minutesText] = value.split(':');
  const hours = Number(hoursText);
  const minutes = Number(minutesText);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;
  return hours * 60 + minutes;
}

function fromMinutes(value: number) {
  const normalized = Math.max(0, value);
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function toTwelveHour(value: string) {
  const [hoursText, minutesText] = value.split(':');
  const hours = Number(hoursText);
  const minutes = Number(minutesText);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  const period = hours >= 12 ? 'PM' : 'AM';
  const normalizedHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${normalizedHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

function parseTwelveHourToMinutes(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const suffix = match[3].toUpperCase();
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  const normalizedHours = suffix === 'PM' ? (hours % 12) + 12 : hours % 12;
  return normalizedHours * 60 + minutes;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toDayId(jsDay: number): DayId | null {
  const found = weekDays.find((day) => day.jsDay === jsDay);
  return found ? found.id : null;
}

function rangesOverlap(startA: number, endA: number, startB: number, endB: number) {
  return startA < endB && endA > startB;
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
  const normalized = { ...defaultWeeklySchedule } as WeeklySchedule;

  weekDays.forEach(({ id }) => {
    const rawDay = parsed[id];
    if (!rawDay || typeof rawDay !== 'object') return;
    const record = rawDay as Record<string, unknown>;
    const start = typeof record.start === 'string' ? record.start : defaultWeeklySchedule[id].start;
    const end = typeof record.end === 'string' ? record.end : defaultWeeklySchedule[id].end;
    const enabled =
      typeof record.enabled === 'boolean' ? record.enabled : defaultWeeklySchedule[id].enabled;
    const breaks = normalizeBreakRanges(record.breaks);

    normalized[id] = {
      enabled,
      start,
      end,
      breaks,
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
      return { date, start, end };
    })
    .filter((entry) => Boolean(entry.date) && toMinutes(entry.end) > toMinutes(entry.start))
    .sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
}

function parseMeetingDateKey(dateText: string): string | null {
  if (!dateText) return null;
  const parsed = new Date(dateText);
  if (Number.isNaN(parsed.getTime())) return null;
  return formatDateKey(parsed);
}

function parseMeetingTimeRange(timeText: string): { start: string; end: string } | null {
  const parts = timeText.split('-').map((part) => part.trim());
  if (parts.length < 2) return null;
  const startMinutes = parseTwelveHourToMinutes(parts[0]);
  const endMinutes = parseTwelveHourToMinutes(parts[1]);
  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) return null;
  return {
    start: fromMinutes(startMinutes),
    end: fromMinutes(endMinutes),
  };
}

function buildDefaultAvailability(counselorId: string): CounselorAvailability {
  return {
    counselorId,
    meetingDuration: 30,
    bufferTime: 10,
    weeklySchedule: defaultWeeklySchedule,
    blockedSlots: [],
  };
}

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

const meetingTopics = [
  { value: '', label: 'Select a topic' },
  { value: 'College Application Review', label: 'College Application Review' },
  { value: 'Career Exploration', label: 'Career Exploration' },
  { value: 'Academic Planning', label: 'Academic Planning' },
  { value: 'Schedule Change', label: 'Schedule Change' },
  { value: 'SAT/ACT Prep', label: 'SAT/ACT Prep' },
  { value: 'Personal Support', label: 'Personal Support' },
  { value: 'Other', label: 'Other' },
];

export default function StudentMeetingsPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [schoolCounselors, setSchoolCounselors] = useState<User[]>([]);
  const [counselorAvailability, setCounselorAvailability] = useState<CounselorAvailability[]>([]);
  const [counselorBusySlots, setCounselorBusySlots] = useState<Record<string, BusySlot[]>>({});

  const [showBooking, setShowBooking] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedMeetingType, setSelectedMeetingType] = useState<'video' | 'in-person'>('video');
  const [selectedDateKey, setSelectedDateKey] = useState('');
  const [selectedSlotStart24, setSelectedSlotStart24] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [viewingNotes, setViewingNotes] = useState<number | null>(null);
  const [bookingError, setBookingError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(false);
  const [hasWarmCache, setHasWarmCache] = useState(false);
  const [isCacheHydrated, setIsCacheHydrated] = useState(false);
  const [hasLoadedFromServer, setHasLoadedFromServer] = useState(false);

  const loadRequestIdRef = useRef(0);
  const meetingsRef = useRef<Meeting[]>([]);
  const emptyMeetingsStreakRef = useRef(0);
  const hasWarmCacheRef = useRef(false);
  const cacheKey = useMemo(
    () => (user?.id ? makeUserCacheKey('student-meetings', user.id, user.schoolId) : null),
    [user?.id, user?.schoolId]
  );

  useEffect(() => {
    meetingsRef.current = meetings;
  }, [meetings]);

  useEffect(() => {
    hasWarmCacheRef.current = hasWarmCache;
  }, [hasWarmCache]);

  useLayoutEffect(() => {
    setIsCacheHydrated(false);
    setHasLoadedFromServer(false);

    if (!cacheKey) {
      setMeetings([]);
      setSchoolCounselors([]);
      setCounselorAvailability([]);
      setCounselorBusySlots({});
      setHasWarmCache(false);
      setIsCacheHydrated(true);
      return;
    }

    const cached = readCachedData<StudentMeetingsCachePayload>(cacheKey, STUDENT_MEETINGS_CACHE_TTL_MS);
    if (cached.found && cached.data) {
      setMeetings(cached.data.meetings || []);
      setSchoolCounselors(cached.data.schoolCounselors || []);
      setCounselorAvailability(cached.data.counselorAvailability || []);
      setCounselorBusySlots(cached.data.counselorBusySlots || {});
      setHasWarmCache(true);
      setIsCacheHydrated(true);
      return;
    }

    setHasWarmCache(false);
    setIsCacheHydrated(true);
  }, [cacheKey]);

  useEffect(() => {
    if (!cacheKey || !isCacheHydrated) return;
    if (!hasWarmCache && !hasLoadedFromServer) return;
    writeCachedData<StudentMeetingsCachePayload>(cacheKey, {
      meetings,
      schoolCounselors,
      counselorAvailability,
      counselorBusySlots,
    });
  }, [
    cacheKey,
    isCacheHydrated,
    hasWarmCache,
    hasLoadedFromServer,
    meetings,
    schoolCounselors,
    counselorAvailability,
    counselorBusySlots,
  ]);

  const loadMeetingsData = useCallback(
    async (options?: { silent?: boolean }) => {
      const requestId = loadRequestIdRef.current + 1;
      loadRequestIdRef.current = requestId;

      const silent = options?.silent === true;
      if (!silent) {
        setIsLoadingMeetings(true);
      }

      if (!user?.id || !user.schoolId) {
        if (loadRequestIdRef.current === requestId) {
          setMeetings([]);
          setSchoolCounselors([]);
          setCounselorAvailability([]);
          setCounselorBusySlots({});
          setLoadError('');
        }
        setIsLoadingMeetings(false);
        return;
      }

      const fetchMeetings = async () =>
        supabase
          .from('meetings')
          .select('*')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false });

      const [meetingsResult, counselorsResult] = await Promise.all([
        fetchMeetings(),
        supabase
          .from('profiles')
          .select('*')
          .eq('school_id', user.schoolId)
          .eq('role', 'counselor')
          .eq('approved', true),
      ]);

      if (loadRequestIdRef.current !== requestId) return;

      if (meetingsResult.error || !meetingsResult.data) {
        setLoadError(meetingsResult.error?.message || 'Unable to load meetings right now.');
        setIsLoadingMeetings(false);
        return;
      }

      if (counselorsResult.error || !counselorsResult.data) {
        setLoadError(counselorsResult.error?.message || 'Unable to load counselor availability.');
        setIsLoadingMeetings(false);
        return;
      }

      let mappedMeetings = meetingsResult.data.map(mapMeeting);

      if (mappedMeetings.length === 0 && meetingsRef.current.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 450));
        const retryMeetings = await fetchMeetings();
        if (loadRequestIdRef.current !== requestId) return;
        if (!retryMeetings.error && retryMeetings.data) {
          mappedMeetings = retryMeetings.data.map(mapMeeting);
        }
      }

      if (mappedMeetings.length === 0 && meetingsRef.current.length > 0) {
        emptyMeetingsStreakRef.current += 1;
        if (emptyMeetingsStreakRef.current < 2) {
          setLoadError('');
          setHasLoadedFromServer(true);
          setIsLoadingMeetings(false);
          return;
        }
      } else {
        emptyMeetingsStreakRef.current = 0;
      }

      const mappedCounselors = counselorsResult.data.map(mapProfileToUser);
      const counselorIds = mappedCounselors.map((counselor) => counselor.id);
      let mappedAvailability: CounselorAvailability[] = [];
      let busyByCounselor: Record<string, BusySlot[]> = {};

      if (counselorIds.length > 0) {
        const [availabilityResult, busyResult] = await Promise.all([
          supabase.from('counselor_availability').select('*').in('counselor_id', counselorIds),
          supabase
            .from('meetings')
            .select('counselor_id,date,time,status')
            .in('counselor_id', counselorIds)
            .in('status', ['pending', 'confirmed']),
        ]);

        if (!availabilityResult.error && availabilityResult.data) {
          mappedAvailability = availabilityResult.data.map((row) => ({
            counselorId: row.counselor_id,
            meetingDuration: row.meeting_duration || 30,
            bufferTime: row.buffer_time || 10,
            weeklySchedule: normalizeWeeklySchedule(row.weekly_schedule),
            blockedSlots: normalizeBlockedSlots(row.blocked_slots),
          }));
        }

        if (!busyResult.error && busyResult.data) {
          busyByCounselor = busyResult.data.reduce<Record<string, BusySlot[]>>((accumulator, row) => {
            const dateKey = parseMeetingDateKey(row.date);
            const parsedRange = parseMeetingTimeRange(row.time);
            if (!dateKey || !parsedRange) return accumulator;
            const current = accumulator[row.counselor_id] || [];
            current.push({ date: dateKey, start: parsedRange.start, end: parsedRange.end });
            accumulator[row.counselor_id] = current;
            return accumulator;
          }, {});
        }
      }

      if (loadRequestIdRef.current !== requestId) return;

      setLoadError('');
      setHasLoadedFromServer(true);
      setMeetings(mappedMeetings);
      setSchoolCounselors(mappedCounselors);
      setCounselorAvailability(mappedAvailability);
      setCounselorBusySlots(busyByCounselor);
      setIsLoadingMeetings(false);
    },
    [user?.id, user?.schoolId]
  );

  useEffect(() => {
    if (!user?.id) {
      setMeetings([]);
      setSchoolCounselors([]);
      setIsLoadingMeetings(false);
      return;
    }
    if (!isCacheHydrated) return;

    setIsLoadingMeetings(!hasWarmCacheRef.current);
    void loadMeetingsData().finally(() => setIsLoadingMeetings(false));
    return startVisibilityAwarePolling(() => loadMeetingsData({ silent: true }), 15000);
  }, [user?.id, isCacheHydrated, loadMeetingsData]);

  const counselorOptions = useMemo(
    () =>
      schoolCounselors.map((c) => ({
        value: c.id,
        label: `${c.firstName} ${c.lastName}${c.department ? ` - ${c.department}` : ''}${c.title ? ` (${c.title})` : ''}`,
        name: `${c.firstName} ${c.lastName}`,
      })),
    [schoolCounselors]
  );

  useEffect(() => {
    if (!selectedCounselor) return;
    if (schoolCounselors.some((counselor) => counselor.id === selectedCounselor)) return;
    setSelectedCounselor('');
    setSelectedDateKey('');
    setSelectedSlotStart24('');
  }, [selectedCounselor, schoolCounselors]);

  const availableDays = useMemo(() => {
    if (!selectedCounselor) return [] as AvailableDay[];

    const availability =
      counselorAvailability.find((entry) => entry.counselorId === selectedCounselor) ||
      buildDefaultAvailability(selectedCounselor);
    const blocked = availability.blockedSlots || [];
    const busy = counselorBusySlots[selectedCounselor] || [];
    const generated: AvailableDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let offset = 1; offset <= 21 && generated.length < 8; offset += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      const dayId = toDayId(date.getDay());
      if (!dayId) continue;

      const daySchedule = availability.weeklySchedule[dayId];
      if (!daySchedule?.enabled) continue;

      const dateKey = formatDateKey(date);
      const dayBlocked = blocked.filter((slot) => slot.date === dateKey);
      const dayBusy = busy.filter((slot) => slot.date === dateKey);
      const duration = Math.max(15, availability.meetingDuration || 30);
      const step = Math.max(15, duration + (availability.bufferTime || 0));
      const dayStart = toMinutes(daySchedule.start);
      const dayEnd = toMinutes(daySchedule.end);

      const slots: AvailableSlot[] = [];
      for (let cursor = dayStart; cursor + duration <= dayEnd; cursor += step) {
        const slotStart = cursor;
        const slotEnd = cursor + duration;

        if (
          daySchedule.breaks.some((breakRange) =>
            rangesOverlap(slotStart, slotEnd, toMinutes(breakRange.start), toMinutes(breakRange.end))
          )
        ) {
          continue;
        }
        if (dayBlocked.some((slot) => rangesOverlap(slotStart, slotEnd, toMinutes(slot.start), toMinutes(slot.end)))) {
          continue;
        }
        if (dayBusy.some((slot) => rangesOverlap(slotStart, slotEnd, toMinutes(slot.start), toMinutes(slot.end)))) {
          continue;
        }

        const start24 = fromMinutes(slotStart);
        const end24 = fromMinutes(slotEnd);
        slots.push({
          start24,
          end24,
          label: `${toTwelveHour(start24)} - ${toTwelveHour(end24)}`,
        });
      }

      if (slots.length > 0) {
        generated.push({
          dateKey,
          dateLabel: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
          dateLong: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          slots,
        });
      }
    }

    return generated;
  }, [selectedCounselor, counselorAvailability, counselorBusySlots]);

  const selectedDay = useMemo(
    () => availableDays.find((day) => day.dateKey === selectedDateKey) || null,
    [availableDays, selectedDateKey]
  );
  const selectedSlot = useMemo(
    () => selectedDay?.slots.find((slot) => slot.start24 === selectedSlotStart24) || null,
    [selectedDay, selectedSlotStart24]
  );

  const handleConfirmBooking = async () => {
    if (!user || !selectedCounselor || !selectedDay || !selectedSlot || !selectedTopic) return;

    const counselor = counselorOptions.find((c) => c.value === selectedCounselor);
    if (!counselor) {
      setBookingError('Selected counselor could not be found. Please retry.');
      return;
    }

    setIsBooking(true);
    setBookingError('');

    const { data, error } = await supabase
      .from('meetings')
      .insert({
        title: selectedTopic,
        counselor_name: counselor.name,
        counselor_id: selectedCounselor,
        student_id: user.id,
        school_id: user.schoolId,
        date: selectedDay.dateLong,
        time: selectedSlot.label,
        type: selectedMeetingType,
        status: 'pending',
      })
      .select('*')
      .single();

    if (error || !data) {
      setBookingError(error?.message || 'Unable to book the meeting right now.');
      setIsBooking(false);
      return;
    }

    setMeetings((prev) => [mapMeeting(data), ...prev]);
    setCounselorBusySlots((previous) => {
      const busy = previous[selectedCounselor] || [];
      return {
        ...previous,
        [selectedCounselor]: [
          ...busy,
          {
            date: selectedDay.dateKey,
            start: selectedSlot.start24,
            end: selectedSlot.end24,
          },
        ],
      };
    });
    setHasLoadedFromServer(true);

    // Reset form
    setSelectedCounselor('');
    setSelectedTopic('');
    setSelectedDateKey('');
    setSelectedSlotStart24('');
    setSelectedMeetingType('video');
    setShowBooking(false);
    setSuccessMessage('Meeting booked successfully! Your counselor will review and confirm.');
    setTimeout(() => setSuccessMessage(''), 4000);
    setIsBooking(false);
  };

  const handleCancelMeeting = async (id: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('meetings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('student_id', user.id);

    if (error) return;
    setHasLoadedFromServer(true);
    setMeetings((prev) => prev.map((meeting) => (meeting.id === id ? { ...meeting, status: 'cancelled' } : meeting)));
  };

  const upcomingMeetings = meetings.filter(m => m.status === 'confirmed' || m.status === 'pending');
  const pastMeetings = meetings.filter(m => m.status === 'completed');
  const cancelledMeetings = meetings.filter(m => m.status === 'cancelled');
  const showLoadingState =
    (!isCacheHydrated && !!user?.id) ||
    (isLoadingMeetings && meetings.length === 0) ||
    (isCacheHydrated && !hasWarmCache && !hasLoadedFromServer && !!user?.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-success/10 text-success';
      case 'pending': return 'bg-warning/10 text-warning';
      case 'completed': return 'bg-muted text-muted-foreground';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
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
            Schedule and manage your counselor meetings
          </p>
        </div>
        <Button onClick={() => { setShowBooking(!showBooking); setSuccessMessage(''); setBookingError(''); }}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Book Meeting
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-lg">
          <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm text-success font-medium">{successMessage}</p>
          <button onClick={() => setSuccessMessage('')} className="ml-auto text-success hover:text-success/80">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {loadError && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <svg className="w-5 h-5 text-destructive flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-2.5L13.73 4.5c-.77-.83-2.69-.83-3.46 0L3.34 16.5c-.77.83.19 2.5 1.73 2.5z" />
          </svg>
          <p className="text-sm text-destructive font-medium">{loadError}</p>
          <Button size="sm" variant="outline" className="ml-auto" onClick={() => void loadMeetingsData()}>
            Retry
          </Button>
        </div>
      )}

      {/* Booking Form */}
      {showBooking && (
        <ContentCard title="Book a New Meeting">
          {schoolCounselors.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="font-medium text-foreground">No counselors available</p>
              <p className="text-sm text-muted-foreground mt-1">
                No counselors have registered at your school yet. Please check back later.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setShowBooking(false)}>
                Close
              </Button>
            </div>
          ) : (
          <div className="space-y-6">
            {bookingError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
                <p className="text-sm text-destructive font-medium">{bookingError}</p>
              </div>
            )}

            <Select
              label="Select Counselor"
              value={selectedCounselor}
              onChange={(e) => {
                setSelectedCounselor(e.target.value);
                setSelectedDateKey('');
                setSelectedSlotStart24('');
                setBookingError('');
              }}
              options={[
                { value: '', label: 'Choose a counselor' },
                ...counselorOptions.map(c => ({ value: c.value, label: c.label })),
              ]}
            />

            {selectedCounselor && (
              <>
                <Select
                  label="Meeting Topic"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  options={meetingTopics}
                />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Meeting Type
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedMeetingType('video')}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                        selectedMeetingType === 'video'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Video Call
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMeetingType('in-person')}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                        selectedMeetingType === 'in-person'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      In-Person
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Available Time Slots
                  </label>
                  {availableDays.length === 0 ? (
                    <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                      No available slots in the next few weeks for this counselor.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {availableDays.map((day) => (
                        <div key={day.dateKey}>
                          <p className="text-sm font-medium text-muted-foreground mb-2">{day.dateLabel}</p>
                          <div className="flex flex-wrap gap-2">
                            {day.slots.map((slot) => (
                              <button
                                key={`${day.dateKey}-${slot.start24}`}
                                type="button"
                                onClick={() => {
                                  setSelectedDateKey(day.dateKey);
                                  setSelectedSlotStart24(slot.start24);
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  selectedDateKey === day.dateKey && selectedSlotStart24 === slot.start24
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-foreground hover:bg-muted/80'
                                }`}
                              >
                                {slot.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {selectedSlot && selectedTopic && selectedDay && (
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-foreground">Booking Summary</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><span className="font-medium text-foreground">Counselor:</span> {counselorOptions.find(c => c.value === selectedCounselor)?.name}</p>
                  <p><span className="font-medium text-foreground">Topic:</span> {selectedTopic}</p>
                  <p><span className="font-medium text-foreground">Date:</span> {selectedDay.dateLong}</p>
                  <p><span className="font-medium text-foreground">Time:</span> {selectedSlot.label}</p>
                  <p><span className="font-medium text-foreground">Type:</span> {selectedMeetingType === 'video' ? 'Video Call' : 'In-Person'}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setShowBooking(false);
                setSelectedCounselor('');
                setSelectedTopic('');
                setSelectedDateKey('');
                setSelectedSlotStart24('');
                setBookingError('');
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmBooking}
                disabled={!selectedSlot || !selectedTopic || !selectedCounselor}
                isLoading={isBooking}
              >
                Confirm Booking
              </Button>
            </div>
          </div>
          )}
        </ContentCard>
      )}

      {showLoadingState && (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground">Loading meetings...</p>
        </div>
      )}

      {!showLoadingState && (
        <>
      {/* Upcoming Meetings */}
      <ContentCard title={`Upcoming Meetings (${upcomingMeetings.length})`}>
        {upcomingMeetings.length > 0 ? (
          <div className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-lg gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {meeting.type === 'video' ? (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{meeting.title}</h3>
                    <p className="text-sm text-muted-foreground">{meeting.counselor}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {meeting.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {meeting.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                    {meeting.status}
                  </span>
                  {meeting.type === 'video' && meeting.status === 'confirmed' && (
                    <Button variant="primary" size="sm">
                      Join Call
                    </Button>
                  )}
                  {(meeting.status === 'pending' || meeting.status === 'confirmed') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelMeeting(meeting.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No upcoming meetings</p>
            <Button variant="outline" size="sm" onClick={() => setShowBooking(true)}>
              Book your first meeting
            </Button>
          </div>
        )}
      </ContentCard>

      {/* Past Meetings */}
      {pastMeetings.length > 0 && (
        <ContentCard title={`Past Meetings (${pastMeetings.length})`}>
          <div className="space-y-3">
            {pastMeetings.map((meeting) => (
              <div key={meeting.id}>
                <div
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg opacity-75"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{meeting.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {meeting.counselor} &bull; {meeting.date}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewingNotes(viewingNotes === meeting.id ? null : meeting.id)}
                  >
                    {viewingNotes === meeting.id ? 'Hide Notes' : 'View Notes'}
                  </Button>
                </div>
                {viewingNotes === meeting.id && meeting.notes && (
                  <div className="ml-14 mt-2 p-3 bg-muted/20 rounded-lg border border-border">
                    <p className="text-sm font-medium text-foreground mb-1">Meeting Notes</p>
                    <p className="text-sm text-muted-foreground">{meeting.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ContentCard>
      )}

      {/* Cancelled Meetings */}
      {cancelledMeetings.length > 0 && (
        <ContentCard title={`Cancelled (${cancelledMeetings.length})`}>
          <div className="space-y-3">
            {cancelledMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg opacity-50"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center text-destructive">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground line-through">{meeting.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {meeting.counselor} &bull; {meeting.date}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor('cancelled')}`}>
                  Cancelled
                </span>
              </div>
            ))}
          </div>
        </ContentCard>
      )}
        </>
      )}
    </div>
  );
}
