'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface FilterPanelProps {
  filters: {
    categories: string[];
    formats: string[];
    gradeLevels: string[];
    urgencyLevels: string[];
  };
  activeFilters: {
    category: string;
    format: string;
    gradeLevel: string;
    urgency: string;
  };
  onFilterChange: (filterType: string, value: string) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const FilterPanel = ({
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
  isOpen,
  onClose,
}: FilterPanelProps) => {
  const hasActiveFilters = Object.values(activeFilters).some((value) => value !== 'all');

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed lg:sticky top-0 left-0 h-screen lg:h-auto w-80 bg-card shadow-brand lg:shadow-md rounded-none lg:rounded-xl p-6 overflow-y-auto z-50 lg:z-0 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between mb-6 lg:mb-4">
          <h2 className="text-xl font-heading font-bold text-foreground">Filters</h2>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close filters"
          >
            <Icon name="XMarkIcon" size={24} variant="outline" />
          </button>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="w-full mb-6 py-2 px-4 bg-muted text-foreground rounded-lg font-semibold text-sm hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="XCircleIcon" size={16} variant="outline" />
            <span>Clear All Filters</span>
          </button>
        )}

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Icon name="FolderIcon" size={16} variant="outline" />
              Category
            </h3>
            <div className="space-y-2">
              {filters.categories.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={activeFilters.category === category}
                    onChange={(e) => onFilterChange('category', e.target.value)}
                    className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                    {category === 'all' ? 'All Categories' : category}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Icon name="DocumentIcon" size={16} variant="outline" />
              Format
            </h3>
            <div className="space-y-2">
              {filters.formats.map((format) => (
                <label
                  key={format}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="format"
                    value={format}
                    checked={activeFilters.format === format}
                    onChange={(e) => onFilterChange('format', e.target.value)}
                    className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                    {format === 'all' ? 'All Formats' : format}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Icon name="AcademicCapIcon" size={16} variant="outline" />
              Grade Level
            </h3>
            <div className="space-y-2">
              {filters.gradeLevels.map((level) => (
                <label
                  key={level}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="gradeLevel"
                    value={level}
                    checked={activeFilters.gradeLevel === level}
                    onChange={(e) => onFilterChange('gradeLevel', e.target.value)}
                    className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                    {level === 'all' ? 'All Grades' : level}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Icon name="ExclamationTriangleIcon" size={16} variant="outline" />
              Urgency
            </h3>
            <div className="space-y-2">
              {filters.urgencyLevels.map((urgency) => (
                <label
                  key={urgency}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="urgency"
                    value={urgency}
                    checked={activeFilters.urgency === urgency}
                    onChange={(e) => onFilterChange('urgency', e.target.value)}
                    className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                    {urgency === 'all' ? 'All Levels' : urgency}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;