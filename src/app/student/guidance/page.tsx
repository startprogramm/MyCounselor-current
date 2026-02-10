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
    description: 'Learn how to craft compelling personal statements that stand out to admissions officers.',
    category: 'college',
    type: 'Guide',
    readTime: '15 min',
    featured: true,
  },
  {
    id: 2,
    title: 'SAT/ACT Preparation Strategies',
    description: 'Proven techniques to improve your standardized test scores and build test-taking confidence.',
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

export default function StudentGuidancePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = resources.filter((resource) => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredResources = resources.filter((r) => r.featured);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'college': return 'bg-primary/10 text-primary';
      case 'career': return 'bg-secondary/10 text-secondary';
      case 'academic': return 'bg-accent/10 text-accent';
      case 'wellness': return 'bg-success/10 text-success';
      default: return 'bg-muted text-muted-foreground';
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
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Featured Resources */}
      {selectedCategory === 'all' && !searchQuery && (
        <ContentCard title="Featured Resources">
          <div className="grid sm:grid-cols-2 gap-4">
            {featuredResources.map((resource) => (
              <Card key={resource.id} className="p-5" hover>
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(resource.category)}`}>
                    {resource.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{resource.readTime}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{resource.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                <Button variant="outline" size="sm" fullWidth>
                  Read More
                </Button>
              </Card>
            ))}
          </div>
        </ContentCard>
      )}

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="p-5" hover>
            <div className="flex items-start justify-between mb-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(resource.category)}`}>
                {resource.category}
              </span>
              <span className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                {resource.type}
              </span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">{resource.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{resource.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {resource.readTime}
              </span>
              <Button variant="ghost" size="sm">
                View
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-12 h-12 mx-auto text-muted-foreground mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-muted-foreground">No resources found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
