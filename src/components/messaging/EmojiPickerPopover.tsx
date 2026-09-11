'use client';

import React, { useEffect, useRef, useState } from 'react';

interface EmojiPickerPopoverProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  {
    name: 'Smileys',
    emojis: ['😊', '😂', '😃', '😄', '😁', '🥳', '😎', '😍', '🤩', '😇', '😌', '🤔', '😅', '🙌', '👏', '👋'],
  },
  {
    name: 'Reactions',
    emojis: ['👍', '👎', '❤️', '🔥', '✨', '🎉', '💯', '🙏', '💪', '⭐', '🤝', '💡', '✅', '🚀', '📌', '⚡'],
  },
  {
    name: 'School & Work',
    emojis: ['📚', '🎓', '📝', '✏️', '📄', '📅', '📊', '💻', '🏫', '🎯', '🏆', '💬', '✉️', '📁', '📌', '🔍'],
  },
];

export default function EmojiPickerPopover({ onSelectEmoji, onClose }: EmojiPickerPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState(0);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-full mb-2 right-0 z-50 w-72 sm:w-80 rounded-xl border border-border bg-card shadow-xl p-3 text-popover-foreground animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {EMOJI_CATEGORIES.map((cat, idx) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setActiveCategory(idx)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                activeCategory === idx
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground p-1 rounded-md"
          aria-label="Close emoji picker"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-8 gap-1.5 max-h-48 overflow-y-auto p-1">
        {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              onSelectEmoji(emoji);
            }}
            className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-muted transition-all duration-100 hover:scale-110 active:scale-95"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
