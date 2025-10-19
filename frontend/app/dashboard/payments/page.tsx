'use client'

import { useState } from 'react'
import { StatCard } from '../_components/StatCard'
import { PaymentTableNew } from './_components/PaymentTableNew'
import { PaymentFilters } from './_components/PaymentFiltersNew'
import { ColumnVisibilityToggle } from './_components/ColumnVisibilityToggle'
import { Pagination } from './_components/Pagination'
import { usePayments } from '@/lib/hooks/usePayments'
import type { PaymentFilters as Filters } from '@/types/payment'
import { mockPayments } from '@/mocks/data'
import type { VisibilityState } from '@tanstack/react-table'

// Helper function to format currency values
const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return `$${value.toFixed(0)}`
}

const COLUMN_LABELS: Record<string, string> = {
  hash: 'Hash',
  createdAt: 'Date',
  amount: 'Amount',
  status: 'Status',
  from: 'From',
  linkName: 'Link',
  actions: 'Actions',
}

export default function PaymentsPage() {
  const [filters, setFilters] = useState<Filters>({
    statuses: [],
    datePreset: 'last-30-days'
  })
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const {
    payments,
    stats,
    loading,
    totalPages,
    currentPage,
    setPage,
    perPage,
    setPerPage
  } = usePayments(filters)

  // Column visibility helpers (exclude actions column from toggle)
  const columnConfigs = Object.keys(COLUMN_LABELS)
    .filter(id => id !== 'actions')
    .map(id => ({
      id,
      label: COLUMN_LABELS[id],
      visible: columnVisibility[id] !== false // Default to true if not set
    }))

  const handleToggleColumn = (columnId: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: prev[columnId] === false ? true : false
    }))
  }

  const handleResetColumns = () => {
    setColumnVisibility({})
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1
          className="text-foreground"
          style={{
            fontFamily: "var(--font-press-start)",
            fontWeight: 400,
            fontSize: "2.5rem"
          }}
        >
          Payments
        </h1>
        <p className="font-mono text-muted-foreground text-sm">
          Track and manage all your payment transactions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Payments Today"
          value={loading ? "..." : stats.totalToday.toString()}
          icon="/person1.png"
          accentColor="#4F46E5"
        />
        <StatCard
          title="Volume (24h)"
          value={loading ? "..." : formatCurrency(stats.volumeTodayUSD)}
          icon="/person2.png"
          accentColor="#10b981"
        />
        <StatCard
          title="Average Ticket"
          value={loading ? "..." : `$${stats.averageTicket.toFixed(2)}`}
          icon="/person3.png"
          accentColor="#818CF8"
        />
      </div>

      {/* Filters and Column Toggle */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <PaymentFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
        <div className="lg:ml-4">
          <ColumnVisibilityToggle
            columns={columnConfigs}
            onToggle={handleToggleColumn}
            onReset={handleResetColumns}
          />
        </div>
      </div>

      {/* Payment Table */}
      <PaymentTableNew
        payments={payments}
        loading={loading}
        onRowClick={(id) => {
          console.log('Navigate to payment details:', id)
          // TODO: Navigate to /dashboard/payments/:id
        }}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
      />

      {/* Pagination */}
      {!loading && payments.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          perPage={perPage}
          onPerPageChange={setPerPage}
          totalItems={mockPayments.length}
        />
      )}
    </div>
  )
}
