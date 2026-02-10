import React from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface Appointment {
  id: number;
  studentName: string;
  studentImage: string;
  studentImageAlt: string;
  time: string;
  duration: string;
  type: string;
  location: string;
}

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
  onAppointmentClick: (id: number) => void;
}

const UpcomingAppointments = ({ appointments, onAppointmentClick }: UpcomingAppointmentsProps) => {
  const typeIcons: Record<string, string> = {
    'In-Person': 'UserGroupIcon',
    'Virtual': 'VideoCameraIcon',
    'Phone': 'PhoneIcon'
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Today's Appointments</h2>
          <Icon name="CalendarIcon" size={24} variant="outline" className="text-primary" />
        </div>
      </div>
      <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            onClick={() => onAppointmentClick(appointment.id)}
            className="p-4 hover:bg-muted/50 cursor-pointer transition-colors duration-200"
          >
            <div className="flex items-center space-x-4">
              <AppImage
                src={appointment.studentImage}
                alt={appointment.studentImageAlt}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{appointment.studentName}</h3>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Icon name="ClockIcon" size={14} variant="outline" className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{appointment.time}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name={typeIcons[appointment.type] as any} size={14} variant="outline" className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{appointment.type}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <Icon name="MapPinIcon" size={14} variant="outline" className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{appointment.location}</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                  {appointment.duration}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingAppointments;