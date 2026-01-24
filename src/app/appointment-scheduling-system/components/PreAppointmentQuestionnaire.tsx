'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface PreAppointmentQuestionnaireProps {
  appointmentType: string | null;
  onSubmit: (responses: Record<string, string>) => void;
}

const PreAppointmentQuestionnaire = ({ appointmentType, onSubmit }: PreAppointmentQuestionnaireProps) => {
  const [responses, setResponses] = useState<Record<string, string>>({});

  const questions: Record<string, { question: string; placeholder: string }[]> = {
    individual: [
      {
        question: 'What would you like to discuss in this session?',
        placeholder: 'E.g., Academic planning, stress management, career exploration...',
      },
      {
        question: 'Are there any specific concerns or challenges you are facing?',
        placeholder: 'Share any details that will help your counselor prepare...',
      },
      {
        question: 'What outcome would make this session successful for you?',
        placeholder: 'E.g., Clear action plan, better understanding, emotional support...',
      },
    ],
    group: [
      {
        question: 'What topics are you most interested in exploring?',
        placeholder: 'E.g., Study skills, time management, college applications...',
      },
      {
        question: 'What do you hope to gain from this group session?',
        placeholder: 'E.g., Peer perspectives, practical strategies, community support...',
      },
    ],
    parent: [
      {
        question: 'What are your primary concerns about your child?',
        placeholder: 'E.g., Academic performance, social development, future planning...',
      },
      {
        question: 'What specific support are you seeking from this conference?',
        placeholder: 'E.g., Guidance strategies, school resources, action plan...',
      },
      {
        question: 'Is there any background information we should know?',
        placeholder: 'Share any relevant context that will help us support your family...',
      },
    ],
    crisis: [
      {
        question: 'Please briefly describe the situation (optional but helpful)',
        placeholder: 'Share what you are comfortable with to help us prepare appropriate support...',
      },
      {
        question: 'Have you accessed any other support resources?',
        placeholder: 'E.g., School nurse, trusted adult, crisis hotline...',
      },
    ],
  };

  const currentQuestions = appointmentType ? questions[appointmentType] || [] : [];

  const handleResponseChange = (index: number, value: string) => {
    setResponses(prev => ({
      ...prev,
      [`question_${index}`]: value,
    }));
  };

  const handleSubmit = () => {
    onSubmit(responses);
  };

  if (!appointmentType || currentQuestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl shadow-brand p-4 lg:p-6">
      <div className="flex items-start space-x-3 mb-4">
        <div className="bg-accent/10 p-2 rounded-lg">
          <Icon name="ClipboardDocumentListIcon" size={24} variant="outline" className="text-accent" />
        </div>
        <div>
          <h2 className="text-xl lg:text-2xl font-heading font-bold text-foreground">
            Pre-Appointment Questionnaire
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Help your counselor prepare by sharing some context (optional but recommended)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {currentQuestions.map((q, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-foreground mb-2">
              {q.question}
            </label>
            <textarea
              value={responses[`question_${index}`] || ''}
              onChange={(e) => handleResponseChange(index, e.target.value)}
              placeholder={q.placeholder}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Your responses are confidential and help maximize session effectiveness
        </p>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 rounded-lg bg-accent text-accent-foreground font-heading font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default PreAppointmentQuestionnaire;