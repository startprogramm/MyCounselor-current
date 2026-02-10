import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import AppointmentSchedulingInteractive from './components/AppointmentSchedulingInteractive';

export const metadata: Metadata = {
  title: 'Appointment Scheduling System - MyCounselor',
  description: 'Schedule appointments with school counselors through our intelligent booking platform with availability management, automated reminders, and smart time slot matching.',
};

export default function AppointmentSchedulingSystemPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="pt-24 pb-16 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-3">
              Schedule Your Appointment
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Book a session with your counselor in just a few steps. Choose your appointment type, select a convenient time, and help us prepare for your visit.
            </p>
          </div>

          <AppointmentSchedulingInteractive />
        </div>
      </div>
    </main>
  );
}