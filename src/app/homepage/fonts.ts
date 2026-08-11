import { Source_Serif_4, Source_Sans_3, JetBrains_Mono, Caveat } from 'next/font/google';

// "The Letter" type system for the homepage. Source Serif 4 is a formal,
// document-grade display serif; Caveat is spent in exactly two places — the
// hero's closing signature and each testimonial's signoff — never for body
// text, so it reads as a handwritten flourish, not a gimmick.
export const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-letter-display',
  display: 'swap',
});

export const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-letter-body',
  display: 'swap',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-letter-mono',
  display: 'swap',
});

export const caveat = Caveat({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-letter-script',
  display: 'swap',
});
