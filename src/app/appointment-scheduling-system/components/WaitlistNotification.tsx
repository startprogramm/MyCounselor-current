'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface WaitlistNotificationProps {
  show: boolean;
  onClose: () => void;
  onJoinWaitlist: () => void;
}

const WaitlistNotification = ({ show, onClose, onJoinWaitlist }: WaitlistNotificationProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-brand-lg max-w-md w-full p-6">
        <div className="flex items-start space-x-3 mb-4">
          <div className="bg-warning/10 p-2 rounded-lg">
            <Icon name="ClockIcon" size={24} variant="outline" className="text-warning" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-heading font-bold text-foreground mb-1">
              Time Slot Unavailable
            </h3>
            <p className="text-sm text-muted-foreground">
              This time slot is currently booked. Would you like to join the waitlist?
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close notification"
          >
            <Icon name="XMarkIcon" size={20} variant="outline" />
          </button>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-foreground mb-2">Waitlist Benefits:</h4>
          <ul className="space-y-2 text-sm text-foreground/80">
            <li className="flex items-start space-x-2">
              <Icon name="CheckCircleIcon" size={16} variant="solid" className="text-success mt-0.5 flex-shrink-0" />
              <span>Automatic notification if slot becomes available</span>
            </li>
            <li className="flex items-start space-x-2">
              <Icon name="CheckCircleIcon" size={16} variant="solid" className="text-success mt-0.5 flex-shrink-0" />
              <span>Priority booking for similar time slots</span>
            </li>
            <li className="flex items-start space-x-2">
              <Icon name="CheckCircleIcon" size={16} variant="solid" className="text-success mt-0.5 flex-shrink-0" />
              <span>Alternative time suggestions via email</span>
            </li>
          </ul>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
          >
            Choose Different Time
          </button>
          <button
            onClick={onJoinWaitlist}
            className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-heading font-semibold hover:opacity-90 transition-opacity"
          >
            Join Waitlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitlistNotification;