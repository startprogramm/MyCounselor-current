'use client';

import React, { useState } from 'react';
import { Card, ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const categories = [
  { id: 'all', label: 'All Resources' },
  { id: 'college', label: 'College Prep' },
  { id: 'career', label: 'Career Planning' },
  { id: 'academic', label: 'Academic Success' },
  { id: 'wellness', label: 'Wellness' },
];

const resources = [
  {
    id: 1,
    title: 'College Essay Writing Guide',
    description:
      'Learn how to craft compelling personal statements that stand out to admissions officers.',
    category: 'college',
    type: 'Guide',
    readTime: '15 min',
    featured: true,
  },
  {
    id: 2,
    title: 'SAT/ACT Preparation Strategies',
    description:
      'Proven techniques to improve your standardized test scores and build test-taking confidence.',
    category: 'college',
    type: 'Guide',
    readTime: '20 min',
    featured: true,
  },
  {
    id: 3,
    title: 'Career Interest Assessment',
    description: 'Discover career paths that align with your interests, skills, and values.',
    category: 'career',
    type: 'Assessment',
    readTime: '25 min',
    featured: false,
  },
  {
    id: 4,
    title: 'Time Management for Students',
    description: 'Effective strategies to balance academics, extracurriculars, and personal life.',
    category: 'academic',
    type: 'Article',
    readTime: '10 min',
    featured: false,
  },
  {
    id: 5,
    title: 'Managing Academic Stress',
    description: 'Practical mindfulness and coping techniques for student well-being.',
    category: 'wellness',
    type: 'Article',
    readTime: '12 min',
    featured: false,
  },
  {
    id: 6,
    title: 'Scholarship Search Guide',
    description: 'How to find and apply for scholarships to fund your education.',
    category: 'college',
    type: 'Guide',
    readTime: '18 min',
    featured: false,
  },
  {
    id: 7,
    title: 'Resume Building Workshop',
    description: 'Create a standout resume for internships, jobs, and college applications.',
    category: 'career',
    type: 'Workshop',
    readTime: '30 min',
    featured: false,
  },
  {
    id: 8,
    title: 'Study Techniques That Work',
    description: 'Evidence-based study methods to improve retention and academic performance.',
    category: 'academic',
    type: 'Article',
    readTime: '15 min',
    featured: false,
  },
];

const categoryStyleMap: Record<
  string,
  {
    label: string;
    badge: string;
    accent: string;
    iconBox: string;
    iconColor: string;
  }
> = {
  college: {
    label: 'College Prep',
    badge: 'bg-primary/10 text-primary',
    accent: 'bg-primary',
    iconBox: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  career: {
    label: 'Career Planning',
    badge: 'bg-secondary/10 text-secondary',
    accent: 'bg-secondary',
    iconBox: 'bg-secondary/10',
    iconColor: 'text-secondary',
  },
  academic: {
    label: 'Academic Success',
    badge: 'bg-accent/10 text-accent',
    accent: 'bg-accent',
    iconBox: 'bg-accent/10',
    iconColor: 'text-accent',
  },
  wellness: {
    label: 'Wellness',
    badge: 'bg-success/10 text-success',
    accent: 'bg-success',
    iconBox: 'bg-success/10',
    iconColor: 'text-success',
  },
};

export default function StudentGuidancePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = resources.filter((resource) => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredResources = resources.filter((r) => r.featured);

  const getCategoryStyles = (category: string) => {
    return (
      categoryStyleMap[category] || {
        label: 'General',
        badge: 'bg-muted text-muted-foreground',
        accent: 'bg-muted',
        iconBox: 'bg-muted',
        iconColor: 'text-muted-foreground',
      }
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'college':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 14l9-5-9-5-9 5 9 5zm0 0l7.5-4.167M12 14v7"
            />
          </svg>
        );
      case 'career':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7h18M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2m-2 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V7h10z"
            />
          </svg>
        );
      case 'academic':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        );
      case 'wellness':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 010 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
          Guidance Resources
        </h1>
        <p className="text-muted-foreground mt-1">
          Explore resources for college prep, career planning, and more
        </p>
      </div>

      {/* Search */}
      <div className="relative rounded-xl border border-border bg-card p-1">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-transparent bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Featured Resources */}
      {selectedCategory === 'all' && !searchQuery && (
        <ContentCard
          title="Featured Resources"
          description="Recommended starting points picked for students."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            {featuredResources.map((resource) => {
              const styles = getCategoryStyles(resource.category);

              return (
                <Card key={resource.id} className="p-0 overflow-hidden" hover>
                  <div className={`h-1 ${styles.accent}`} />
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${styles.iconBox} ${styles.iconColor}`}
                        >
                          {getCategoryIcon(resource.category)}
                        </div>
                        <div className="min-w-0">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${styles.badge}`}
                          >
                            {styles.label}
                          </span>
                          <h3 className="font-semibold text-foreground mt-2 leading-snug">
                            {resource.title}
                          </h3>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {resource.readTime}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {resource.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-border/70">
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-muted text-xs text-muted-foreground">
                        {resource.type}
                      </span>
                      <Button variant="outline" size="sm">
                        Open Resource
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </ContentCard>
      )}

      {/* Categories */}
      <div className="rounded-xl border border-border bg-card p-2">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-card text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((resource) => {
          const styles = getCategoryStyles(resource.category);

          return (
            <Card key={resource.id} className="p-0 overflow-hidden h-full" hover>
              <div className={`h-1 ${styles.accent}`} />
              <div className="p-5 flex flex-col h-full">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${styles.iconBox} ${styles.iconColor}`}
                    >
                      {getCategoryIcon(resource.category)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground leading-snug line-clamp-2">
                        {resource.title}
                      </h3>
                      <span
                        className={`inline-flex mt-1 px-2.5 py-1 rounded-full text-xs font-medium ${styles.badge}`}
                      >
                        {styles.label}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground whitespace-nowrap">
                    {resource.type}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mt-4 mb-4 line-clamp-3 leading-relaxed flex-1">
                  {resource.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-border/70">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {resource.readTime}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary hover:bg-primary/10"
                  >
                    View
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-12 h-12 mx-auto text-muted-foreground mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-muted-foreground">No resources found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
