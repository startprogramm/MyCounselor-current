'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Template {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface QuickResponseTemplatesProps {
  templates: Template[];
  onSelectTemplate: (content: string) => void;
}

const QuickResponseTemplates = ({
  templates,
  onSelectTemplate,
}: QuickResponseTemplatesProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Icon name="BoltIcon" size={16} variant="solid" className="text-warning" />
        Quick Response Templates
      </h3>
      <div className="space-y-2">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template.content)}
            className="w-full text-left p-3 rounded-lg bg-muted hover:bg-muted/70 transition-colors"
          >
            <div className="flex items-start justify-between mb-1">
              <h4 className="text-sm font-medium text-foreground">{template.title}</h4>
              <span className="text-xs text-muted-foreground px-2 py-0.5 bg-background rounded-full">
                {template.category}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{template.content}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickResponseTemplates;