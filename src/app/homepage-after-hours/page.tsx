import type { Metadata } from 'next';
import './after-hours.css';
import { spectral, karla, jetbrainsMono } from './fonts';
import HomepageAfterHoursInteractive from './components/HomepageAfterHoursInteractive';

export const metadata: Metadata = {
  title: 'After Hours Concept - MyCounselor',
  description: 'Internal design concept preview — not the live homepage.',
  robots: { index: false, follow: false },
};

export default function HomepageAfterHoursPage() {
  return (
    <main
      className={`after-hours min-h-screen ${spectral.variable} ${karla.variable} ${jetbrainsMono.variable}`}
    >
      <HomepageAfterHoursInteractive />
    </main>
  );
}
