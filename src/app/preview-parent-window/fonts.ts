import { Petrona, Mulish } from 'next/font/google';

// "The Window" type system — Petrona is a warm, domestic literary serif for
// headings (distinct from the homepage's Source Serif 4). Mulish is a soft,
// rounded humanist body face, unused elsewhere — the warmest body face of
// the four role concepts, matching a parent's outside-looking-in vantage.
export const petrona = Petrona({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-wd-display',
  display: 'swap',
});

export const mulish = Mulish({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-wd-body',
  display: 'swap',
});
