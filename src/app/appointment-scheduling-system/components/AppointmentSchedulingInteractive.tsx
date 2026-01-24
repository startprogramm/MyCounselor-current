'use client';

import React, { useState } from 'react';
import AppointmentTypeSelector from './AppointmentTypeSelector';
import AppointmentCalendar from './AppointmentCalendar';
import PreAppointmentQuestionnaire from './PreAppointmentQuestionnaire';
import AppointmentSummary from './AppointmentSummary';
import WaitlistNotification from './WaitlistNotification';
import ConfirmationModal from './ConfirmationModal';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  counselorId?: string;
  counselorName?: string;
}

type Step = 'type' | 'calendar' | 'questionnaire' | 'summary';

const AppointmentSchedulingInteractive = () => {
  const [currentStep, setCurrentStep] = useState<Step>('type');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [questionnaireResponses, setQuestionnaireResponses] = useState<Record<string, string>>({});
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setCurrentStep('calendar');
  };

  const handleSlotSelect = (date: string, slot: TimeSlot) => {
    if (!slot.available) {
      setShowWaitlist(true);
      return;
    }
    setSelectedDate(date);
    setSelectedSlot(slot);
    setCurrentStep('questionnaire');
  };

  const handleQuestionnaireSubmit = (responses: Record<string, string>) => {
    setQuestionnaireResponses(responses);
    setCurrentStep('summary');
  };

  const handleConfirmAppointment = () => {
    setShowConfirmation(true);
  };

  const handleEditAppointment = () => {
    setCurrentStep('type');
  };

  const handleJoinWaitlist = () => {
    setShowWaitlist(false);
    alert('You have been added to the waitlist. We will notify you when a slot becomes available.');
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setCurrentStep('type');
    setSelectedType(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setQuestionnaireResponses({});
  };

  return (
    <>
      <div className="space-y-6">
        {currentStep === 'type' && (
          <AppointmentTypeSelector
            selectedType={selectedType}
            onTypeSelect={handleTypeSelect}
          />
        )}

        {currentStep === 'calendar' && (
          <AppointmentCalendar
            onSlotSelect={handleSlotSelect}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
          />
        )}

        {currentStep === 'questionnaire' && (
          <PreAppointmentQuestionnaire
            appointmentType={selectedType}
            onSubmit={handleQuestionnaireSubmit}
          />
        )}

        {currentStep === 'summary' && (
          <AppointmentSummary
            appointmentType={selectedType}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onConfirm={handleConfirmAppointment}
            onEdit={handleEditAppointment}
          />
        )}
      </div>

      <WaitlistNotification
        show={showWaitlist}
        onClose={() => setShowWaitlist(false)}
        onJoinWaitlist={handleJoinWaitlist}
      />

      <ConfirmationModal
        show={showConfirmation}
        onClose={handleCloseConfirmation}
      />
    </>
  );
};

export default AppointmentSchedulingInteractive;