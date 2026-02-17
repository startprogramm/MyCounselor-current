'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';

const pathways = [
  {
    title: 'Quick Quiz',
    description: 'Answer a few questions and get matched with majors instantly.',
    icon: 'BoltIcon',
    href: '/tools/major-finder/quiz',
    color: 'from-[#1A73E8] to-[#4285F4]',
    iconBg: 'bg-[#1A73E8]',
    time: '~3 minutes',
  },
  {
    title: 'Explore by Interest',
    description: 'Browse categories that excite you and discover matching majors.',
    icon: 'MagnifyingGlassIcon',
    href: '/tools/major-finder/explore',
    color: 'from-[#1E8E3E] to-[#34A853]',
    iconBg: 'bg-[#1E8E3E]',
    time: 'Self-paced',
  },
  {
    title: 'Personality Assessment',
    description: 'Discover majors that fit who you are with a RIASEC-style assessment.',
    icon: 'UserCircleIcon',
    href: '/tools/major-finder/assessment',
    color: 'from-[#EA8600] to-[#FBBC04]',
    iconBg: 'bg-[#EA8600]',
    time: '~8 minutes',
  },
  {
    title: 'Browse All Majors',
    description: 'Search and filter the full catalog of college majors.',
    icon: 'AcademicCapIcon',
    href: '/tools/major-finder/browse',
    color: 'from-[#7B1FA2] to-[#AB47BC]',
    iconBg: 'bg-[#7B1FA2]',
    time: 'Reference',
  },
];

export default function MajorFinderPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-[#1A73E8] to-[#4285F4] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Icon name="AcademicCapIcon" size={40} className="text-white" variant="solid" />
            </div>
            <h1 className="text-4xl font-bold text-foreground font-heading mb-3">
              Major Finder
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Not sure what to study in college? Choose a pathway below to discover
              majors that match your interests, personality, and goals.
            </p>
          </div>

          {/* Pathway Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {pathways.map((pathway) => (
              <Link
                key={pathway.href}
                href={pathway.href}
                className="group relative bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Gradient top bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${pathway.color}`} />

                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 ${pathway.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon name={pathway.icon} size={28} className="text-white" variant="solid" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-xl font-bold text-foreground group-hover:text-[#1A73E8] transition-colors">
                        {pathway.title}
                      </h2>
                      <Icon name="ArrowRightIcon" size={20} className="text-muted-foreground group-hover:text-[#1A73E8] group-hover:translate-x-1 transition-all" variant="outline" />
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">
                      {pathway.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                      <Icon name="ClockIcon" size={12} variant="outline" />
                      {pathway.time}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Back Link */}
          <div className="text-center mt-10">
            <Link
              href="/homepage"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Icon name="ArrowLeftIcon" size={20} variant="outline" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
