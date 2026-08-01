function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
}

export function isSameCalendarDay(isoA: string, isoB: string) {
  return startOfDay(new Date(isoA)) === startOfDay(new Date(isoB));
}

export function formatDateSeparator(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
}
