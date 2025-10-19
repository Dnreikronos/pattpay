'use client'

import { Copy, Check, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import type { Payment } from '@/types/payment'
import { PaymentAvatar } from './PaymentAvatar'

interface PaymentCardProps {
  payment: Payment
  onClick?: () => void
}

export function PaymentCard({ payment, onClick }: PaymentCardProps) {
  const [copiedHash, setCopiedHash] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(payment.hash)
    setCopiedHash(true)
    setTimeout(() => setCopiedHash(false), 2000)
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

  return (
    <div
      onClick={onClick}
      className="border border-border bg-white rounded-xl p-4 hover:bg-brand/5 hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer shadow-sm"
    >
      {/* Top Row - Avatar, Status and Amount */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <PaymentAvatar address={payment.from} size={40} />
          <Badge className={`${getStatusColor(payment.status)} font-mono text-xs font-medium px-3 py-1 rounded-full`}>
            {getStatusLabel(payment.status)}
          </Badge>
        </div>
        <div className="text-right">
          <div className="font-mono font-bold text-foreground text-lg">
            ${payment.amountUSD.toFixed(2)}
          </div>
          <div className="font-mono text-muted text-xs">
            ~{payment.amount.toFixed(2)} SOL
          </div>
        </div>
      </div>

      {/* Date */}
      <div className="font-mono text-sm text-muted mb-3">
        {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}
      </div>

      {/* Hash */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
        <span className="font-mono text-xs text-foreground">
          {payment.hash.slice(0, 16)}...
        </span>
        <button
          onClick={handleCopy}
          className="text-muted hover:text-brand transition-colors duration-200"
          title="Copy full hash"
        >
          {copiedHash ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </button>
      </div>

      {/* From Wallet */}
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-xs text-muted-foreground">From:</span>
        <span className="font-mono text-xs text-foreground">{payment.from}</span>
      </div>

      {/* Link */}
      {payment.linkName && (
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs text-muted-foreground">Link:</span>
          <span className="font-mono text-xs text-brand">{payment.linkName}</span>
        </div>
      )}

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
