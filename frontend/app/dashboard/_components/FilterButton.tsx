'use client';

import * as React from 'react';
import { FilterPopover } from './FilterPopover';
import { FilterChips } from './FilterChips';
import { useFilterStore } from '@/lib/stores/filter-store';

export function FilterButton() {
  const { hasActiveFilters } = useFilterStore();

  return (
    <div className="flex flex-col gap-4">
      {/* Filter Button with Popover */}
      <div className="flex items-center gap-3">
        <FilterPopover />

        {hasActiveFilters() && (
          <span className="font-mono text-xs text-muted-foreground">
            Active filters applied
          </span>
        )}
      </div>

      {/* Active Filters Chips */}
      <FilterChips />
    </div>
  );
}
