import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';

// "Control Room" type system — IBM Plex Sans for both display and body
// (technical, operator-console tone), IBM Plex Mono for status counts,
// timestamps, and IDs — the vocabulary of a dashboard, not a letter.
export const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cr-sans',
  display: 'swap',
});

export const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-cr-mono',
  display: 'swap',
});
