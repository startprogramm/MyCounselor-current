import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface AnonymousQuestionCardProps {
  onSubmitQuestion: () => void;
}

const AnonymousQuestionCard = ({ onSubmitQuestion }: AnonymousQuestionCardProps) => {
  return (
    <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-6 shadow-brand border-2 border-secondary/20">
      <div className="flex items-start space-x-3 mb-4">
        <div className="bg-secondary/20 p-2 rounded-lg">
          <Icon name="QuestionMarkCircleIcon" size={24} variant="solid" className="text-secondary" />
        </div>
        <div>
          <h2 className="text-lg font-heading font-bold text-foreground mb-1">
            Have a Question?
          </h2>
          <p className="text-sm text-muted-foreground">
            Submit anonymously and get guidance from our counselors
          </p>
        </div>
      </div>
      <button
        onClick={onSubmitQuestion}
        className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-secondary text-secondary-foreground font-heading font-semibold text-sm hover:opacity-90 transition-opacity duration-300"
      >
        <Icon name="PencilSquareIcon" size={20} variant="outline" />
        <span>Submit Anonymous Question</span>
      </button>
      <div className="mt-4 flex items-center space-x-2 text-xs text-muted-foreground">
        <Icon name="ShieldCheckIcon" size={16} variant="outline" />
        <span>Your identity is completely protected</span>
      </div>
    </div>
  );
};

export default AnonymousQuestionCard;