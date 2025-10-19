'use client'

import { useState } from 'react'
import { Check, Search as SearchIcon, CheckCircle2, Repeat, ArrowLeft, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { LinkFilters as Filters, LinkStatus } from '@/types/link'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { SlidersHorizontal } from 'lucide-react'

interface LinkFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

type FilterCategory = 'main' | 'status' | 'type'

export function LinkFilters({ filters, onFiltersChange }: LinkFiltersProps) {
  const [open, setOpen] = useState(false)
  const [currentView, setCurrentView] = useState<FilterCategory>('main')

  // Reset to main view when popover closes
  useState(() => {
    if (!open) {
      setCurrentView('main')
    }
  })

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const toggleStatus = (status: LinkStatus) => {
    const currentStatuses = filters.statuses || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status]

    onFiltersChange({ ...filters, statuses: newStatuses })
  }

  const setRecurringType = (type: boolean | 'all') => {
    onFiltersChange({ ...filters, isRecurring: type })
    setTimeout(() => setCurrentView('main'), 200)
  }

  const clearSearch = () => {
    onFiltersChange({ ...filters, search: '' })
  }

  const clearStatusFilter = () => {
    onFiltersChange({ ...filters, statuses: [] })
  }

  const clearTypeFilter = () => {
    onFiltersChange({ ...filters, isRecurring: 'all' })
  }

  const hasActiveFilters =
    (filters.statuses && filters.statuses.length > 0) ||
    !!filters.search ||
    (filters.isRecurring !== undefined && filters.isRecurring !== 'all')

  const getActiveCount = () => {
    let count = 0
    if (filters.statuses && filters.statuses.length > 0) count++
    if (filters.isRecurring !== undefined && filters.isRecurring !== 'all') count++
    return count
  }

  // Status icons mapping
  const statusIcons: Record<LinkStatus, React.ReactNode> = {
    active: <CheckCircle2 className="h-3 w-3" />,
    inactive: <CheckCircle2 className="h-3 w-3" />,
  }

  const typeLabels = {
    recurring: 'Recurring',
    'one-time': 'One-time',
    all: 'All Types',
  }

  // Build custom filter chips
  const renderFilterChips = () => {
    const hasChips =
      filters.search ||
      (filters.statuses && filters.statuses.length > 0) ||
      (filters.isRecurring !== undefined && filters.isRecurring !== 'all')

    if (!hasChips) {
      return null
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-2"
      >
        <AnimatePresence mode="popLayout">
          {/* Search Chip */}
          {filters.search && (
            <motion.div
              key="search-chip"
              layout
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Badge
                variant="secondary"
                className="group flex items-center gap-1.5 rounded-2xl border-2 border-border bg-card px-3 py-1.5 text-xs font-medium shadow-sm transition-all hover:border-brand/30"
              >
                <SearchIcon className="h-3 w-3" />
                <span>{filters.search}</span>
                <button
                  onClick={clearSearch}
                  className="ml-1 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full transition-all hover:bg-muted/50 focus:outline-none"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </motion.div>
          )}

          {/* Type Chip */}
          {filters.isRecurring !== undefined && filters.isRecurring !== 'all' && (
            <motion.div
              key="type-chip"
              layout
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Badge
                variant="secondary"
                className="group flex items-center gap-1.5 rounded-2xl border-2 border-border bg-card px-3 py-1.5 text-xs font-medium shadow-sm transition-all hover:border-brand/30"
              >
                <Repeat className="h-3 w-3" />
                <span>{filters.isRecurring ? 'Recurring' : 'One-time'}</span>
                <button
                  onClick={clearTypeFilter}
                  className="ml-1 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full transition-all hover:bg-muted/50 focus:outline-none"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </motion.div>
          )}

          {/* Status Chips */}
          {filters.statuses?.map((status) => (
            <motion.div
              key={`status-${status}`}
              layout
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Badge
                variant="secondary"
                className="group flex items-center gap-1.5 rounded-2xl border-2 border-border bg-card px-3 py-1.5 text-xs font-medium shadow-sm transition-all hover:border-brand/30"
              >
                {statusIcons[status]}
                <span className="capitalize">{status}</span>
                <button
                  onClick={() => toggleStatus(status)}
                  className="ml-1 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full transition-all hover:bg-muted/50 focus:outline-none"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </motion.div>
          ))}

          {/* Clear All Button */}
          {hasActiveFilters && (
            <motion.button
              layout
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => onFiltersChange({ statuses: [], search: '', isRecurring: 'all' })}
              className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear all
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // Category items
  const CategoryItem = ({ label, description, icon, activeCount, onClick }: any) => (
    <button
      onClick={onClick}
      className="group flex w-full cursor-pointer items-center gap-3 rounded-lg border-2 border-border px-4 py-3 text-left transition-all hover:border-brand/30 hover:bg-muted/20"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-muted-foreground/30 text-muted-foreground transition-all group-hover:border-brand group-hover:bg-brand/5 group-hover:text-brand">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">{label}</span>
          {activeCount !== undefined && activeCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand/10 px-1.5 text-[10px] font-medium text-brand">
              {activeCount}
            </span>
          )}
        </div>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">{description}</p>
      </div>
      <svg className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )

  // Filter popover content
  const filterContent = (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          {currentView !== 'main' && (
            <button
              onClick={() => setCurrentView('main')}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border-2 border-border transition-all hover:border-brand hover:bg-brand/5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
          )}
          <h3 className="font-mono text-sm font-medium">
            {currentView === 'main' && 'Filters'}
            {currentView === 'status' && 'Status'}
            {currentView === 'type' && 'Payment Type'}
          </h3>
        </div>

        {/* Clear buttons */}
        {currentView === 'status' && filters.statuses && filters.statuses.length > 0 && (
          <button
            onClick={clearStatusFilter}
            className="cursor-pointer font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear
          </button>
        )}
        {currentView === 'type' && filters.isRecurring !== undefined && filters.isRecurring !== 'all' && (
          <button
            onClick={clearTypeFilter}
            className="cursor-pointer font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      {/* Content */}
      <div className="min-h-[200px]">
        <AnimatePresence mode="wait">
          {/* Main Categories View */}
          {currentView === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
              className="space-y-2 p-3"
            >
              <CategoryItem
                label="Payment Type"
                description="Recurring or one-time"
                icon={<Repeat className="h-4 w-4" />}
                activeCount={filters.isRecurring !== undefined && filters.isRecurring !== 'all' ? 1 : 0}
                onClick={() => setCurrentView('type')}
              />
              <CategoryItem
                label="Status"
                description="Filter by link status"
                icon={<CheckCircle2 className="h-4 w-4" />}
                activeCount={filters.statuses?.length || 0}
                onClick={() => setCurrentView('status')}
              />
            </motion.div>
          )}

          {/* Type Options */}
          {currentView === 'type' && (
            <motion.div
              key="type"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.15 }}
              className="space-y-1 p-3"
            >
              {[
                { value: 'all' as const, label: 'All Types' },
                { value: true, label: 'Recurring' },
                { value: false, label: 'One-time' }
              ].map((option) => {
                const isSelected = filters.isRecurring === option.value
                return (
                  <button
                    key={String(option.value)}
                    onClick={() => setRecurringType(option.value)}
                    className={`
                      group flex w-full cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-2.5 text-left transition-all
                      ${
                        isSelected
                          ? 'border-brand bg-brand/10 text-brand shadow-sm'
                          : 'border-border bg-transparent hover:border-brand/30 hover:bg-muted/20'
                      }
                    `}
                  >
                    <Repeat className="h-4 w-4" />
                    <span className="flex-1 font-mono text-sm font-medium">{option.label}</span>
                    <div
                      className={`
                        flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all
                        ${
                          isSelected
                            ? 'border-brand bg-brand'
                            : 'border-muted-foreground/30 bg-transparent group-hover:border-brand/50'
                        }
                      `}
                    >
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          >
                            <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </button>
                )
              })}
            </motion.div>
          )}

          {/* Status Options (múltipla seleção) */}
          {currentView === 'status' && (
            <motion.div
              key="status"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.15 }}
              className="space-y-1 p-3"
            >
              {(['active', 'inactive'] as LinkStatus[]).map((status) => {
                const isSelected = filters.statuses?.includes(status) || false
                return (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={`
                      group flex w-full cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-2.5 text-left transition-all
                      ${
                        isSelected
                          ? 'border-brand bg-brand/10 text-brand shadow-sm'
                          : 'border-border bg-transparent hover:border-brand/30 hover:bg-muted/20'
                      }
                    `}
                  >
                    {statusIcons[status]}
                    <span className="flex-1 font-mono text-sm font-medium capitalize">{status}</span>
                    <div
                      className={`
                        flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all
                        ${
                          isSelected
                            ? 'border-brand bg-brand'
                            : 'border-muted-foreground/30 bg-transparent group-hover:border-brand/50'
                        }
                      `}
                    >
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          >
                            <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Search Bar and Filter Button */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md group">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-hover:text-brand" />
          <input
            type="text"
            placeholder="Search by name or URL..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex h-10 w-full rounded-md border-2 border-brand bg-background px-3 py-2 pl-10 pr-8 font-mono text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-brand focus-visible:shadow-[0_0_0_3px_rgba(79,70,229,0.1)] hover:shadow-sm hover:bg-card transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {filters.search && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Popover */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-10 gap-2 border-2 border-border bg-card font-mono text-sm shadow-sm transition-all hover:border-brand/30 hover:bg-card hover:shadow cursor-pointer px-4"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {getActiveCount() > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand/10 px-1.5 text-[10px] font-medium text-brand">
                  {getActiveCount()}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[360px] p-0 shadow-lg" align="start">
            {filterContent}
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <span className="font-mono text-xs text-muted-foreground">
            Active filters applied
          </span>
        )}
      </div>

      {/* Custom Filter Chips */}
      {renderFilterChips()}
    </div>
  )
}
