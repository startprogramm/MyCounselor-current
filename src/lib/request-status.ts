export type RequestStatus = 'pending' | 'in_progress' | 'approved' | 'completed';

const REQUEST_STATUS_ALIASES: Record<string, RequestStatus> = {
  pending: 'pending',
  new: 'pending',
  open: 'pending',
  waiting: 'pending',
  in_progress: 'in_progress',
  inprogress: 'in_progress',
  'in-progress': 'in_progress',
  'in progress': 'in_progress',
  processing: 'in_progress',
  active: 'in_progress',
  approved: 'approved',
  accepted: 'approved',
  reviewed: 'approved',
  completed: 'completed',
  complete: 'completed',
  done: 'completed',
  closed: 'completed',
  resolved: 'completed',
};

export function normalizeRequestStatus(value: string | null | undefined): RequestStatus {
  const normalized = (value || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

  return REQUEST_STATUS_ALIASES[normalized] || 'pending';
}

export function getRequestStatusLabel(status: RequestStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'in_progress':
      return 'In Progress';
    case 'approved':
      return 'Approved';
    case 'completed':
      return 'Completed';
    default:
      return 'Pending';
  }
}
