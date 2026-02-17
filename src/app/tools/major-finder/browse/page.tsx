'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { majors, fields, type Field } from '../data/majors';

type SortOption = 'name' | 'salary' | 'growth';

export default function BrowsePage() {
  const [search, setSearch] = useState('');
  const [selectedFields, setSelectedFields] = useState<Field[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleField = (field: Field) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const growthValue = (outlook: string) => {
    if (outlook === 'High') return 3;
    if (outlook === 'Medium') return 2;
    return 1;
  };

  const salaryValue = (range: string) => {
    const match = range.match(/\$(\d+)k/);
    return match ? parseInt(match[1]) : 0;
  };

  const filteredMajors = useMemo(() => {
    let result = [...majors];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.field.toLowerCase().includes(q) ||
          m.careers.some((c) => c.toLowerCase().includes(q)) ||
          m.interestTags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedFields.length > 0) {
      result = result.filter((m) => selectedFields.includes(m.field));
    }

    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'salary') {
      result.sort((a, b) => salaryValue(b.salaryRange) - salaryValue(a.salaryRange));
    } else {
      result.sort((a, b) => growthValue(b.growthOutlook) - growthValue(a.growthOutlook));
    }

    return result;
  }, [search, selectedFields, sortBy]);

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

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground font-heading mb-2">Browse All Majors</h1>
            <p className="text-muted-foreground">
              Search, filter, and explore the full catalog of {majors.length} college majors.
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Icon name="MagnifyingGlassIcon" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" variant="outline" />
            <input
              type="text"
              placeholder="Search by name, career, or interest..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent"
            />
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2">
                {fields.map((field) => {
                  const isSelected = selectedFields.includes(field);
                  return (
                    <button
                      key={field}
                      onClick={() => toggleField(field)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-[#1A73E8] text-white'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {field}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
              >
                <option value="name">Name</option>
                <option value="salary">Salary</option>
                <option value="growth">Growth Outlook</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredMajors.length} of {majors.length} majors
          </p>

          {/* Major Cards */}
          <div className="space-y-3">
            {filteredMajors.map((major) => {
              const isExpanded = expandedId === major.id;
              return (
                <div
                  key={major.id}
                  className="bg-card rounded-xl border border-border overflow-hidden transition-shadow hover:shadow-md"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : major.id)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div>
                        <h3 className="font-bold text-foreground">{major.name}</h3>
                        <span className="text-xs text-muted-foreground">{major.field}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="text-sm text-muted-foreground hidden sm:block">{major.salaryRange}</span>
                      <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${growthColor(major.growthOutlook)}`}>
                        {major.growthOutlook}
                      </span>
                      <Icon
                        name="ChevronDownIcon"
                        size={18}
                        className={`text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        variant="outline"
                      />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-border pt-4">
                      <p className="text-sm text-muted-foreground mb-4">{major.description}</p>

                      <div className="grid sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">Career Paths</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {major.careers.map((career) => (
                              <li key={career} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#1A73E8] flex-shrink-0" />
                                {career}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">Key Skills</p>
                          <div className="flex flex-wrap gap-1.5">
                            {major.skills.map((skill) => (
                              <span key={skill} className="text-xs px-2 py-0.5 bg-[#1A73E8]/10 text-[#1A73E8] rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Salary: </span>
                          <span className="font-medium text-foreground">{major.salaryRange}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Growth: </span>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${growthColor(major.growthOutlook)}`}>
                            {major.growthOutlook}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredMajors.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="MagnifyingGlassIcon" size={48} className="mx-auto mb-4 opacity-40" variant="outline" />
              <p className="text-lg">No majors found matching your search</p>
              <button
                onClick={() => { setSearch(''); setSelectedFields([]); }}
                className="mt-3 text-[#1A73E8] hover:text-[#185ABC] font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
