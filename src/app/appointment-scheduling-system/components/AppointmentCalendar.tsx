'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  counselorId?: string;
  counselorName?: string;
}

interface DaySchedule {
  date: string;
  dayName: string;
  slots: TimeSlot[];
}

interface AppointmentCalendarProps {
  onSlotSelect: (date: string, slot: TimeSlot) => void;
  selectedDate: string | null;
  selectedSlot: TimeSlot | null;
}

const AppointmentCalendar = ({ onSlotSelect, selectedDate, selectedSlot }: AppointmentCalendarProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  const generateWeekSchedule = (weekOffset: number): DaySchedule[] => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const baseDate = new Date(2026, 0, 13);
    baseDate.setDate(baseDate.getDate() + (weekOffset * 7));

    return days.map((dayName, index) => {
      const currentDate = new Date(baseDate);
      currentDate.setDate(currentDate.getDate() + index);
      const dateStr = currentDate.toISOString().split('T')[0];

      const slots: TimeSlot[] = [
        { id: `${dateStr}-1`, time: '09:00 AM', available: true, counselorId: 'c1', counselorName: 'Dr. Sarah Johnson' },
        { id: `${dateStr}-2`, time: '10:00 AM', available: index !== 2, counselorId: 'c1', counselorName: 'Dr. Sarah Johnson' },
        { id: `${dateStr}-3`, time: '11:00 AM', available: true, counselorId: 'c2', counselorName: 'Mr. Michael Chen' },
        { id: `${dateStr}-4`, time: '01:00 PM', available: index !== 0, counselorId: 'c1', counselorName: 'Dr. Sarah Johnson' },
        { id: `${dateStr}-5`, time: '02:00 PM', available: true, counselorId: 'c3', counselorName: 'Ms. Emily Rodriguez' },
        { id: `${dateStr}-6`, time: '03:00 PM', available: index !== 1 && index !== 3, counselorId: 'c2', counselorName: 'Mr. Michael Chen' },
      ];

      return {
        date: dateStr,
        dayName,
        slots,
      };
    });
  };

  const weekSchedule = isHydrated ? generateWeekSchedule(currentWeekStart) : [];

  const handlePreviousWeek = () => {
    setCurrentWeekStart(prev => prev - 1);
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => prev + 1);
  };

  const formatDateRange = () => {
    if (!isHydrated || weekSchedule.length === 0) return 'Loading...';
    const firstDate = new Date(weekSchedule[0].date);
    const lastDate = new Date(weekSchedule[weekSchedule.length - 1].date);
    return `${firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-xl shadow-brand p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-brand p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl lg:text-2xl font-heading font-bold text-foreground">
          Available Time Slots
        </h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePreviousWeek}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Previous week"
          >
            <Icon name="ChevronLeftIcon" size={20} variant="outline" />
          </button>
          <span className="text-sm font-medium text-muted-foreground min-w-[140px] text-center">
            {formatDateRange()}
          </span>
          <button
            onClick={handleNextWeek}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Next week"
          >
            <Icon name="ChevronRightIcon" size={20} variant="outline" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {weekSchedule.map((day) => (
          <div key={day.date} className="bg-muted/30 rounded-lg p-3">
            <div className="text-center mb-3">
              <p className="text-sm font-semibold text-foreground">{day.dayName}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div className="space-y-2">
              {day.slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => slot.available && onSlotSelect(day.date, slot)}
                  disabled={!slot.available}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    slot.available
                      ? selectedDate === day.date && selectedSlot?.id === slot.id
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-card hover:bg-primary/10 text-foreground border border-border' :'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentCalendar;