'use client';

import React, { useState } from 'react';
import { ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';

const upcomingMeetings = [
  {
    id: 1,
    title: 'College Application Review',
    counselor: 'Dr. Sarah Martinez',
    date: 'January 25, 2026',
    time: '2:00 PM - 2:30 PM',
    type: 'video',
    status: 'confirmed',
  },
  {
    id: 2,
    title: 'Career Exploration Session',
    counselor: 'Mr. James Chen',
    date: 'January 28, 2026',
    time: '10:30 AM - 11:00 AM',
    type: 'in-person',
    status: 'pending',
  },
];

const pastMeetings = [
  {
    id: 3,
    title: 'SAT Prep Planning',
    counselor: 'Dr. Sarah Martinez',
    date: 'January 15, 2026',
    time: '3:00 PM - 3:30 PM',
    type: 'video',
    status: 'completed',
  },
  {
    id: 4,
    title: 'Goal Setting Session',
    counselor: 'Dr. Sarah Martinez',
    date: 'January 8, 2026',
    time: '2:00 PM - 2:30 PM',
    type: 'in-person',
    status: 'completed',
  },
];

const availableSlots = [
  { date: 'Monday, Jan 27', slots: ['9:00 AM', '11:00 AM', '2:00 PM'] },
  { date: 'Tuesday, Jan 28', slots: ['10:00 AM', '1:00 PM', '3:00 PM'] },
  { date: 'Wednesday, Jan 29', slots: ['9:00 AM', '10:00 AM', '2:00 PM', '4:00 PM'] },
  { date: 'Thursday, Jan 30', slots: ['11:00 AM', '1:00 PM'] },
];

export default function StudentMeetingsPage() {
  const [showBooking, setShowBooking] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-success/10 text-success';
      case 'pending': return 'bg-warning/10 text-warning';
      case 'completed': return 'bg-muted text-muted-foreground';
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
        <Button onClick={() => setShowBooking(!showBooking)}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Book Meeting
        </Button>
      </div>

      {/* Booking Form */}
      {showBooking && (
        <ContentCard title="Book a New Meeting">
          <div className="space-y-6">
            <Select
              label="Select Counselor"
              value={selectedCounselor}
              onChange={(e) => setSelectedCounselor(e.target.value)}
              options={[
                { value: '', label: 'Choose a counselor' },
                { value: 'martinez', label: 'Dr. Sarah Martinez - College & Career' },
                { value: 'chen', label: 'Mr. James Chen - Academic Support' },
              ]}
            />

            {selectedCounselor && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Available Time Slots
                </label>
                <div className="space-y-4">
                  {availableSlots.map((day) => (
                    <div key={day.date}>
                      <p className="text-sm font-medium text-muted-foreground mb-2">{day.date}</p>
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
            )}

            {selectedSlot && (
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowBooking(false)}>
                  Cancel
                </Button>
                <Button>Confirm Booking</Button>
              </div>
            )}
          </div>
        </ContentCard>
      )}

      {/* Upcoming Meetings */}
      <ContentCard title="Upcoming Meetings">
        {upcomingMeetings.length > 0 ? (
          <div className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
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
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                    {meeting.status}
                  </span>
                  <Button variant="outline" size="sm">
                    {meeting.type === 'video' ? 'Join Call' : 'View Details'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No upcoming meetings</p>
        )}
      </ContentCard>

      {/* Past Meetings */}
      <ContentCard title="Past Meetings">
        <div className="space-y-3">
          {pastMeetings.map((meeting) => (
            <div
              key={meeting.id}
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
              <Button variant="ghost" size="sm">
                View Notes
              </Button>
            </div>
          ))}
        </div>
      </ContentCard>
    </div>
  );
}
