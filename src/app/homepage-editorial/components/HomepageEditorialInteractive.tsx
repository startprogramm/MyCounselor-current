'use client';

import React from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import MissionSection from './MissionSection';
import QuickAccessCards from './QuickAccessCards';
import StatsSection from './StatsSection';
import FeaturesSection from './FeaturesSection';
import TestimonialsSection from './TestimonialsSection';
import TrustSignalsSection from './TrustSignalsSection';
import CTASection from './CTASection';
import Footer from './Footer';

const HomepageEditorialInteractive = () => {
  return (
    <>
      <Header />
      <HeroSection />
      <MissionSection />
      <QuickAccessCards />
      <StatsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <TrustSignalsSection />
      <CTASection />
      <Footer />

      <div className="fixed bottom-4 left-4 z-50 hidden rounded-full border border-[var(--ed-ink)] bg-[var(--ed-paper)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--ed-ink)] shadow-lg sm:block">
        Design concept · not the live site
      </div>
    </>
  );
};

export default HomepageEditorialInteractive;
