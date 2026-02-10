'use client';

import React, { useState, useEffect } from 'react';
import { ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';

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

const STORAGE_KEY = 'mycounselor_student_meetings';

function getNextWeekdays(): { date: string; label: string; slots: string[] }[] {
  const days: { date: string; label: string; slots: string[] }[] = [];
  const now = new Date();
  let count = 0;
  const current = new Date(now);
  current.setDate(current.getDate() + 1); // Start from tomorrow

  while (count < 5) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) { // Skip weekends
      const label = current.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      const dateStr = current.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      // Generate random available slots
      const allSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
      const numSlots = 2 + Math.floor(Math.random() * 4);
      const slots = allSlots.sort(() => Math.random() - 0.5).slice(0, numSlots).sort();
      days.push({ date: dateStr, label, slots });
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return days;
}


const counselors = [
  { value: 'martinez', label: 'Dr. Sarah Martinez - College & Career', name: 'Dr. Sarah Martinez' },
  { value: 'chen', label: 'Mr. James Chen - Academic Support', name: 'Mr. James Chen' },
];

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
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedMeetingType, setSelectedMeetingType] = useState<'video' | 'in-person'>('video');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [availableSlots] = useState(getNextWeekdays);
  const [successMessage, setSuccessMessage] = useState('');
  const [viewingNotes, setViewingNotes] = useState<number | null>(null);

  // Load meetings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setMeetings(JSON.parse(stored));
      } catch {
        setMeetings([]);
      }
    }
  }, []);

  const saveMeetings = (updated: Meeting[]) => {
    setMeetings(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleConfirmBooking = () => {
    if (!selectedCounselor || !selectedDate || !selectedSlot || !selectedTopic) return;

    const counselor = counselors.find(c => c.value === selectedCounselor);
    const endTime = (() => {
      const [time, period] = selectedSlot.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      const endMinutes = minutes + 30;
      const endHours = endMinutes >= 60 ? hours + 1 : hours;
      const finalMinutes = endMinutes % 60;
      return `${endHours}:${finalMinutes.toString().padStart(2, '0')} ${period}`;
    })();

    const newMeeting: Meeting = {
      id: Date.now(),
      title: selectedTopic,
      counselor: counselor?.name || '',
      date: selectedDate,
      time: `${selectedSlot} - ${endTime}`,
      type: selectedMeetingType,
      status: 'pending',
    };

    const updated = [newMeeting, ...meetings];
    saveMeetings(updated);

    // Reset form
    setSelectedCounselor('');
    setSelectedTopic('');
    setSelectedDate('');
    setSelectedSlot('');
    setSelectedMeetingType('video');
    setShowBooking(false);
    setSuccessMessage('Meeting booked successfully! You will receive a confirmation shortly.');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleCancelMeeting = (id: number) => {
    const updated = meetings.map(m =>
      m.id === id ? { ...m, status: 'cancelled' as const } : m
    );
    saveMeetings(updated);
  };

  const upcomingMeetings = meetings.filter(m => m.status === 'confirmed' || m.status === 'pending');
  const pastMeetings = meetings.filter(m => m.status === 'completed');
  const cancelledMeetings = meetings.filter(m => m.status === 'cancelled');

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
        <Button onClick={() => { setShowBooking(!showBooking); setSuccessMessage(''); }}>
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

      {/* Booking Form */}
      {showBooking && (
        <ContentCard title="Book a New Meeting">
          <div className="space-y-6">
            <Select
              label="Select Counselor"
              value={selectedCounselor}
              onChange={(e) => { setSelectedCounselor(e.target.value); setSelectedDate(''); setSelectedSlot(''); }}
              options={[
                { value: '', label: 'Choose a counselor' },
                ...counselors.map(c => ({ value: c.value, label: c.label })),
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
                  <div className="space-y-4">
                    {availableSlots.map((day) => (
                      <div key={day.date}>
                        <p className="text-sm font-medium text-muted-foreground mb-2">{day.label}</p>
                        <div className="flex flex-wrap gap-2">
                          {day.slots.map((slot) => (
                            <button
                              key={`${day.date}-${slot}`}
                              onClick={() => {
                                setSelectedDate(day.date);
                                setSelectedSlot(slot);
                              }}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedDate === day.date && selectedSlot === slot
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-foreground hover:bg-muted/80'
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {selectedSlot && selectedTopic && (
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-foreground">Booking Summary</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><span className="font-medium text-foreground">Counselor:</span> {counselors.find(c => c.value === selectedCounselor)?.name}</p>
                  <p><span className="font-medium text-foreground">Topic:</span> {selectedTopic}</p>
                  <p><span className="font-medium text-foreground">Date:</span> {selectedDate}</p>
                  <p><span className="font-medium text-foreground">Time:</span> {selectedSlot}</p>
                  <p><span className="font-medium text-foreground">Type:</span> {selectedMeetingType === 'video' ? 'Video Call' : 'In-Person'}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setShowBooking(false);
                setSelectedCounselor('');
                setSelectedTopic('');
                setSelectedDate('');
                setSelectedSlot('');
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmBooking}
                disabled={!selectedSlot || !selectedTopic || !selectedCounselor}
              >
                Confirm Booking
              </Button>
            </div>
          </div>
        </ContentCard>
      )}

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
    </div>
  );
}
