'use client'

import { useState } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { AnimatePresence, motion } from 'framer-motion'

interface FilterChip {
  label: string
  onRemove: () => void
}

interface SearchFilterBarProps {
  // Search props
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  showSearch?: boolean

  // Filter props
  filterContent?: React.ReactNode
  hasActiveFilters?: boolean
  activeFilterCount?: number
  onClearFilters?: () => void

  // Chips
  filterChips?: FilterChip[]
}

export function SearchFilterBar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  showSearch = true,
  filterContent,
  hasActiveFilters = false,
  activeFilterCount = 0,
  onClearFilters,
  filterChips = [],
}: SearchFilterBarProps) {
  const [localSearchValue, setLocalSearchValue] = useState(searchValue)
  const [open, setOpen] = useState(false)

  const handleSearchChange = (value: string) => {
    setLocalSearchValue(value)
    if (onSearchChange) {
      // Debounced search
      setTimeout(() => {
        onSearchChange(value)
      }, 300)
    }
  }

  const clearSearch = () => {
    setLocalSearchValue('')
    if (onSearchChange) {
      onSearchChange('')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search Bar and Filter Button */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        {showSearch && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={localSearchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex h-10 w-full rounded-md border-2 border-brand bg-background px-3 py-2 pl-10 pr-8 font-mono text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-brand transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            />
            {localSearchValue && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Filter Popover */}
        {filterContent && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-2 border-border bg-white font-mono text-xs shadow-sm transition-all hover:border-brand/30 hover:bg-white hover:shadow cursor-pointer"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand/10 px-1.5 text-[10px] font-medium text-brand">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0 shadow-lg" align="start">
              {filterContent}
            </PopoverContent>
          </Popover>
        )}

        {hasActiveFilters && (
          <span className="font-mono text-xs text-muted-foreground">
            Active filters applied
          </span>
        )}
      </div>

      {/* Active Filter Chips */}
      {filterChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filterChips.map((chip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group flex items-center gap-2 rounded-md border-2 border-brand bg-brand/5 px-3 py-1.5"
            >
              <span className="font-mono text-xs text-brand">{chip.label}</span>
              <button
                onClick={chip.onRemove}
                className="text-brand hover:text-brand-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
