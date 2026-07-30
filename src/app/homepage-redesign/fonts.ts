import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';

// Distinctive type system for the "Dossier" concept — deliberately not the
// Inter/Source Sans 3 pairing used by the live app, and not the Playfair +
// cream-serif combo that's become an AI-design default.
export const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

export const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});
