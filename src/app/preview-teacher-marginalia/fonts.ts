import { Lora, Karla, Caveat } from 'next/font/google';

// "Marginalia" type system — Lora is a warm literary serif for headings,
// distinct from the homepage's Source Serif 4. Karla carries the body copy.
// Caveat is spent only on the literal margin notes/annotations, never on
// body text, so it reads as a real handwritten note, not a gimmick.
export const lora = Lora({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-mg-display',
  display: 'swap',
});

export const karla = Karla({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mg-body',
  display: 'swap',
});

export const caveat = Caveat({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-mg-script',
  display: 'swap',
});
