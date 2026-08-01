'use client';

import React, { useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';

const MAX_COMPOSER_HEIGHT_PX = 160;

interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder: string;
  error?: string | null;
  footer?: React.ReactNode;
}

export default function MessageComposer({
  value,
  onChange,
  onSend,
  placeholder,
  error,
  footer,
}: MessageComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_COMPOSER_HEIGHT_PX)}px`;
  }, [value]);

  const submit = () => {
    if (value.trim()) onSend();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="px-4 py-4 sm:px-5 sm:py-5 border-t border-border bg-card/95"
    >
      {error && <p className="mb-2 text-xs text-destructive px-1">{error}</p>}
      <div className="flex items-end gap-2 sm:gap-3 rounded-xl border border-input bg-background/90 px-2 sm:px-3 py-2 shadow-sm">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 resize-none max-h-40 bg-transparent px-2 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none leading-6"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!value.trim()}
          className="rounded-full px-3.5 py-2 mb-0.5 flex-shrink-0"
          aria-label="Send message"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </Button>
      </div>
      {footer}
    </form>
  );
}
