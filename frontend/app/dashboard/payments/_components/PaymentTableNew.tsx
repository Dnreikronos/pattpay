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
import { ArrowUpDown, Copy, Check, MoreHorizontal, Eye, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import type { Payment } from '@/types/payment'
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
import { Button } from '@/components/ui/button'
import { PaymentCard } from './PaymentCard'
import { PaymentAvatar } from './PaymentAvatar'

interface PaymentTableProps {
  payments: Payment[]
  loading?: boolean
  onRowClick?: (id: string) => void
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: (visibility: VisibilityState) => void
}

const getStatusColor = (status: Payment['status']) => {
  switch (status) {
    case 'success':
      return 'bg-success/10 text-success border border-success/20'
    case 'pending':
      return 'bg-warning/10 text-warning border border-warning/20'
    case 'failed':
      return 'bg-error/10 text-error border border-error/20'
  }
}

const getStatusLabel = (status: Payment['status']) => {
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

function PaymentActions({ payment }: { payment: Payment }) {
  const [open, setOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const handleCopyHash = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(payment.hash)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
      setOpen(false)
    }, 1500)
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('View details:', payment.id)
    setOpen(false)
    // TODO: Navigate to payment details page
  }

  const handleViewOnExplorer = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(`https://solscan.io/tx/${payment.hash}`, '_blank')
    setOpen(false)
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

          <button
            onClick={handleCopyHash}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-mono transition-colors hover:bg-muted/20 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-success" />
                <span className="text-success">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-muted-foreground" />
                <span>Copy Hash</span>
              </>
            )}
          </button>

          <div className="my-1 h-px bg-border" />

          <button
            onClick={handleViewOnExplorer}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-mono transition-colors hover:bg-muted/20 cursor-pointer"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <span>View on Solscan</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function PaymentTableNew({
  payments,
  loading,
  onRowClick,
  columnVisibility = {},
  onColumnVisibilityChange
}: PaymentTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const columns: ColumnDef<Payment>[] = [
    {
      id: 'avatar',
      header: '',
      cell: ({ row }) => (
        <PaymentAvatar address={row.original.from} size={40} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'hash',
      header: ({ column }) => {
        return (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-brand transition-colors"
          >
            Hash
            <ArrowUpDown className="h-3 w-3" />
          </button>
        )
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-foreground font-mono">
            {row.getValue<string>('hash').slice(0, 8)}...
          </span>
          <CopyButton text={row.getValue('hash')} />
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        return (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-brand transition-colors"
          >
            Date
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
        const payment = row.original
        return (
          <div className="flex flex-col">
            <span className="text-foreground font-mono font-bold">
              ${payment.amountUSD.toFixed(2)}
            </span>
            <span className="text-muted font-mono text-xs">
              ~{payment.amount.toFixed(2)} SOL
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
      accessorKey: 'from',
      header: 'From',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-foreground font-mono">{row.getValue('from')}</span>
          <CopyButton text={row.getValue('from')} />
        </div>
      ),
    },
    {
      accessorKey: 'linkName',
      header: 'Link',
      cell: ({ row }) => {
        const linkName = row.getValue('linkName') as string | undefined
        return (
          <span className="font-mono text-foreground">
            {linkName || <span className="text-muted italic">Direct</span>}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => <PaymentActions payment={row.original} />,
      enableHiding: false,
      enableSorting: false,
    },
  ]

  const table = useReactTable({
    data: payments,
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
                  <div className="h-6 w-20 bg-muted/20 rounded-full" />
                </div>
                <div className="space-y-1 text-right">
                  <div className="h-5 w-20 bg-muted/20 rounded ml-auto" />
                  <div className="h-4 w-24 bg-muted/20 rounded ml-auto" />
                </div>
              </div>
              <div className="h-4 w-32 bg-muted/20 rounded mb-3" />
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
                <div className="h-3 w-40 bg-muted/20 rounded" />
                <div className="h-3 w-3 bg-muted/20 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-3 w-12 bg-muted/20 rounded" />
                <div className="h-3 w-32 bg-muted/20 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Skeleton */}
        <div className="hidden md:block w-full border border-border rounded-xl bg-white shadow-sm overflow-hidden">
          <Table>
            {/* Skeleton Header */}
            <TableHeader className="bg-muted/30 border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-6 py-3">
                  {/* Avatar column - empty header */}
                </TableHead>
                <TableHead className="px-6 py-3">
                  <div className="h-3 w-12 bg-muted/30 rounded" />
                </TableHead>
                <TableHead className="px-6 py-3">
                  <div className="h-3 w-10 bg-muted/30 rounded" />
                </TableHead>
                <TableHead className="px-6 py-3">
                  <div className="h-3 w-16 bg-muted/30 rounded" />
                </TableHead>
                <TableHead className="px-6 py-3">
                  <div className="h-3 w-14 bg-muted/30 rounded" />
                </TableHead>
                <TableHead className="px-6 py-3">
                  <div className="h-3 w-12 bg-muted/30 rounded" />
                </TableHead>
                <TableHead className="px-6 py-3">
                  <div className="h-3 w-10 bg-muted/30 rounded" />
                </TableHead>
                <TableHead className="px-6 py-3">
                  {/* Actions column - empty header */}
                </TableHead>
              </TableRow>
            </TableHeader>

            {/* Skeleton Rows */}
            <TableBody>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i} className="border-b border-border/50 animate-pulse">
                  <TableCell className="px-6 py-3.5">
                    <div className="h-10 w-10 rounded-full bg-muted/20" />
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-20 bg-muted/20 rounded" />
                      <div className="h-3 w-3 bg-muted/20 rounded" />
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <div className="h-4 w-24 bg-muted/20 rounded" />
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
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-24 bg-muted/20 rounded" />
                      <div className="h-3 w-3 bg-muted/20 rounded" />
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <div className="h-4 w-16 bg-muted/20 rounded" />
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

  if (payments.length === 0) {
    return (
      <div className="w-full border border-border rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="p-12 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted/20 mb-4">
            <svg className="h-8 w-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="font-mono text-base font-medium text-foreground mb-2">No payments found</p>
          <p className="font-mono text-sm text-muted-foreground">
            Payments will appear here once you receive transactions
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile View - Cards */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {payments.map((payment, index) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
              ease: "easeOut"
            }}
          >
            <PaymentCard
              payment={payment}
              onClick={() => onRowClick?.(payment.id)}
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
