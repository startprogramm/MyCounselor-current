// Structured detail for transcript / document requests — the logistics a
// counselor needs to actually fulfill the request (what, where, by when),
// rather than free text they have to parse out of a description field.

export interface DocumentRequestDetails {
  documentType: string;
  destination: string;
  deliveryDetail: string;
  deadline: string;
  additionalInfo: string;
}

export const EMPTY_DOCUMENT_REQUEST_DETAILS: DocumentRequestDetails = {
  documentType: '',
  destination: '',
  deliveryDetail: '',
  deadline: '',
  additionalInfo: '',
};

export const DOCUMENT_TYPES = [
  { value: 'transcript', label: 'Official transcript' },
  { value: 'enrollment_verification', label: 'Enrollment verification letter' },
  { value: 'recommendation_transmittal', label: 'Send a recommendation letter already on file' },
  { value: 'other', label: 'Other document' },
];

export function getDocumentTypeLabel(value: string): string {
  return DOCUMENT_TYPES.find((t) => t.value === value)?.label || value;
}

export function parseDocumentRequestDetails(value: unknown): DocumentRequestDetails | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as Partial<DocumentRequestDetails>;

  const hasAnyContent =
    raw.documentType || raw.destination || raw.deliveryDetail || raw.deadline || raw.additionalInfo;

  if (!hasAnyContent) return undefined;

  return {
    documentType: raw.documentType || '',
    destination: raw.destination || '',
    deliveryDetail: raw.deliveryDetail || '',
    deadline: raw.deadline || '',
    additionalInfo: raw.additionalInfo || '',
  };
}
