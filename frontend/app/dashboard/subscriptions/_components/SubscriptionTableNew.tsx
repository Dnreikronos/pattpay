'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, Copy, Check, MoreHorizontal, Eye, Ban } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import type { Subscription } from '@/types/subscription'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SubscriptionCard } from './SubscriptionCard'
import { SubscriptionAvatar } from './SubscriptionAvatar'

interface SubscriptionTableProps {
  subscriptions: Subscription[]
  loading?: boolean
  onRowClick?: (id: string) => void
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: (visibility: VisibilityState) => void
}

const getStatusColor = (status: Subscription['status']) => {
  switch (status) {
    case 'active':
      return 'bg-success/10 text-success border border-success/20'
    case 'cancelled':
      return 'bg-warning/10 text-warning border border-warning/20'
    case 'expired':
      return 'bg-error/10 text-error border border-error/20'
  }
}

const getStatusLabel = (status: Subscription['status']) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 text-muted hover:text-brand transition-all duration-200"
      title="Copy"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </button>
  )
}

function SubscriptionActions({ subscription }: { subscription: Subscription }) {
  const [open, setOpen] = React.useState(false)

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('View details:', subscription.id)
    setOpen(false)
    // TODO: Navigate to subscription details page
  }

  const handleCancelSubscription = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('Cancel subscription:', subscription.id)
    setOpen(false)
    // TODO: Show confirmation modal and cancel subscription
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-muted/20 hover:text-foreground cursor-pointer"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[200px] rounded-xl border border-border bg-white p-1 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-0.5">
          <button
            onClick={handleViewDetails}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-mono transition-colors hover:bg-muted/20 cursor-pointer"
          >
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span>View Details</span>
          </button>

          {subscription.status === 'active' && (
            <>
              <div className="my-1 h-px bg-border" />

              <button
                onClick={handleCancelSubscription}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-mono transition-colors hover:bg-error/10 hover:text-error cursor-pointer"
              >
                <Ban className="h-4 w-4" />
                <span>Cancel Subscription</span>
              </button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function SubscriptionTableNew({
  subscriptions,
  loading,
  onRowClick,
  columnVisibility = {},
  onColumnVisibilityChange
}: SubscriptionTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const columns: ColumnDef<Subscription>[] = [
    {
      id: 'avatar',
      header: '',
      cell: ({ row }) => (
        <SubscriptionAvatar address={row.original.payerWallet} size={40} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'payerName',
      header: ({ column }) => {
        return (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-brand transition-colors"
          >
            Payer
            <ArrowUpDown className="h-3 w-3" />
          </button>
        )
      },
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-foreground font-mono font-medium">
            {row.getValue('payerName')}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-muted font-mono text-xs">
              {row.original.payerWallet}
            </span>
            <CopyButton text={row.original.payerWallet} />
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'planName',
      header: ({ column }) => {
        return (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-brand transition-colors"
          >
            Plan
            <ArrowUpDown className="h-3 w-3" />
          </button>
        )
      },
      cell: ({ row }) => (
        <span className="text-brand font-mono font-medium">
          {row.getValue('planName')}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => {
        return (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-brand transition-colors"
          >
            Amount
            <ArrowUpDown className="h-3 w-3" />
          </button>
        )
      },
      cell: ({ row }) => {
        const subscription = row.original
        return (
          <div className="flex flex-col">
            <span className="text-foreground font-mono font-bold">
              ${subscription.amountUSD.toFixed(2)}
            </span>
            <span className="text-muted font-mono text-xs">
              {subscription.amount.toFixed(2)} {subscription.tokenMint}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={`${getStatusColor(row.getValue('status'))} font-mono text-xs font-medium px-3 py-1 rounded-full`}>
          {getStatusLabel(row.getValue('status'))}
        </Badge>
      ),
    },
    {
      accessorKey: 'nextDueAt',
      header: ({ column }) => {
        return (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-brand transition-colors"
          >
            Next Payment
            <ArrowUpDown className="h-3 w-3" />
          </button>
        )
      },
      cell: ({ row }) => {
        const subscription = row.original
        const nextDueDate = new Date(subscription.nextDueAt)
        const isOverdue = subscription.status === 'active' && nextDueDate < new Date()

        return (
          <span
            className={`font-mono ${isOverdue ? 'text-error font-medium' : 'text-foreground'}`}
            title={nextDueDate.toLocaleString()}
          >
            {subscription.status === 'active'
              ? formatDistanceToNow(nextDueDate, { addSuffix: true })
              : 'N/A'
            }
          </span>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        return (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-brand transition-colors"
          >
            Created
            <ArrowUpDown className="h-3 w-3" />
          </button>
        )
      },
      cell: ({ row }) => (
        <span className="font-mono text-foreground" title={new Date(row.getValue('createdAt')).toLocaleString()}>
          {formatDistanceToNow(new Date(row.getValue('createdAt')), { addSuffix: true })}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => <SubscriptionActions subscription={row.original} />,
      enableHiding: false,
      enableSorting: false,
    },
  ]

  const table = useReactTable({
    data: subscriptions,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: onColumnVisibilityChange,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  if (loading) {
    return (
      <>
        {/* Mobile Skeleton */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border border-border bg-white rounded-xl p-4 shadow-sm animate-pulse">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted/20" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted/20 rounded" />
                    <div className="h-5 w-16 bg-muted/20 rounded-full" />
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="h-5 w-20 bg-muted/20 rounded ml-auto" />
                  <div className="h-4 w-24 bg-muted/20 rounded ml-auto" />
                </div>
              </div>
              <div className="h-4 w-32 bg-muted/20 rounded mb-3" />
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
                <div className="h-3 w-28 bg-muted/20 rounded" />
                <div className="h-3 w-20 bg-muted/20 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Skeleton */}
        <div className="hidden md:block w-full border border-border rounded-xl bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30 border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-6 py-3" />
                <TableHead className="px-6 py-3"><div className="h-3 w-12 bg-muted/30 rounded" /></TableHead>
                <TableHead className="px-6 py-3"><div className="h-3 w-10 bg-muted/30 rounded" /></TableHead>
                <TableHead className="px-6 py-3"><div className="h-3 w-16 bg-muted/30 rounded" /></TableHead>
                <TableHead className="px-6 py-3"><div className="h-3 w-14 bg-muted/30 rounded" /></TableHead>
                <TableHead className="px-6 py-3"><div className="h-3 w-24 bg-muted/30 rounded" /></TableHead>
                <TableHead className="px-6 py-3"><div className="h-3 w-16 bg-muted/30 rounded" /></TableHead>
                <TableHead className="px-6 py-3" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i} className="border-b border-border/50 animate-pulse">
                  <TableCell className="px-6 py-3.5">
                    <div className="h-10 w-10 rounded-full bg-muted/20" />
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <div className="space-y-1">
                      <div className="h-4 w-24 bg-muted/20 rounded" />
                      <div className="h-3 w-32 bg-muted/20 rounded" />
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <div className="h-4 w-20 bg-muted/20 rounded" />
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <div className="space-y-1">
                      <div className="h-4 w-16 bg-muted/20 rounded" />
                      <div className="h-3 w-20 bg-muted/20 rounded" />
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <div className="h-6 w-16 bg-muted/20 rounded-full" />
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <div className="h-4 w-24 bg-muted/20 rounded" />
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <div className="h-4 w-24 bg-muted/20 rounded" />
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <div className="h-8 w-8 bg-muted/20 rounded-lg" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </>
    )
  }

  if (subscriptions.length === 0) {
    return (
      <div className="w-full border border-border rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="p-12 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted/20 mb-4">
            <svg className="h-8 w-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="font-mono text-base font-medium text-foreground mb-2">No subscriptions found</p>
          <p className="font-mono text-sm text-muted-foreground">
            Active subscriptions will appear here once users subscribe to your plans
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile View - Cards */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {subscriptions.map((subscription, index) => (
          <motion.div
            key={subscription.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
              ease: "easeOut"
            }}
          >
            <SubscriptionCard
              subscription={subscription}
              onClick={() => onRowClick?.(subscription.id)}
            />
          </motion.div>
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block w-full border border-border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30 border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <motion.tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original.id)}
                  className="group relative bg-white border-b border-border/50 cursor-pointer align-middle transition-all duration-200 ease-out hover:bg-brand/5 hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5 hover:z-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: "easeOut"
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6 py-3.5 font-mono text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <p className="font-mono text-muted-foreground">No results.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
