'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface AppointmentType {
  id: string;
  name: string;
  description: string;
  duration: string;
  icon: string;
  color: string;
}

interface AppointmentTypeSelectorProps {
  selectedType: string | null;
  onTypeSelect: (typeId: string) => void;
}

const appointmentTypes: AppointmentType[] = [
  {
    id: 'individual',
    name: 'Individual Counseling',
    description: 'One-on-one session to discuss academic, personal, or career concerns',
    duration: '30 minutes',
    icon: 'UserIcon',
    color: 'bg-primary',
  },
  {
    id: 'group',
    name: 'Group Session',
    description: 'Join peers in facilitated discussions on common topics and challenges',
    duration: '60 minutes',
    icon: 'UserGroupIcon',
    color: 'bg-secondary',
  },
  {
    id: 'parent',
    name: 'Parent Conference',
    description: 'Meet with counselor and parents to discuss student progress and goals',
    duration: '45 minutes',
    icon: 'HomeIcon',
    color: 'bg-accent',
  },
  {
    id: 'crisis',
    name: 'Crisis Intervention',
    description: 'Immediate support for urgent emotional or mental health concerns',
    duration: '60 minutes',
    icon: 'ExclamationTriangleIcon',
    color: 'bg-warning',
  },
];

const AppointmentTypeSelector = ({ selectedType, onTypeSelect }: AppointmentTypeSelectorProps) => {
  return (
    <div className="bg-card rounded-xl shadow-brand p-4 lg:p-6">
      <div className="flex items-start space-x-3 mb-6">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Icon name="CalendarDaysIcon" size={24} variant="outline" className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl lg:text-2xl font-heading font-bold text-foreground">
            Select Appointment Type
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose the type of session that best fits your needs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {appointmentTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onTypeSelect(type.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
              selectedType === type.id
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border hover:border-primary/50 bg-background'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`${type.color} p-3 rounded-lg flex-shrink-0`}>
                <Icon name={type.icon} size={24} variant="outline" className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold text-foreground mb-1">
                  {type.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {type.description}
                </p>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Icon name="ClockIcon" size={14} variant="outline" />
                  <span>{type.duration}</span>
                </div>
              </div>
              {selectedType === type.id && (
                <div className="flex-shrink-0">
                  <Icon name="CheckCircleIcon" size={24} variant="solid" className="text-primary" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {selectedType === 'crisis' && (
        <div className="mt-4 p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <Icon name="ExclamationTriangleIcon" size={20} variant="solid" className="text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">
                If you are in immediate danger, please call 911 or go to your nearest emergency room.
              </p>
              <p className="text-muted-foreground">
                For the National Crisis Hotline, call or text 988. Our counselors are here to help, but emergency services should be contacted for life-threatening situations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentTypeSelector;
