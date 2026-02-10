'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  counselorId?: string;
  counselorName?: string;
}

interface AppointmentSummaryProps {
  appointmentType: string | null;
  selectedDate: string | null;
  selectedSlot: TimeSlot | null;
  onConfirm: () => void;
  onEdit: () => void;
}

const AppointmentSummary = ({
  appointmentType,
  selectedDate,
  selectedSlot,
  onConfirm,
  onEdit
}: AppointmentSummaryProps) => {
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  const typeDetails: Record<string, {name: string;duration: string;icon: string;}> = {
    individual: { name: 'Individual Counseling', duration: '30 minutes', icon: 'UserIcon' },
    group: { name: 'Group Session', duration: '60 minutes', icon: 'UserGroupIcon' },
    parent: { name: 'Parent Conference', duration: '45 minutes', icon: 'HomeIcon' },
    crisis: { name: 'Crisis Intervention', duration: '60 minutes', icon: 'ExclamationTriangleIcon' }
  };

  const counselorDetails: Record<string, {name: string;image: string;alt: string;specialty: string;}> = {
    c1: {
      name: 'Dr. Sarah Johnson',
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1bdbe6c11-1763300715032.png",
      alt: 'Professional woman with brown hair in navy blazer smiling warmly at camera',
      specialty: 'Academic & Career Counseling'
    },
    c2: {
      name: 'Mr. Michael Chen',
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_10ffc0fb5-1763299748785.png",
      alt: 'Asian man with short black hair in light blue shirt smiling confidently',
      specialty: 'College Preparation & Planning'
    },
    c3: {
      name: 'Ms. Emily Rodriguez',
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1cc7d7277-1763295051444.png",
      alt: 'Hispanic woman with long dark hair in professional attire with friendly expression',
      specialty: 'Mental Health & Wellness'
    }
  };

  if (!appointmentType || !selectedDate || !selectedSlot) {
    return null;
  }

  const typeInfo = typeDetails[appointmentType];
  const counselorInfo = selectedSlot.counselorId ? counselorDetails[selectedSlot.counselorId] : null;

  const formatDate = (dateStr: string) => {
    if (!isHydrated) return 'Loading...';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-card rounded-xl shadow-brand p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl lg:text-2xl font-heading font-bold text-foreground">
          Appointment Summary
        </h2>
        <button
          onClick={onEdit}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors">

          <Icon name="PencilIcon" size={16} variant="outline" />
          <span>Edit</span>
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg">
          <div className="bg-primary p-2 rounded-lg">
            <Icon name={typeInfo.icon as any} size={24} variant="outline" className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading font-semibold text-foreground mb-1">
              {typeInfo.name}
            </h3>
            <p className="text-sm text-muted-foreground">Duration: {typeInfo.duration}</p>
          </div>
        </div>

        <div className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg">
          <div className="bg-accent p-2 rounded-lg">
            <Icon name="CalendarIcon" size={24} variant="outline" className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading font-semibold text-foreground mb-1">
              {isHydrated ? formatDate(selectedDate) : 'Loading...'}
            </h3>
            <p className="text-sm text-muted-foreground">{selectedSlot.time}</p>
          </div>
        </div>

        {counselorInfo &&
        <div className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg">
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
              <AppImage
              src={counselorInfo.image}
              alt={counselorInfo.alt}
              className="w-full h-full object-cover" />

            </div>
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-foreground mb-1">
                {counselorInfo.name}
              </h3>
              <p className="text-sm text-muted-foreground">{counselorInfo.specialty}</p>
            </div>
          </div>
        }

        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="InformationCircleIcon" size={20} variant="outline" className="text-accent flex-shrink-0 mt-0.5" />
            <div className="text-sm text-foreground/80">
              <p className="mb-2">
                You will receive a confirmation email with appointment details and a calendar invite.
              </p>
              <p>
                If you need to reschedule or cancel, please do so at least 24 hours in advance.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onConfirm}
        className="w-full mt-6 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-heading font-semibold hover:opacity-90 transition-opacity">

        Confirm Appointment
      </button>
    </div>);

};

export default AppointmentSummary;