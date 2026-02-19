'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Card, ContentCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { makeUserCacheKey, readCachedData, writeCachedData } from '@/lib/client-cache';
import { startVisibilityAwarePolling } from '@/lib/polling';

const categories = [
  { id: 'all', label: 'All Resources' },
  { id: 'college', label: 'College Prep' },
  { id: 'career', label: 'Career Planning' },
  { id: 'academic', label: 'Academic Success' },
  { id: 'wellness', label: 'Wellness' },
];

interface GuidanceResource {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  readTime: string;
  featured: boolean;
}

interface StudentGuidanceCachePayload {
  resources: GuidanceResource[];
}

const STUDENT_GUIDANCE_CACHE_TTL_MS = 3 * 60 * 1000;

const categoryStyleMap: Record<
  string,
  {
    label: string;
    textColor: string;
    accent: string;
    iconBox: string;
    iconColor: string;
  }
> = {
  college: {
    label: 'College Prep',
    textColor: 'text-primary',
    accent: 'bg-primary',
    iconBox: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  career: {
    label: 'Career Planning',
    textColor: 'text-secondary',
    accent: 'bg-secondary',
    iconBox: 'bg-secondary/10',
    iconColor: 'text-secondary',
  },
  academic: {
    label: 'Academic Success',
    textColor: 'text-accent',
    accent: 'bg-accent',
    iconBox: 'bg-accent/10',
    iconColor: 'text-accent',
  },
  wellness: {
    label: 'Wellness',
    textColor: 'text-success',
    accent: 'bg-success',
    iconBox: 'bg-success/10',
    iconColor: 'text-success',
  },
};

function estimateReadTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(3, Math.ceil(words / 180));
  return `${minutes} min`;
}

function formatType(value: string) {
  if (!value) return 'Guide';
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function StudentGuidancePage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<GuidanceResource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [loadResourcesError, setLoadResourcesError] = useState('');
  const [hasWarmCache, setHasWarmCache] = useState(false);
  const [isCacheHydrated, setIsCacheHydrated] = useState(false);
  const [hasLoadedFromServer, setHasLoadedFromServer] = useState(false);
  const loadRequestIdRef = useRef(0);
  const resourcesRef = useRef<GuidanceResource[]>([]);
  const hasWarmCacheRef = useRef(false);
  const emptyFetchStreakRef = useRef(0);
  const cacheKey = useMemo(
    () => (user?.id ? makeUserCacheKey('student-guidance', user.id, user.schoolId) : null),
    [user?.id, user?.schoolId]
  );

  useEffect(() => {
    resourcesRef.current = resources;
  }, [resources]);

  useEffect(() => {
    hasWarmCacheRef.current = hasWarmCache;
  }, [hasWarmCache]);

  useLayoutEffect(() => {
    setIsCacheHydrated(false);
    setHasLoadedFromServer(false);
    setLoadResourcesError('');

    if (!cacheKey) {
      setResources([]);
      setHasWarmCache(false);
      setIsCacheHydrated(true);
      return;
    }

    const cached = readCachedData<StudentGuidanceCachePayload>(
      cacheKey,
      STUDENT_GUIDANCE_CACHE_TTL_MS
    );

    if (cached.found && cached.data) {
      setResources(cached.data.resources || []);
      setHasWarmCache(true);
      setIsCacheHydrated(true);
      return;
    }

    setHasWarmCache(false);
    setIsCacheHydrated(true);
  }, [cacheKey]);

  useEffect(() => {
    if (!cacheKey || !isCacheHydrated) return;
    if (!hasWarmCache && !hasLoadedFromServer) return;

    writeCachedData<StudentGuidanceCachePayload>(cacheKey, {
      resources,
    });
  }, [cacheKey, isCacheHydrated, hasLoadedFromServer, hasWarmCache, resources]);

  const loadResources = useCallback(async () => {
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;

    if (!user?.schoolId) {
      if (loadRequestIdRef.current === requestId) {
        setResources([]);
        setLoadResourcesError('');
      }
      return;
    }

    const fetchRows = async () =>
      supabase
        .from('resources')
        .select('id,title,description,category,type,content,created_at')
        .eq('school_id', user.schoolId)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

    const { data, error } = await fetchRows();

    if (loadRequestIdRef.current !== requestId) return;

    if (error || !data) {
      setLoadResourcesError(error?.message || 'Unable to load guidance resources. Please retry.');
      return;
    }

    let mapped = data.map((row, index) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      type: formatType(row.type),
      readTime: estimateReadTime(row.content || row.description),
      featured: index < 2,
    }));

    // Prevent transient empty flashes caused by session refresh race.
    if (mapped.length === 0 && resourcesRef.current.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 450));
      const { data: retryData, error: retryError } = await fetchRows();

      if (loadRequestIdRef.current !== requestId) return;

      if (!retryError && retryData) {
        mapped = retryData.map((row, index) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          category: row.category,
          type: formatType(row.type),
          readTime: estimateReadTime(row.content || row.description),
          featured: index < 2,
        }));
      }
    }

    if (mapped.length === 0 && resourcesRef.current.length > 0) {
      emptyFetchStreakRef.current += 1;
      if (emptyFetchStreakRef.current < 2) {
        setLoadResourcesError('');
        setHasLoadedFromServer(true);
        return;
      }
    } else {
      emptyFetchStreakRef.current = 0;
    }

    setLoadResourcesError('');
    setHasLoadedFromServer(true);
    setResources(mapped);
  }, [user?.schoolId]);

  useEffect(() => {
    if (!user?.id) {
      setResources([]);
      setIsLoadingResources(false);
      return;
    }

    if (!isCacheHydrated) return;

    setIsLoadingResources(!hasWarmCacheRef.current);
    void loadResources().finally(() => setIsLoadingResources(false));
    return startVisibilityAwarePolling(() => loadResources(), 15000);
  }, [user?.id, loadResources, isCacheHydrated]);

  const filteredResources = resources.filter((resource) => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredResources = resources.filter((resource) => resource.featured);
  const isInitializing = !isCacheHydrated && !!user?.id;
  const showLoadingState = (isLoadingResources || isInitializing) && resources.length === 0;

  const getCategoryStyles = (category: string) => {
    return (
      categoryStyleMap[category] || {
        label: 'General',
        textColor: 'text-muted-foreground',
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

      {loadResourcesError && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <svg
            className="w-5 h-5 text-destructive flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-2.5L13.73 4.5c-.77-.83-2.69-.83-3.46 0L3.34 16.5c-.77.83.19 2.5 1.73 2.5z"
            />
          </svg>
          <p className="text-sm text-destructive font-medium">{loadResourcesError}</p>
          <Button size="sm" variant="outline" className="ml-auto" onClick={() => void loadResources()}>
            Retry
          </Button>
        </div>
      )}

      {showLoadingState && (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground">Loading resources...</p>
        </div>
      )}

      {/* Featured Resources */}
      {selectedCategory === 'all' &&
        !searchQuery &&
        featuredResources.length > 0 &&
        !showLoadingState && (
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
                          <p
                            className={`text-[11px] font-semibold uppercase tracking-wide ${styles.textColor}`}
                          >
                            {styles.label}
                          </p>
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
                      <span className="text-xs text-muted-foreground">{resource.type}</span>
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
      <div className="border-b border-border">
        <div className="flex flex-wrap gap-5 px-1 pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`pb-1 border-b-2 text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      {!showLoadingState && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <p
                        className={`mt-1 text-[11px] font-semibold uppercase tracking-wide ${styles.textColor}`}
                      >
                        {styles.label}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
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
      </div>}

      {filteredResources.length === 0 && !showLoadingState && (
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
          <p className="text-muted-foreground">
            {searchQuery || selectedCategory !== 'all'
              ? 'No resources found matching your criteria'
              : 'No published resources yet'}
          </p>
          {!searchQuery && selectedCategory === 'all' && (
            <p className="text-sm text-muted-foreground mt-1">
              Your counselor can publish resources and they will appear here.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
