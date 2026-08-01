import { formatDateSeparator } from '@/lib/chat-date';

export default function ChatDateDivider({ iso }: { iso: string }) {
  return (
    <div className="flex items-center justify-center py-1">
      <span className="px-3 py-1 rounded-full bg-muted text-[11px] font-medium text-muted-foreground border border-border">
        {formatDateSeparator(iso)}
      </span>
    </div>
  );
}
