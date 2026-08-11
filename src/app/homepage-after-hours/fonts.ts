import { Spectral, Karla, JetBrains_Mono } from 'next/font/google';

// "After Hours" type system — Spectral is a quiet literary serif (real
// italics) used nowhere else across the design concepts; it carries the
// "thought written down at night" feeling without reaching for Fraunces'
// high-contrast display drama or Source Serif's formal document tone.
// Karla is a warm, slightly rounded grotesk for body copy — distinct from
// every other concept's body face (Source Sans 3 / Manrope). JetBrains Mono
// is reused for the same reason prior concepts reused it: it's the thread
// that ties every design back to the same product, spent here on the live
// clock readout and small "desk label" tags.
export const spectral = Spectral({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

export const karla = Karla({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});
