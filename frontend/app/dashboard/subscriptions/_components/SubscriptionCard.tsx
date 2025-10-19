'use client'

import { Copy, Check, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import type { Subscription } from '@/types/subscription'
import { SubscriptionAvatar } from './SubscriptionAvatar'

interface SubscriptionCardProps {
  subscription: Subscription
  onClick?: () => void
}

export function SubscriptionCard({ subscription, onClick }: SubscriptionCardProps) {
  const [copiedWallet, setCopiedWallet] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(subscription.payerWallet)
    setCopiedWallet(true)
    setTimeout(() => setCopiedWallet(false), 2000)
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

  const nextDueDate = new Date(subscription.nextDueAt)
  const isOverdue = subscription.status === 'active' && nextDueDate < new Date()

  return (
    <div
      onClick={onClick}
      className="border border-border bg-white rounded-xl p-4 hover:bg-brand/5 hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer shadow-sm"
    >
      {/* Top Row - Avatar, Status and Amount */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <SubscriptionAvatar address={subscription.payerWallet} size={40} />
          <div>
            <p className="font-mono font-medium text-foreground text-sm">{subscription.payerName}</p>
            <Badge className={`${getStatusColor(subscription.status)} font-mono text-xs font-medium px-2 py-0.5 rounded-full mt-1`}>
              {getStatusLabel(subscription.status)}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono font-bold text-foreground text-lg">
            ${subscription.amountUSD.toFixed(2)}
          </div>
          <div className="font-mono text-muted text-xs">
            {subscription.amount.toFixed(2)} {subscription.tokenMint}
          </div>
        </div>
      </div>

      {/* Plan Name */}
      <div className="font-mono text-sm text-brand font-medium mb-2">
        {subscription.planName}
      </div>

      {/* Next Due Date */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
        <span className="font-mono text-xs text-muted-foreground">Next payment:</span>
        <span className={`font-mono text-xs ${isOverdue ? 'text-error font-medium' : 'text-foreground'}`}>
          {subscription.status === 'active'
            ? formatDistanceToNow(nextDueDate, { addSuffix: true })
            : 'N/A'
          }
        </span>
      </div>

      {/* Payer Wallet */}
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-xs text-muted-foreground">Payer:</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-foreground">{subscription.payerWallet}</span>
          <button
            onClick={handleCopy}
            className="text-muted hover:text-brand transition-colors duration-200"
            title="Copy wallet address"
          >
            {copiedWallet ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>

      {/* Last Payment */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs text-muted-foreground">Last paid:</span>
        <span className="font-mono text-xs text-foreground">
          {formatDistanceToNow(new Date(subscription.lastPaidAt), { addSuffix: true })}
        </span>
      </div>

      {/* View Details */}
      <div className="flex items-center justify-end mt-3 pt-2 border-t border-border/50">
        <span className="font-mono text-xs text-brand flex items-center gap-1 font-medium">
          View Details
          <ChevronRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  )
}
