import { GoogleGenAI } from '@google/genai';

export const GEMINI_MODEL = 'gemini-3.6-flash';

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export function missingKeyResponse(feature: string) {
  return {
    error: `${feature} is not configured. Add GEMINI_API_KEY to your environment.`,
  };
}
