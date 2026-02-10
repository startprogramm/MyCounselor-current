import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  availability: string;
}

interface EmergencyEscalationProps {
  contacts: EmergencyContact[];
  onEscalate: (contactId: string) => void;
}

const EmergencyEscalation = ({ contacts, onEscalate }: EmergencyEscalationProps) => {
  return (
    <div className="bg-destructive/10 border-2 border-destructive rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="ExclamationTriangleIcon" size={24} variant="solid" className="text-destructive" />
        <h3 className="text-lg font-bold text-destructive">Emergency Escalation</h3>
      </div>

      <p className="text-sm text-foreground mb-4">
        If this conversation requires immediate attention or crisis intervention, contact one of the
        following emergency resources:
      </p>

      <div className="space-y-3">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-card rounded-lg p-3 border border-border"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-foreground">{contact.name}</h4>
                <p className="text-sm text-muted-foreground">{contact.role}</p>
              </div>
              <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">
                {contact.availability}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-3">
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Icon name="PhoneIcon" size={14} variant="outline" />
                {contact.phone}
              </a>
            </div>

            <button
              onClick={() => onEscalate(contact.id)}
              className="w-full py-2 bg-destructive text-destructive-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Escalate to {contact.name}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-card rounded-lg border border-border">
        <p className="text-xs text-muted-foreground">
          <strong>National Crisis Hotline:</strong> 988 (24/7 Support)
        </p>
      </div>
    </div>
  );
};

export default EmergencyEscalation;