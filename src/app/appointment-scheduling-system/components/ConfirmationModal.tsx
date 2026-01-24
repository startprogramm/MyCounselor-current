'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface ConfirmationModalProps {
  show: boolean;
  onClose: () => void;
}

const ConfirmationModal = ({ show, onClose }: ConfirmationModalProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-brand-lg max-w-md w-full p-6">
        <div className="flex flex-col items-center text-center">
          <div className="bg-success/10 p-4 rounded-full mb-4">
            <Icon name="CheckCircleIcon" size={48} variant="solid" className="text-success" />
          </div>
          
          <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
            Appointment Confirmed!
          </h3>
          
          <p className="text-muted-foreground mb-6">
            Your appointment has been successfully scheduled. You will receive a confirmation email with all the details and a calendar invite.
          </p>

          <div className="w-full bg-muted/30 rounded-lg p-4 mb-6 text-left">
            <h4 className="text-sm font-semibold text-foreground mb-3">Next Steps:</h4>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li className="flex items-start space-x-2">
                <Icon name="EnvelopeIcon" size={16} variant="outline" className="text-primary mt-0.5 flex-shrink-0" />
                <span>Check your email for confirmation and preparation materials</span>
              </li>
              <li className="flex items-start space-x-2">
                <Icon name="CalendarIcon" size={16} variant="outline" className="text-primary mt-0.5 flex-shrink-0" />
                <span>Add the appointment to your calendar</span>
              </li>
              <li className="flex items-start space-x-2">
                <Icon name="BellIcon" size={16} variant="outline" className="text-primary mt-0.5 flex-shrink-0" />
                <span>You will receive a reminder 24 hours before</span>
              </li>
            </ul>
          </div>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-lg bg-primary text-primary-foreground font-heading font-semibold hover:opacity-90 transition-opacity"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;