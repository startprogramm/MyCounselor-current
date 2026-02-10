'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import ResourceCard from './ResourceCard';
import FilterPanel from './FilterPanel';
import SearchBar from './SearchBar';
import CategoryTabs from './CategoryTabs';
import RecommendedResources from './RecommendedResources';
import CrisisResourcesBanner from './CrisisResourcesBanner';
import ResourceStats from './ResourceStats';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  format: string;
  image: string;
  alt: string;
  rating: number;
  reviews: number;
  downloads: number;
  gradeLevel: string[];
  urgency: string;
  tags: string[];
}

const ResourceDiscoveryInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [bookmarkedResources, setBookmarkedResources] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeFilters, setActiveFilters] = useState({
    category: 'all',
    format: 'all',
    gradeLevel: 'all',
    urgency: 'all'
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const mockResources: Resource[] = [
  {
    id: '1',
    title: 'College Application Timeline Guide',
    description: 'Comprehensive step-by-step guide covering every stage of the college application process from junior year through acceptance.',
    category: 'College & Career',
    format: 'PDF',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_14958d00f-1766508330962.png",
    alt: 'Open notebook with college planning checklist and colorful sticky notes on wooden desk',
    rating: 4.8,
    reviews: 234,
    downloads: 1567,
    gradeLevel: ['Grade 11', 'Grade 11'],
    urgency: 'Medium',
    tags: ['college', 'applications', 'timeline', 'planning']
  },
  {
    id: '2',
    title: 'Effective Test Preparation Strategies',
    description: 'Proven study techniques and preparation methods to improve test performance and build confidence for exams.',
    category: 'Academic Planning',
    format: 'Video',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_19c5e7dc7-1768252373725.png",
    alt: 'Student studying with organized notes and textbooks in library setting',
    rating: 4.9,
    reviews: 456,
    downloads: 2341,
    gradeLevel: ['Grade 9', 'Grade 10', 'Grade 11'],
    urgency: 'High',
    tags: ['test prep', 'study strategies', 'exams', 'academic']
  },
  {
    id: '3',
    title: 'Career Exploration Interactive Tool',
    description: 'Interactive assessment tool that matches your interests, skills, and values with potential career paths and educational requirements.',
    category: 'College & Career',
    format: 'Interactive',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_190376709-1768145479973.png",
    alt: 'Professional workspace with laptop showing career assessment dashboard and colorful charts',
    rating: 4.7,
    reviews: 189,
    downloads: 987,
    gradeLevel: ['Grade 10', 'Grade 11', 'Grade 11'],
    urgency: 'Low',
    tags: ['career', 'exploration', 'assessment', 'planning']
  },
  {
    id: '4',
    title: 'Academic Goal Setting Workbook',
    description: 'Step-by-step workbook to help students set, track, and achieve their academic goals throughout the school year.',
    category: 'Academic Planning',
    format: 'Article',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1a7939383-1767265721815.png",
    alt: 'Student writing goals in planner with organized desk and educational materials',
    rating: 5.0,
    reviews: 678,
    downloads: 3456,
    gradeLevel: ['Grade 9', 'Grade 10', 'Grade 11'],
    urgency: 'Medium',
    tags: ['goals', 'planning', 'academic', 'organization']
  },
  {
    id: '5',
    title: 'Study Skills Mastery Workshop',
    description: 'Comprehensive workshop covering effective note-taking, time management, memory techniques, and exam preparation strategies.',
    category: 'Academic Planning',
    format: 'Video',
    image: "https://images.unsplash.com/photo-1648757863450-b3a05f6c7529",
    alt: 'Organized study desk with open textbooks, colorful highlighters, and laptop showing study schedule',
    rating: 4.6,
    reviews: 312,
    downloads: 1789,
    gradeLevel: ['Grade 9', 'Grade 10', 'Grade 11'],
    urgency: 'Medium',
    tags: ['study skills', 'academic', 'time management', 'organization']
  },
  {
    id: '6',
    title: 'Financial Aid & Scholarship Guide',
    description: 'Complete guide to understanding financial aid options, FAFSA completion, scholarship search strategies, and application tips.',
    category: 'College & Career',
    format: 'PDF',
    image: "https://images.unsplash.com/photo-1584346881556-19b8804d414f",
    alt: 'Calculator and financial documents with scholarship application forms on desk',
    rating: 4.8,
    reviews: 523,
    downloads: 2876,
    gradeLevel: ['Grade 11', 'Grade 11'],
    urgency: 'High',
    tags: ['financial aid', 'scholarships', 'FAFSA', 'college funding']
  },
  {
    id: '7',
    title: 'Teamwork & Collaboration Skills',
    description: 'Interactive guide on developing effective teamwork, communication, and collaboration skills for group projects and school activities.',
    category: 'Academic Planning',
    format: 'Interactive',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1386a8344-1766873944617.png",
    alt: 'Diverse group of students working together on a school project at library table',
    rating: 4.7,
    reviews: 267,
    downloads: 1432,
    gradeLevel: ['Grade 9', 'Grade 10', 'Grade 11'],
    urgency: 'Low',
    tags: ['teamwork', 'collaboration', 'communication', 'group projects']
  },
  {
    id: '8',
    title: 'Parent Guide: Supporting Your Teen',
    description: 'Comprehensive resource for parents on understanding adolescent development, effective communication, and supporting academic success.',
    category: 'Parent Resources',
    format: 'PDF',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_16cb74b4a-1764834719862.png",
    alt: 'Parent and teenager having positive conversation at kitchen table with open books',
    rating: 4.9,
    reviews: 445,
    downloads: 2134,
    gradeLevel: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 11'],
    urgency: 'Low',
    tags: ['parents', 'family', 'communication', 'support']
  }];


  const categories = [
  { id: 'all', name: 'All Resources', icon: 'FolderIcon', count: mockResources.length },
  { id: 'College & Career', name: 'College & Career', icon: 'AcademicCapIcon', count: 3 },
  { id: 'Academic Planning', name: 'Academic Planning', icon: 'BookOpenIcon', count: 4 },
  { id: 'Parent Resources', name: 'Parent Resources', icon: 'UserGroupIcon', count: 1 }];


  const filters = {
    categories: ['all', 'College & Career', 'Academic Planning', 'Parent Resources'],
    formats: ['all', 'Video', 'PDF', 'Interactive', 'Article'],
    gradeLevels: ['all', 'Grade 9', 'Grade 10', 'Grade 11'],
    urgencyLevels: ['all', 'High', 'Medium', 'Low']
  };

  const recommendedResources = [
  {
    id: '1',
    title: 'SAT Prep Strategies',
    category: 'Academic Planning',
    image: "https://images.unsplash.com/photo-1518135634229-bbde19020fef",
    alt: 'SAT test preparation materials with pencils and answer sheet on desk',
    reason: 'Based on your Grade 11 profile'
  },
  {
    id: '2',
    title: 'Stress Management Techniques',
    category: 'Mental Health',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_155a316f2-1765132774555.png",
    alt: 'Peaceful yoga mat and meditation cushion in serene room with plants',
    reason: 'Popular among your peers'
  },
  {
    id: '3',
    title: 'Resume Building Workshop',
    category: 'College & Career',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1026f1214-1767550865778.png",
    alt: 'Professional resume template on laptop screen with coffee cup nearby',
    reason: 'Recommended by your counselor'
  }];


  const stats = {
    totalResources: 247,
    totalDownloads: 18456,
    averageRating: 4.7,
    newThisWeek: 12
  };

  const filteredResources = mockResources.filter((resource) => {
    const matchesSearch =
    searchQuery === '' ||
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
    const matchesFilterCategory = activeFilters.category === 'all' || resource.category === activeFilters.category;
    const matchesFormat = activeFilters.format === 'all' || resource.format === activeFilters.format;
    const matchesGradeLevel =
    activeFilters.gradeLevel === 'all' || resource.gradeLevel.includes(activeFilters.gradeLevel);
    const matchesUrgency = activeFilters.urgency === 'all' || resource.urgency === activeFilters.urgency;

    return matchesSearch && matchesCategory && matchesFilterCategory && matchesFormat && matchesGradeLevel && matchesUrgency;
  });

  const handleBookmark = (id: string) => {
    if (!isHydrated) return;
    setBookmarkedResources((prev) =>
    prev.includes(id) ? prev.filter((resourceId) => resourceId !== id) : [...prev, id]
    );
  };

  const handleViewResource = (id: string) => {
    if (!isHydrated) return;
    console.log('Viewing resource:', id);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (!isHydrated) return;
    setActiveFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleClearFilters = () => {
    if (!isHydrated) return;
    setActiveFilters({
      category: 'all',
      format: 'all',
      gradeLevel: 'all',
      urgency: 'all'
    });
    setActiveCategory('all');
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded-lg w-1/3" />
            <div className="h-64 bg-muted rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) =>
              <div key={i} className="h-96 bg-muted rounded-xl" />
              )}
            </div>
          </div>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-background pt-20 px-4 lg:px-6">
      <div className="max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-3">
            Resource Discovery Center
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore our comprehensive library of guidance materials, tools, and support resources
          </p>
        </div>

        <CrisisResourcesBanner />
        <ResourceStats stats={stats} />
        <RecommendedResources resources={recommendedResources} />

        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory} />


        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
          resultCount={filteredResources.length} />


        <div className="flex gap-6">
          <FilterPanel
            filters={filters}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)} />


          <div className="flex-1">
            {filteredResources.length === 0 ?
            <div className="bg-card rounded-xl shadow-md p-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-muted rounded-full">
                    <Icon name="MagnifyingGlassIcon" size={48} variant="outline" className="text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-heading font-bold text-foreground mb-2">No Resources Found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or filters to find what you're looking for
                </p>
                <button
                onClick={handleClearFilters}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">

                  Clear All Filters
                </button>
              </div> :

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredResources.map((resource) =>
              <ResourceCard
                key={resource.id}
                resource={resource}
                onBookmark={handleBookmark}
                onView={handleViewResource}
                isBookmarked={bookmarkedResources.includes(resource.id)} />

              )}
              </div>
            }
          </div>
        </div>
      </div>
    </div>);

};

export default ResourceDiscoveryInteractive;