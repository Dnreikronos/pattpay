'use client'

import { useState } from 'react'
import { X, Link as LinkIcon, DollarSign, Repeat, ExternalLink, Plus, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface CreateLinkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateLinkModal({ open, onOpenChange }: CreateLinkModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    redirectUrl: '',
    isRecurring: false,
    description: '',
    acceptedTokens: ['USDC', 'USDT', 'SOL'] // Default: all tokens accepted
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const availableTokens = [
    { id: 'USDC', label: 'USDC', icon: '💵' },
    { id: 'USDT', label: 'USDT', icon: '💶' },
    { id: 'SOL', label: 'SOL', icon: '◎' }
  ]

  const toggleToken = (tokenId: string) => {
    const currentTokens = formData.acceptedTokens
    if (currentTokens.includes(tokenId)) {
      // Don't allow removing all tokens
      if (currentTokens.length === 1) return
      setFormData({
        ...formData,
        acceptedTokens: currentTokens.filter(t => t !== tokenId)
      })
    } else {
      setFormData({
        ...formData,
        acceptedTokens: [...currentTokens, tokenId]
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Link name is required'
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    if (formData.redirectUrl && !isValidUrl(formData.redirectUrl)) {
      newErrors.redirectUrl = 'Please enter a valid URL'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // TODO: Submit to API
    console.log('Creating link:', formData)

    // Reset form
    setFormData({
      name: '',
      amount: '',
      redirectUrl: '',
      isRecurring: false,
      description: '',
      acceptedTokens: ['USDC', 'USDT', 'SOL']
    })
    setErrors({})
    onOpenChange(false)
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleCancel = () => {
    setFormData({
      name: '',
      amount: '',
      redirectUrl: '',
      isRecurring: false,
      description: '',
      acceptedTokens: ['USDC', 'USDT', 'SOL']
    })
    setErrors({})
    onOpenChange(false)
  }

  const generatedUrl = formData.name
    ? `https://pay.pattpay.com/cl/${formData.name.toLowerCase().replace(/\s+/g, '-')}`
    : ''

  const usdToSOL = 0.01 // Mock conversion rate (1 USD = 0.01 SOL)
  const amountSOL = formData.amount ? (parseFloat(formData.amount) * usdToSOL).toFixed(4) : '0.0000'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-2 border-border rounded-2xl shadow-xl">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="flex items-center gap-3 font-mono text-lg font-bold text-foreground">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand border-2 border-brand/20">
              <LinkIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-foreground">Create Payment Link</p>
              <p className="text-xs font-normal text-muted mt-0.5">
                Generate a shareable link to accept payments
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          {/* Link Name */}
          <div className="space-y-2">
            <label className="font-mono text-sm font-semibold text-foreground flex items-center gap-1">
              Link Name <span className="text-error text-base">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                setErrors({ ...errors, name: '' })
              }}
              placeholder="e.g., Premium Plan, Donation, Product X"
              className={`flex h-11 w-full rounded-lg border-2 ${errors.name ? 'border-error focus-visible:border-error' : 'border-border focus-visible:border-brand'} bg-white px-4 py-2 font-mono text-sm placeholder:text-muted focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(79,70,229,0.1)] hover:border-brand/50 transition-all duration-200`}
            />
            {errors.name && (
              <p className="text-error text-xs font-mono flex items-center gap-1 mt-1">
                ⚠ {errors.name}
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="font-mono text-sm font-semibold text-foreground flex items-center gap-1">
              Amount (USD) <span className="text-error text-base">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-accent">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => {
                  setFormData({ ...formData, amount: e.target.value })
                  setErrors({ ...errors, amount: '' })
                }}
                placeholder="0.00"
                className={`flex h-11 w-full rounded-lg border-2 ${errors.amount ? 'border-error focus-visible:border-error' : 'border-border focus-visible:border-brand'} bg-white px-4 py-2 pl-12 font-mono text-sm placeholder:text-muted focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(79,70,229,0.1)] hover:border-brand/50 transition-all duration-200`}
              />
            </div>
            {formData.amount && !errors.amount && (
              <p className="text-muted text-xs font-mono flex items-center gap-1">
                <span className="text-brand">≈</span> {amountSOL} SOL
              </p>
            )}
            {errors.amount && (
              <p className="text-error text-xs font-mono flex items-center gap-1 mt-1">
                ⚠ {errors.amount}
              </p>
            )}
          </div>

          {/* Redirect URL */}
          <div className="space-y-2">
            <label className="font-mono text-sm font-semibold text-foreground">
              Redirect URL <span className="text-muted font-normal text-xs">(Optional)</span>
            </label>
            <div className="relative">
              <ExternalLink className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="url"
                value={formData.redirectUrl}
                onChange={(e) => {
                  setFormData({ ...formData, redirectUrl: e.target.value })
                  setErrors({ ...errors, redirectUrl: '' })
                }}
                placeholder="https://your-site.com/success"
                className={`flex h-11 w-full rounded-lg border-2 ${errors.redirectUrl ? 'border-error focus-visible:border-error' : 'border-border focus-visible:border-brand'} bg-white px-4 py-2 pl-11 font-mono text-sm placeholder:text-muted focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(79,70,229,0.1)] hover:border-brand/50 transition-all duration-200`}
              />
            </div>
            {!errors.redirectUrl && (
              <p className="text-muted text-xs font-mono">
                Where to redirect users after successful payment
              </p>
            )}
            {errors.redirectUrl && (
              <p className="text-error text-xs font-mono flex items-center gap-1 mt-1">
                ⚠ {errors.redirectUrl}
              </p>
            )}
          </div>

          {/* Is Recurring Toggle */}
          <div className="space-y-2">
            <label className="font-mono text-sm font-semibold text-foreground">
              Payment Type
            </label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })}
              className={`flex w-full items-center justify-between rounded-xl border-2 px-5 py-4 transition-all cursor-pointer shadow-sm ${
                formData.isRecurring
                  ? 'border-brand bg-brand/5 shadow-brand/10'
                  : 'border-border bg-white hover:border-brand/40 hover:bg-brand/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                  formData.isRecurring ? 'bg-brand/10 text-brand' : 'bg-muted/10 text-muted'
                }`}>
                  <Repeat className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-mono text-sm font-semibold text-foreground">
                    Recurring Payment
                  </p>
                  <p className="font-mono text-xs text-muted mt-0.5">
                    Charge automatically on a schedule
                  </p>
                </div>
              </div>
              <div className={`flex h-7 w-12 items-center rounded-full transition-all shadow-inner ${
                formData.isRecurring ? 'bg-brand' : 'bg-border'
              }`}>
                <motion.div
                  className="h-6 w-6 rounded-full bg-white shadow-md border border-border/20"
                  animate={{
                    x: formData.isRecurring ? 22 : 2
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </div>
            </button>
          </div>

          {/* Accepted Tokens */}
          <div className="space-y-3">
            <label className="font-mono text-sm font-semibold text-foreground">
              Accepted Tokens <span className="text-error text-base">*</span>
            </label>
            <p className="text-muted text-xs font-mono -mt-1">
              Select which tokens customers can use to pay
            </p>
            <div className="grid grid-cols-3 gap-3">
              {availableTokens.map((token) => {
                const isSelected = formData.acceptedTokens.includes(token.id)
                const isOnlyOne = formData.acceptedTokens.length === 1 && isSelected

                return (
                  <button
                    key={token.id}
                    type="button"
                    onClick={() => toggleToken(token.id)}
                    disabled={isOnlyOne}
                    className={`flex flex-col items-center justify-center rounded-xl border-2 px-4 py-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand bg-brand/5 shadow-sm'
                        : 'border-border bg-white hover:border-brand/40 hover:bg-brand/5'
                    } ${isOnlyOne ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-2xl mb-2">{token.icon}</span>
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {token.label}
                    </span>
                    <div className="mt-2">
                      {isSelected ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-brand">
                          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-md border-2 border-muted" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
            {formData.acceptedTokens.length === 1 && (
              <p className="text-muted text-xs font-mono">
                At least one token must be selected
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="font-mono text-sm font-semibold text-foreground">
              Description <span className="text-muted font-normal text-xs">(Optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add a description for this payment link..."
              rows={3}
              className="flex w-full rounded-lg border-2 border-border bg-white px-4 py-3 font-mono text-sm placeholder:text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:shadow-[0_0_0_3px_rgba(79,70,229,0.1)] hover:border-brand/50 transition-all duration-200 resize-none"
            />
          </div>

          {/* Preview */}
          <AnimatePresence>
            {generatedUrl && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-xl border-2 border-brand/20 bg-gradient-to-br from-brand/5 to-brand/10 p-5 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/20 text-brand">
                    <LinkIcon className="h-4 w-4" />
                  </div>
                  <p className="font-mono text-xs font-bold text-brand uppercase tracking-wide">
                    Link Preview
                  </p>
                </div>

                <div className="bg-white rounded-lg p-3 mb-3 border border-brand/10">
                  <p className="font-mono text-xs text-muted mb-1">URL</p>
                  <p className="font-mono text-sm text-foreground break-all font-medium">
                    {generatedUrl}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`${formData.isRecurring ? 'bg-white text-brand border-2 border-brand' : 'bg-white text-accent border-2 border-accent'} font-mono text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm`}>
                    {formData.isRecurring ? '🔄 Recurring' : '⚡ One-time'}
                  </Badge>
                  {formData.amount && (
                    <div className="bg-white rounded-lg px-3 py-1.5 border-2 border-accent/30 shadow-sm">
                      <span className="font-mono text-sm font-bold text-foreground">
                        ${formData.amount}
                      </span>
                      <span className="font-mono text-xs text-muted ml-2">
                        (~{amountSOL} SOL)
                      </span>
                    </div>
                  )}
                </div>

                {/* Accepted Tokens in Preview */}
                <div className="mt-3 pt-3 border-t border-brand/10">
                  <p className="font-mono text-xs text-muted mb-2">Accepts</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.acceptedTokens.map(tokenId => {
                      const token = availableTokens.find(t => t.id === tokenId)
                      return (
                        <div key={tokenId} className="bg-white rounded-lg px-2.5 py-1.5 border border-border shadow-sm flex items-center gap-1.5">
                          <span className="text-sm">{token?.icon}</span>
                          <span className="font-mono text-xs font-semibold text-foreground">
                            {token?.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-6 mt-6 border-t-2 border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 h-12 font-mono text-sm font-semibold border-2 border-border hover:border-error hover:bg-error/5 hover:text-error transition-all cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 font-mono text-sm font-semibold bg-brand hover:bg-brand-600 text-white shadow-lg shadow-brand/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Link
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
