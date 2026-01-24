'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterToggle: () => void;
  resultCount: number;
}

const SearchBar = ({ searchQuery, onSearchChange, onFilterToggle, resultCount }: SearchBarProps) => {
  return (
    <div className="bg-card rounded-xl shadow-md p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Icon
            name="MagnifyingGlassIcon"
            size={20}
            variant="outline"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search resources by title, description, or tags..."
            className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          onClick={onFilterToggle}
          className="lg:hidden flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          <Icon name="AdjustmentsHorizontalIcon" size={20} variant="outline" />
          <span>Filters</span>
        </button>
      </div>

      {searchQuery && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="InformationCircleIcon" size={16} variant="outline" />
          <span>
            Found <span className="font-semibold text-foreground">{resultCount}</span> resources
          </span>
        </div>
      )}
    </div>
  );
};

export default SearchBar;