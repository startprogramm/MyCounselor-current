'use client';

import React, { useState } from 'react';

export interface MessageAttachment {
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface ChatMessageItemData {
  id: number;
  senderRole: string;
  isOwnMessage: boolean;
  content: string;
  timestamp: string;
  createdAt: string;
  attachments?: MessageAttachment[];
  isEdited?: boolean;
  isDeleted?: boolean;
  senderName?: string;
  senderAvatar?: string;
  senderInitials?: string;
}

interface ChatMessageBubbleProps {
  message: ChatMessageItemData;
  onEdit?: (message: ChatMessageItemData) => void;
  onDelete?: (messageId: number) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ChatMessageBubble({
  message,
  onEdit,
  onDelete,
}: ChatMessageBubbleProps) {
  const { isOwnMessage, content, timestamp, attachments = [], isEdited, isDeleted, senderAvatar, senderInitials, senderName } = message;
  const [showImageModal, setShowImageModal] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isDeleted) {
    return (
      <div className={`flex items-end gap-2.5 my-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        {!isOwnMessage && (
          <div className="w-8 h-8 rounded-full border border-border bg-card overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
            {senderAvatar ? (
              <img src={senderAvatar} alt={senderName || 'Avatar'} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-semibold text-primary">{senderInitials || '?'}</span>
            )}
          </div>
        )}
        <div className="max-w-[84%] sm:max-w-[70%]">
          <div className="rounded-2xl px-4 py-2 border border-border/60 bg-muted/40 text-muted-foreground italic text-sm">
            <span className="flex items-center gap-1.5 text-xs opacity-80">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              This message was deleted
            </span>
          </div>
          <p className={`text-[11px] text-muted-foreground mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            {timestamp}
          </p>
        </div>
      </div>
    );
  }

  const imageAttachments = attachments.filter((att) => att.type.startsWith('image/'));
  const fileAttachments = attachments.filter((att) => !att.type.startsWith('image/'));

  return (
    <>
      <div
        className={`group relative flex items-end gap-2.5 my-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
        onMouseLeave={() => {
          setShowOptions(false);
          setConfirmDelete(false);
        }}
      >
        {!isOwnMessage && (
          <div className="w-8 h-8 rounded-full border border-border bg-card overflow-hidden flex items-center justify-center mb-1 flex-shrink-0 shadow-sm">
            {senderAvatar ? (
              <img src={senderAvatar} alt={senderName || 'Avatar'} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-semibold text-primary">{senderInitials || '?'}</span>
            )}
          </div>
        )}

        <div className="relative max-w-[84%] sm:max-w-[70%]">
          {/* Action options button for message owner */}
          {isOwnMessage && (onEdit || onDelete) && (
            <div className="absolute top-1 -left-12 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-card/90 border border-border rounded-lg p-0.5 shadow-sm z-10 backdrop-blur-xs">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(message)}
                  className="p-1 text-muted-foreground hover:text-primary hover:bg-muted rounded transition-colors"
                  title="Edit message"
                  aria-label="Edit message"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirmDelete) {
                      onDelete(message.id);
                    } else {
                      setConfirmDelete(true);
                    }
                  }}
                  className={`p-1 rounded transition-colors ${
                    confirmDelete
                      ? 'bg-destructive text-destructive-foreground font-bold'
                      : 'text-muted-foreground hover:text-destructive hover:bg-muted'
                  }`}
                  title={confirmDelete ? 'Click to confirm delete' : 'Delete message'}
                  aria-label="Delete message"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          )}

          <div
            className={`rounded-2xl px-4 py-2.5 border ${
              isOwnMessage
                ? 'bg-sky-500 text-white border-sky-600/40 rounded-br-md shadow-[0_8px_18px_-10px_rgba(14,165,233,0.9)]'
                : 'bg-card/95 text-foreground border-border rounded-bl-md shadow-sm backdrop-blur-[1px]'
            }`}
          >
            {/* Image Attachments */}
            {imageAttachments.length > 0 && (
              <div className="mb-2 grid gap-1.5 grid-cols-1 sm:grid-cols-2">
                {imageAttachments.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setShowImageModal(img.url)}
                    className="relative overflow-hidden rounded-lg border border-white/20 group/img focus:outline-none"
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full max-h-48 object-cover rounded-lg transition-transform duration-200 group-hover/img:scale-105"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Document / File Attachments */}
            {fileAttachments.length > 0 && (
              <div className="mb-2 space-y-1.5">
                {fileAttachments.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.url}
                    download={file.name}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium border transition-colors ${
                      isOwnMessage
                        ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                        : 'bg-muted/80 hover:bg-muted border-border text-foreground'
                    }`}
                  >
                    <div className={`p-1.5 rounded ${isOwnMessage ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{file.name}</p>
                      <p className="text-[10px] opacity-75">{formatFileSize(file.size)}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* Message Text */}
            {content && (
              <p className="text-sm leading-6 whitespace-pre-wrap break-words">{content}</p>
            )}
          </div>

          {/* Timestamp and Edit status */}
          <div className={`flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <span>{isOwnMessage ? 'You' : senderName || message.senderRole}</span>
            <span>•</span>
            <span>{timestamp}</span>
            {isEdited && (
              <span className="italic text-[10px] opacity-75">(edited)</span>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Image Preview Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={showImageModal} alt="Preview" className="max-w-full max-h-[85vh] rounded-lg object-contain" />
            <button
              type="button"
              onClick={() => setShowImageModal(null)}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-2 hover:bg-black"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
