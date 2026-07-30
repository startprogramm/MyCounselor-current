import type { Metadata } from 'next';
import './redesign.css';
import { fraunces, plexSans, plexMono } from './fonts';
import HomepageRedesignInteractive from './components/HomepageRedesignInteractive';

export const metadata: Metadata = {
  title: 'Homepage Redesign Concept - MyCounselor',
  description: 'Internal design concept preview — not the live homepage.',
  robots: { index: false, follow: false },
};

export default function HomepageRedesignPage() {
  return (
    <main className={`homepage-redesign min-h-screen ${fraunces.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <HomepageRedesignInteractive />
    </main>
  );
}
