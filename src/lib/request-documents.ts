import type { Json } from '@/lib/database.types';

export interface RequestDocument {
  name: string;
  data: string;
  type: string;
  uploadedAt: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeDocument(value: unknown): RequestDocument | null {
  if (!isObject(value)) return null;

  const name = typeof value.name === 'string' ? value.name.trim() : '';
  const data = typeof value.data === 'string' ? value.data : '';
  const type = typeof value.type === 'string' ? value.type : 'application/octet-stream';
  const uploadedAt = typeof value.uploadedAt === 'string' ? value.uploadedAt : '';

  if (!name || !data) return null;

  return {
    name,
    data,
    type,
    uploadedAt,
  };
}

export function parseRequestDocuments(raw: unknown): RequestDocument[] {
  if (Array.isArray(raw)) {
    return raw
      .map((value) => normalizeDocument(value))
      .filter((value): value is RequestDocument => value !== null);
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];

      return parsed
        .map((value) => normalizeDocument(value))
        .filter((value): value is RequestDocument => value !== null);
    } catch {
      return [];
    }
  }

  return [];
}

export function toRequestDocumentsJson(documents: RequestDocument[]): Json {
  return documents.map((document) => ({
    name: document.name,
    data: document.data,
    type: document.type,
    uploadedAt: document.uploadedAt,
  })) as Json;
}
