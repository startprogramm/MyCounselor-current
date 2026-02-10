'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface CategoryTabsProps {
  categories: Array<{
    id: string;
    name: string;
    icon: string;
    count: number;
  }>;
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryTabs = ({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <div className="bg-card rounded-xl shadow-md p-4 mb-6 overflow-x-auto">
      <div className="flex gap-2 min-w-max lg:min-w-0 lg:flex-wrap">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
              activeCategory === category.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            <Icon name={category.icon as any} size={18} variant="outline" />
            <span>{category.name}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeCategory === category.id
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-background text-muted-foreground'
              }`}
            >
              {category.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;