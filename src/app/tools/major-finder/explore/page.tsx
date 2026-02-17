'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { majors, interestCategories } from '../data/majors';

export default function ExplorePage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const matchedMajors = useMemo(() => {
    if (selectedCategories.length === 0) return [];

    const activeTags = new Set(
      selectedCategories.flatMap(
        (catId) => interestCategories.find((c) => c.id === catId)?.tags || []
      )
    );

    const scored = majors.map((major) => {
      const matchCount = major.interestTags.filter((tag) => activeTags.has(tag)).length;
      return { major, matchCount };
    });

    return scored
      .filter((s) => s.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount);
  }, [selectedCategories]);

  const growthColor = (outlook: string) => {
    if (outlook === 'High') return 'text-[#1E8E3E] bg-[#1E8E3E]/10';
    if (outlook === 'Medium') return 'text-[#EA8600] bg-[#EA8600]/10';
    return 'text-[#5F6368] bg-[#5F6368]/10';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/tools/major-finder"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
          >
            <Icon name="ArrowLeftIcon" size={18} variant="outline" />
            Back to Major Finder
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground font-heading mb-2">Explore by Interest</h1>
            <p className="text-muted-foreground">
              Select up to 3 interest areas that excite you, and we&apos;ll show you matching majors.
            </p>
          </div>

          {/* Interest Category Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {interestCategories.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-[#1A73E8] bg-[#1A73E8]/10 shadow-md'
                      : 'border-border hover:border-[#1A73E8]/40 hover:bg-muted/30'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#1A73E8] rounded-full flex items-center justify-center">
                      <Icon name="CheckIcon" size={12} className="text-white" variant="solid" />
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-[#1A73E8] text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon name={cat.icon} size={24} variant="outline" />
                  </div>
                  <span className={`text-sm font-medium text-center ${isSelected ? 'text-[#1A73E8]' : 'text-foreground'}`}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Results */}
          {selectedCategories.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">
                  Matching Majors ({matchedMajors.length})
                </h2>
                <button
                  onClick={() => setSelectedCategories([])}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {matchedMajors.map(({ major, matchCount }) => (
                  <div
                    key={major.id}
                    className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-foreground">{major.name}</h3>
                        <span className="text-xs text-muted-foreground">{major.field}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: matchCount }).map((_, i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-[#1A73E8]" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{major.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {major.interestTags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                          {tag.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{major.salaryRange}</span>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${growthColor(major.growthOutlook)}`}>
                        {major.growthOutlook} growth
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedCategories.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="CursorArrowRaysIcon" size={48} className="mx-auto mb-4 opacity-40" variant="outline" />
              <p className="text-lg">Select interest categories above to see matching majors</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
