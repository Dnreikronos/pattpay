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
import { ArrowUpDown, Copy, Check, MoreHorizontal, Eye, ExternalLink, Link as LinkIcon, Repeat } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import type { CheckoutLink } from '@/types/link'
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
import { LinkCard } from './LinkCard'

interface LinkTableProps {
  links: CheckoutLink[]
  loading?: boolean
  onRowClick?: (id: string) => void
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: (visibility: VisibilityState) => void
}

const getStatusColor = (status: CheckoutLink['status']) => {
  switch (status) {
    case 'active':
      return 'bg-success/10 text-success border border-success/20'
    case 'inactive':
      return 'bg-muted/20 text-muted-foreground border border-border'
  }
}

const getStatusLabel = (status: CheckoutLink['status']) => {
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
      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-brand transition-all duration-200"
      title="Copy"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </button>
  )
}

function LinkActions({ link }: { link: CheckoutLink }) {
  const [open, setOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const handleCopyUrl = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(link.url)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
      setOpen(false)
    }, 1500)
  }

  const handleViewLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(link.url, '_blank')
    setOpen(false)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('Edit link:', link.id)
    setOpen(false)
    // TODO: Open edit modal
  }

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('Toggle status:', link.id)
    setOpen(false)
    // TODO: Toggle active/inactive
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
        className="w-[200px] rounded-xl border border-border bg-card p-1 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-0.5">
          <button
            onClick={handleEdit}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-mono transition-colors hover:bg-muted/20 cursor-pointer"
          >
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span>Edit Link</span>
          </button>

          <button
            onClick={handleCopyUrl}
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
                <span>Copy URL</span>
              </>
            )}
          </button>

          <button
            onClick={handleToggleStatus}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-mono transition-colors hover:bg-muted/20 cursor-pointer"
          >
            <Repeat className="h-4 w-4 text-muted-foreground" />
            <span>{link.status === 'active' ? 'Deactivate' : 'Activate'}</span>
          </button>

          <div className="my-1 h-px bg-border" />

          <button
            onClick={handleViewLink}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-mono transition-colors hover:bg-muted/20 cursor-pointer"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <span>Open Link</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function LinkTable({
  links,
  loading,
  onRowClick,
  columnVisibility = {},
  onColumnVisibilityChange
}: LinkTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const columns: ColumnDef<CheckoutLink>[] = [
    {
      id: 'icon',
      header: '',
      cell: () => (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <LinkIcon className="h-5 w-5" />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-brand transition-colors"
          >
            Name
            <ArrowUpDown className="h-3 w-3" />
          </button>
        )
      },
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-foreground font-mono font-medium">
            {row.getValue('name')}
          </span>
          {row.original.description && (
            <span className="text-muted-foreground text-xs font-mono mt-0.5 line-clamp-1">
              {row.original.description}
            </span>
          )}
        </div>
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
        const link = row.original
        return (
          <div className="flex flex-col">
            <span className="text-foreground font-mono font-bold">
              ${link.amountUSD.toFixed(2)}
            </span>
            <span className="text-muted-foreground font-mono text-xs">
              ~{link.amount.toFixed(2)} SOL
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
      accessorKey: 'isRecurring',
      header: 'Type',
      cell: ({ row }) => {
        const isRecurring = row.getValue('isRecurring') as boolean
        return (
          <Badge className={`${isRecurring ? 'bg-brand/10 text-brand border border-brand/20' : 'bg-accent/10 text-accent border border-accent/20'} font-mono text-xs font-medium px-3 py-1 rounded-full`}>
            {isRecurring ? 'Recurring' : 'One-time'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'redirectUrl',
      header: 'Redirect URL',
      cell: ({ row }) => {
        const redirectUrl = row.getValue('redirectUrl') as string | undefined
        return redirectUrl ? (
          <div className="flex items-center gap-2 max-w-[200px]">
            <span className="text-foreground font-mono text-sm truncate">
              {redirectUrl.replace(/^https?:\/\//, '')}
            </span>
            <CopyButton text={redirectUrl} />
          </div>
        ) : (
          <span className="text-muted-foreground italic font-mono text-sm">None</span>
        )
      },
    },
    {
      accessorKey: 'totalPayments',
      header: ({ column }) => {
        return (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-brand transition-colors"
          >
            Payments
            <ArrowUpDown className="h-3 w-3" />
          </button>
        )
      },
      cell: ({ row }) => (
        <span className="font-mono text-foreground font-medium">
          {row.getValue('totalPayments')}
        </span>
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
      cell: ({ row }) => <LinkActions link={row.original} />,
      enableHiding: false,
      enableSorting: false,
    },
  ]

  const table = useReactTable({
    data: links,
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
            <div key={i} className="border border-border bg-card rounded-xl p-4 shadow-sm animate-pulse">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted/20" />
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-muted/20 rounded" />
                    <div className="h-4 w-24 bg-muted/20 rounded" />
                  </div>
                </div>
                <div className="h-6 w-20 bg-muted/20 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted/20 rounded" />
                <div className="h-4 w-3/4 bg-muted/20 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Skeleton */}
        <div className="hidden md:block w-full border border-border rounded-xl bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30 border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-6 py-3" />
                {Array.from({ length: 7 }).map((_, i) => (
                  <TableHead key={i} className="px-6 py-3">
                    <div className="h-3 w-16 bg-muted/30 rounded" />
                  </TableHead>
                ))}
                <TableHead className="px-6 py-3" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i} className="border-b border-border/50 animate-pulse">
                  <TableCell className="px-6 py-3.5">
                    <div className="h-10 w-10 rounded-lg bg-muted/20" />
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <div className="space-y-1">
                      <div className="h-4 w-32 bg-muted/20 rounded" />
                      <div className="h-3 w-24 bg-muted/20 rounded" />
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <div className="space-y-1">
                      <div className="h-4 w-20 bg-muted/20 rounded" />
                      <div className="h-3 w-16 bg-muted/20 rounded" />
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <div className="h-6 w-16 bg-muted/20 rounded-full" />
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <div className="h-6 w-20 bg-muted/20 rounded-full" />
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <div className="h-4 w-32 bg-muted/20 rounded" />
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <div className="h-4 w-12 bg-muted/20 rounded" />
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

  if (links.length === 0) {
    return (
      <div className="w-full border border-border rounded-xl bg-card shadow-sm overflow-hidden">
        <div className="p-12 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted/20 mb-4">
            <LinkIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-mono text-base font-medium text-foreground mb-2">No payment links found</p>
          <p className="font-mono text-sm text-muted-foreground">
            Create your first payment link to start accepting payments
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile View - Cards */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {links.map((link, index) => (
          <motion.div
            key={link.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
              ease: "easeOut"
            }}
          >
            <LinkCard
              link={link}
              onClick={() => onRowClick?.(link.id)}
            />
          </motion.div>
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block w-full border border-border rounded-xl bg-card shadow-sm overflow-hidden">
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
                  className="group relative bg-card border-b border-border/50 cursor-pointer align-middle transition-all duration-200 ease-out hover:bg-brand/5 hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5 hover:z-10"
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
