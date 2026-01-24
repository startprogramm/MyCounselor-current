import React from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface Appointment {
  id: string;
  counselorName: string;
  counselorImage: string;
  counselorImageAlt: string;
  date: string;
  time: string;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface UpcomingAppointmentsCardProps {
  appointments: Appointment[];
  onViewAll: () => void;
}

const UpcomingAppointmentsCard = ({ appointments, onViewAll }: UpcomingAppointmentsCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success/10 text-success';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'cancelled':
        return 'bg-error/10 text-error';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-brand">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-bold text-foreground">Upcoming Appointments</h2>
        <button
          onClick={onViewAll}
          className="text-primary text-sm font-medium hover:underline"
        >
          View All
        </button>
      </div>
      <div className="space-y-3">
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="CalendarIcon" size={48} variant="outline" className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No upcoming appointments</p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <AppImage
                  src={appointment.counselorImage}
                  alt={appointment.counselorImageAlt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-heading font-semibold text-sm text-foreground truncate">
                  {appointment.counselorName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {appointment.date} at {appointment.time}
                </div>
                <div className="text-xs text-muted-foreground">{appointment.type}</div>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(appointment.status)}`}>
                {appointment.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingAppointmentsCard;