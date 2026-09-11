'use client';

import React, { useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import EmojiPickerPopover from './EmojiPickerPopover';
import type { MessageAttachment } from './ChatMessageBubble';

const MAX_COMPOSER_HEIGHT_PX = 160;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit

interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (content: string, attachments: MessageAttachment[]) => void;
  placeholder: string;
  error?: string | null;
  footer?: React.ReactNode;
  editingMessage?: { id: number; content: string } | null;
  onCancelEdit?: () => void;
}

export default function MessageComposer({
  value,
  onChange,
  onSend,
  placeholder,
  error,
  footer,
  editingMessage,
  onCancelEdit,
}: MessageComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_COMPOSER_HEIGHT_PX)}px`;
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    const newAttachments: MessageAttachment[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setUploadError(`"${file.name}" exceeds the 5MB size limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url) {
          setAttachments((prev) => [
            ...prev,
            {
              name: file.name,
              type: file.type || 'application/octet-stream',
              size: file.size,
              url: base64Url,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = () => {
    if (value.trim() || attachments.length > 0) {
      onSend(value.trim(), attachments);
      setAttachments([]);
      setShowEmojiPicker(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    const el = textareaRef.current;
    if (!el) {
      onChange(value + emoji);
      return;
    }
    const start = el.selectionStart || value.length;
    const end = el.selectionEnd || value.length;
    const nextValue = value.substring(0, start) + emoji + value.substring(end);
    onChange(nextValue);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="px-4 py-4 sm:px-5 sm:py-5 border-t border-border bg-card/95 relative"
    >
      {/* Editing bar indicator */}
      {editingMessage && (
        <div className="mb-3 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-between text-xs text-sky-600 dark:text-sky-400">
          <div className="flex items-center gap-1.5 truncate">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span className="font-medium truncate">Editing message: "{editingMessage.content}"</span>
          </div>
          {onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="text-xs font-semibold hover:underline ml-2 flex-shrink-0"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {(error || uploadError) && (
        <p className="mb-2 text-xs text-destructive px-1">{error || uploadError}</p>
      )}

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className="relative group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border bg-muted text-xs text-foreground max-w-xs"
            >
              {att.type.startsWith('image/') ? (
                <img src={att.url} alt={att.name} className="w-6 h-6 object-cover rounded" />
              ) : (
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              )}
              <span className="truncate max-w-[120px]">{att.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(idx)}
                className="text-muted-foreground hover:text-destructive p-0.5 rounded"
                aria-label="Remove attachment"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 sm:gap-3 rounded-xl border border-input bg-background/90 px-2 sm:px-3 py-2 shadow-sm relative">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.txt"
        />


        {/* Attachment Button — hidden in edit mode since edit only updates text */}
        {!editingMessage && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 mb-0.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex-shrink-0"
            title="Attach file or image"
            aria-label="Attach file"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
        )}

        {/* Emoji Button & Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="p-1.5 mb-0.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex-shrink-0"
            title="Insert emoji"
            aria-label="Insert emoji"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {showEmojiPicker && (
            <EmojiPickerPopover
              onSelectEmoji={handleSelectEmoji}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={editingMessage ? 'Edit your message...' : placeholder}
          className="flex-1 resize-none max-h-40 bg-transparent px-2 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none leading-6"
        />

        {/* Submit / Save Button */}
        <Button
          type="submit"
          size="sm"
          disabled={!value.trim() && attachments.length === 0}
          className="rounded-full px-3.5 py-2 mb-0.5 flex-shrink-0"
          aria-label={editingMessage ? 'Save edited message' : 'Send message'}
        >
          {editingMessage ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </Button>
      </div>
      {footer}
    </form>
  );
}
