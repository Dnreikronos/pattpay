'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  perPage: number
  onPerPageChange: (perPage: number) => void
  totalItems?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  perPage,
  onPerPageChange,
  totalItems
}: PaginationProps) {
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1
    if (currentPage <= 3) return i + 1
    if (currentPage >= totalPages - 2) return totalPages - 4 + i
    return currentPage - 2 + i
  })

  const startItem = (currentPage - 1) * perPage + 1
  const endItem = Math.min(currentPage * perPage, totalItems || 0)

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
      {/* Items count */}
      <div className="font-mono text-sm text-muted">
        {totalItems ? (
          <>
            Showing <span className="text-foreground font-bold">{startItem}-{endItem}</span> of{' '}
            <span className="text-foreground font-bold">{totalItems}</span>
          </>
        ) : (
          'No items'
        )}
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-4">
        {/* Items per page */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-muted">Per page:</span>
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="px-3 py-1 font-mono text-sm border-2 border-border bg-surface text-foreground focus:border-brand focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Page numbers */}
        <div className="flex items-center gap-2">
          {/* Previous button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`
              p-2 border-2 transition-all font-mono
              ${currentPage === 1
                ? 'border-border bg-surface text-muted cursor-not-allowed'
                : 'border-brand bg-surface text-brand hover:bg-brand hover:text-surface'
              }
            `}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page numbers */}
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`
                px-3 py-2 border-2 transition-all font-mono text-sm min-w-[40px]
                ${currentPage === page
                  ? 'bg-brand text-surface border-brand shadow-[2px_2px_0_0_rgba(79,70,229,1)]'
                  : 'bg-surface text-foreground border-border hover:border-brand'
                }
              `}
            >
              {page}
            </button>
          ))}

          {/* Next button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`
              p-2 border-2 transition-all font-mono
              ${currentPage === totalPages
                ? 'border-border bg-surface text-muted cursor-not-allowed'
                : 'border-brand bg-surface text-brand hover:bg-brand hover:text-surface'
              }
            `}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
