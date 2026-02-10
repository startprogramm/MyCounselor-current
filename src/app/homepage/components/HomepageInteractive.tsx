'use client';

import React from 'react';
import HeroSection from './HeroSection';
import QuickAccessCards from './QuickAccessCards';
import StatsSection from './StatsSection';
import FeaturesSection from './FeaturesSection';
import TestimonialsSection from './TestimonialsSection';
import CTASection from './CTASection';
import TrustSignalsSection from './TrustSignalsSection';
import Footer from './Footer';

const HomepageInteractive = () => {
  return (
    <>
      <HeroSection />
      <QuickAccessCards />
      <StatsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <TrustSignalsSection />
      <CTASection />
      <Footer />
    </>
  );
};

export default HomepageInteractive;