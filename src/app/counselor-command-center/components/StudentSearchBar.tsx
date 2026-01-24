'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface StudentSearchBarProps {
  onSearch: (query: string) => void;
}

const StudentSearchBar = ({ onSearch }: StudentSearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search students by name, ID, or concern..."
        className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      <Icon
        name="MagnifyingGlassIcon"
        size={20}
        variant="outline"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => {
            setSearchQuery('');
            onSearch('');
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <Icon name="XMarkIcon" size={20} variant="outline" />
        </button>
      )}
    </form>
  );
};

export default StudentSearchBar;