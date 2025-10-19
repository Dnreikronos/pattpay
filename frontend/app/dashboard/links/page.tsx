'use client'

import { useState } from 'react'
import { StatCard } from '../_components/StatCard'
import { LinkTable } from './_components/LinkTable'
import { LinkFilters } from './_components/LinkFilters'
import { ColumnVisibilityToggle } from '../payments/_components/ColumnVisibilityToggle'
import { Pagination } from '../payments/_components/Pagination'
import { CreateLinkModal } from './_components/CreateLinkModal'
import { useLinks } from '@/lib/hooks/useLinks'
import type { LinkFilters as Filters } from '@/types/link'
import type { VisibilityState } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

const COLUMN_LABELS: Record<string, string> = {
  icon: 'Icon',
  name: 'Name',
  amount: 'Amount',
  status: 'Status',
  isRecurring: 'Type',
  redirectUrl: 'Redirect URL',
  totalPayments: 'Payments',
  createdAt: 'Created',
  actions: 'Actions',
}

export default function LinksPage() {
  const [filters, setFilters] = useState<Filters>({
    statuses: [],
    isRecurring: 'all',
  })
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const {
    links,
    stats,
    loading,
    totalPages,
    currentPage,
    setPage,
    perPage,
    setPerPage,
    totalItems,
  } = useLinks(filters)

  // Column visibility helpers (exclude icon and actions columns from toggle)
  const columnConfigs = Object.keys(COLUMN_LABELS)
    .filter((id) => id !== 'actions' && id !== 'icon')
    .map((id) => ({
      id,
      label: COLUMN_LABELS[id],
      visible: columnVisibility[id] !== false, // Default to true if not set
    }))

  const handleToggleColumn = (columnId: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: prev[columnId] === false ? true : false,
    }))
  }

  const handleResetColumns = () => {
    setColumnVisibility({})
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <h1
            className="text-foreground"
            style={{
              fontFamily: 'var(--font-press-start)',
              fontWeight: 400,
              fontSize: '2.5rem',
            }}
          >
            Payment Links
          </h1>
          <p className="font-mono text-muted text-sm">
            Create and manage checkout links for your products and services
          </p>
        </div>

        {/* Create Link Button */}
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 bg-brand hover:bg-brand-600 text-white font-mono px-6 h-11 shadow-sm cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          New Link
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Active Links"
          value={loading ? '...' : stats.totalActive.toString()}
          icon="/person1.png"
          accentColor="#4F46E5"
        />
        <StatCard
          title="Total Links"
          value={loading ? '...' : stats.totalCreated.toString()}
          icon="/person2.png"
          accentColor="#10b981"
        />
        <StatCard
          title="Total Payments"
          value={loading ? '...' : links.reduce((sum, link) => sum + link.totalPayments, 0).toString()}
          icon="/person3.png"
          accentColor="#818CF8"
        />
      </div>

      {/* Filters and Column Toggle */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <LinkFilters filters={filters} onFiltersChange={setFilters} />
        </div>
        <div className="lg:ml-4">
          <ColumnVisibilityToggle
            columns={columnConfigs}
            onToggle={handleToggleColumn}
            onReset={handleResetColumns}
          />
        </div>
      </div>

      {/* Links Table */}
      <LinkTable
        links={links}
        loading={loading}
        onRowClick={(id) => {
          console.log('Navigate to link details:', id)
          // TODO: Navigate to /dashboard/links/:id or open edit modal
        }}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
      />

      {/* Pagination */}
      {!loading && links.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          perPage={perPage}
          onPerPageChange={setPerPage}
          totalItems={totalItems}
        />
      )}

      {/* Create Link Modal */}
      <CreateLinkModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  )
}
