import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface TrustSignal {
  id: number;
  title: string;
  description: string;
  icon: string;
}

interface TrustSignalsSectionProps {
  className?: string;
}

const TrustSignalsSection = ({ className = '' }: TrustSignalsSectionProps) => {
  const trustSignals: TrustSignal[] = [
    {
      id: 1,
      title: "FERPA Compliant",
      description: "Full compliance with Family Educational Rights and Privacy Act to protect student information.",
      icon: "DocumentCheckIcon"
    },
    {
      id: 2,
      title: "SSL Encrypted",
      description: "Bank-level encryption ensures all communications and data remain secure and private.",
      icon: "LockClosedIcon"
    },
    {
      id: 3,
      title: "Certified Platform",
      description: "Endorsed by leading educational organizations and mental health associations.",
      icon: "AcademicCapIcon"
    },
    {
      id: 4,
      title: "24/7 Monitoring",
      description: "Continuous system monitoring and support to ensure platform reliability and security.",
      icon: "ShieldCheckIcon"
    }
  ];

  return (
    <section className={`py-16 lg:py-20 bg-muted/30 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-3">
            Your Security & Privacy Matter
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We maintain the highest standards of security and compliance to protect student information and ensure trust.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustSignals.map((signal) => (
            <div
              key={signal.id}
              className="bg-card rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300 border border-border"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-4">
                <Icon name={signal.icon as any} size={28} variant="solid" className="text-accent" />
              </div>
              
              <h3 className="text-lg font-heading font-bold text-foreground mb-2">
                {signal.title}
              </h3>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {signal.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSignalsSection;