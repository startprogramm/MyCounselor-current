import { Space_Grotesk, Work_Sans, JetBrains_Mono } from 'next/font/google';

// "Trailhead" type system — Space Grotesk is a confident geometric display
// face for trail-sign energy; Work Sans is a clean humanist body face, both
// unused by the homepage or other role concepts. JetBrains Mono carries the
// waypoint labels / mile-marker readouts.
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-tr-display',
  display: 'swap',
});

export const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-tr-body',
  display: 'swap',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-tr-mono',
  display: 'swap',
});
