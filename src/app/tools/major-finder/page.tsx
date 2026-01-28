'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';

export default function MajorFinderPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-[#2D5A87] to-[#4A90B8] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <Icon name="AcademicCapIcon" size={48} className="text-white" variant="solid" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-foreground font-heading mb-4">
            Major Finder
          </h1>

          {/* Description */}
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover your ideal college major based on your interests, strengths, and career aspirations.
            Take our assessment to find the perfect path for your future.
          </p>

          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-full mb-12">
            <Icon name="ClockIcon" size={20} variant="outline" />
            <span className="font-medium">Coming Soon</span>
          </div>

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 bg-card rounded-xl border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Icon name="ClipboardDocumentCheckIcon" size={24} className="text-primary" variant="outline" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Interest Assessment</h3>
              <p className="text-sm text-muted-foreground">
                Answer questions about your interests and passions to find your match.
              </p>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Icon name="ChartBarIcon" size={24} className="text-primary" variant="outline" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Career Insights</h3>
              <p className="text-sm text-muted-foreground">
                See potential career paths and salary expectations for each major.
              </p>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Icon name="BuildingLibraryIcon" size={24} className="text-primary" variant="outline" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">University Matches</h3>
              <p className="text-sm text-muted-foreground">
                Find universities that excel in your recommended majors.
              </p>
            </div>
          </div>

          {/* Back Link */}
          <Link
            href="/homepage"
            className="inline-flex items-center gap-2 mt-12 text-primary hover:text-primary/80 transition-colors"
          >
            <Icon name="ArrowLeftIcon" size={20} variant="outline" />
            <span>Back to Home</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
