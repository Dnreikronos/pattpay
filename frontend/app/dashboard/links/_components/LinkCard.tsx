'use client'

import { formatDistanceToNow } from 'date-fns'
import { Link as LinkIcon, Copy, Check, ExternalLink, Repeat } from 'lucide-react'
import { useState } from 'react'
import type { CheckoutLink } from '@/types/link'
import { Badge } from '@/components/ui/badge'

interface LinkCardProps {
  link: CheckoutLink
  onClick: () => void
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

export function LinkCard({ link, onClick }: LinkCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyUrl = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(link.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(link.url, '_blank')
  }

  return (
    <div
      onClick={onClick}
      className="group border border-border bg-card rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-brand/30 hover:-translate-y-0.5 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <LinkIcon className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <h3 className="font-mono font-medium text-foreground text-sm truncate">
              {link.name}
            </h3>
            {link.description && (
              <p className="text-xs text-muted-foreground font-mono mt-0.5 line-clamp-1">
                {link.description}
              </p>
            )}
          </div>
        </div>
        <Badge className={`${getStatusColor(link.status)} font-mono text-xs font-medium px-2 py-0.5 rounded-full shrink-0`}>
          {getStatusLabel(link.status)}
        </Badge>
      </div>

      {/* Amount */}
      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-foreground font-mono font-bold text-lg">
          ${link.amountUSD.toFixed(2)}
        </span>
        <span className="text-muted-foreground font-mono text-xs">
          (~{link.amount.toFixed(2)} SOL)
        </span>
        <Badge className={`${link.isRecurring ? 'bg-brand/10 text-brand border border-brand/20' : 'bg-accent/10 text-accent border border-accent/20'} font-mono text-xs font-medium px-2 py-0.5 rounded-full ml-auto`}>
          {link.isRecurring ? (
            <div className="flex items-center gap-1">
              <Repeat className="h-3 w-3" />
              <span>Recurring</span>
            </div>
          ) : (
            'One-time'
          )}
        </Badge>
      </div>

      {/* URL */}
      <div className="mb-3 pb-3 border-b border-border/50">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground font-mono text-xs truncate flex-1">
            {link.url.replace(/^https?:\/\//, '')}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleCopyUrl}
              className="text-muted-foreground hover:text-brand transition-colors p-1"
              title="Copy URL"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={handleOpenLink}
              className="text-muted-foreground hover:text-brand transition-colors p-1"
              title="Open Link"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-muted-foreground text-xs font-mono mb-1">Payments</p>
          <p className="text-foreground font-mono font-bold text-sm">
            {link.totalPayments}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs font-mono mb-1">Views</p>
          <p className="text-foreground font-mono font-bold text-sm">
            {link.views}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs font-mono mb-1">Conv. Rate</p>
          <p className="text-foreground font-mono font-bold text-sm">
            {link.views > 0 ? ((link.conversions / link.views) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-mono">Created</span>
          <span className="text-foreground text-xs font-mono" title={new Date(link.createdAt).toLocaleString()}>
            {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
          </span>
        </div>
        {link.redirectUrl && (
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-muted-foreground text-xs font-mono">Redirect</span>
            <span className="text-foreground text-xs font-mono truncate max-w-[60%]">
              {link.redirectUrl.replace(/^https?:\/\//, '')}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
