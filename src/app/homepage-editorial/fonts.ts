import { Archivo, Manrope } from 'next/font/google';

// Distinctive type system for the "Editorial" concept — a bold geometric
// grotesk for display type, paired with a warm, neutral sans for body/UI.
// Deliberately separate from both the live app's Inter/Source Sans 3 and
// the Fraunces/Plex pairing used in the "Dossier" concept.
export const archivo = Archivo({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
});

export const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
});
