import React, { useRef, useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface MessageComposerProps {
  onSendMessage: (content: string, attachments: File[]) => void;
}

const MessageComposer = ({ onSendMessage }: MessageComposerProps) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setAttachments((prev) => [...prev, ...files]);
    event.target.value = '';
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault();

    const trimmed = message.trim();
    if (!trimmed && attachments.length === 0) return;

    onSendMessage(trimmed, attachments);
    setMessage('');
    setAttachments([]);
  };

  return (
    <form onSubmit={handleSend} className="border-t border-border p-4 space-y-3 bg-card">
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-md border border-border p-2 text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon name="PaperClipIcon" size={16} variant="outline" className="text-muted-foreground" />
                <span className="truncate text-foreground">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveAttachment(index)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Icon name="XMarkIcon" size={16} variant="outline" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          title="Attach files"
        >
          <Icon name="PaperClipIcon" size={20} variant="outline" className="text-muted-foreground" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          onChange={handleSelectFiles}
        />

        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Type your message..."
          rows={2}
          className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          disabled={!message.trim() && attachments.length === 0}
        >
          <Icon name="PaperAirplaneIcon" size={18} variant="solid" />
        </button>
      </div>
    </form>
  );
};

export default MessageComposer;
