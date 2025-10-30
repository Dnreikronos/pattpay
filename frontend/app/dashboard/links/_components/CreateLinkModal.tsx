'use client'

import { useState } from 'react'
import { Link as LinkIcon, Repeat, ExternalLink, Plus, Calendar, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLinks } from '@/lib/hooks/useLinks'
import type { CreateLinkRequest } from '@/types/link'

interface CreateLinkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface TokenPriceInput {
  token: 'USDC' | 'USDT' | 'SOL'
  price: string
}

export function CreateLinkModal({ open, onOpenChange }: CreateLinkModalProps) {
  const { createLinkAsync, isCreating } = useLinks({ statuses: [], isRecurring: 'all' })

  const [formData, setFormData] = useState({
    name: '',
    redirectUrl: '',
    isRecurring: false,
    description: '',
    expiresAt: '',
    durationMonths: '',
    periodSeconds: ''
  })

  const [tokenPrices, setTokenPrices] = useState<TokenPriceInput[]>([
    { token: 'USDC', price: '' },
  ])

  const [errors, setErrors] = useState<Record<string, string>>({})

  const availableTokens: Array<'USDC' | 'USDT' | 'SOL'> = ['USDC', 'USDT', 'SOL']

  const addTokenPrice = () => {
    // Find first unused token
    const usedTokens = tokenPrices.map(tp => tp.token)
    const availableToken = availableTokens.find(t => !usedTokens.includes(t))
    if (availableToken) {
      setTokenPrices([...tokenPrices, { token: availableToken, price: '' }])
    }
  }

  const removeTokenPrice = (index: number) => {
    if (tokenPrices.length > 1) {
      setTokenPrices(tokenPrices.filter((_, i) => i !== index))
    }
  }

  const updateTokenPrice = (index: number, field: 'token' | 'price', value: string) => {
    const updated = [...tokenPrices]
    updated[index] = { ...updated[index], [field]: value }
    setTokenPrices(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Link name is required'
    }

    // Validate token prices
    const validTokenPrices = tokenPrices.filter(tp => tp.price && parseFloat(tp.price) > 0)
    if (validTokenPrices.length === 0) {
      newErrors.tokenPrices = 'At least one token price is required'
    }

    // Check for duplicate tokens
    const tokens = tokenPrices.map(tp => tp.token)
    if (new Set(tokens).size !== tokens.length) {
      newErrors.tokenPrices = 'Duplicate tokens are not allowed'
    }

    if (formData.redirectUrl && !isValidUrl(formData.redirectUrl)) {
      newErrors.redirectUrl = 'Please enter a valid URL'
    }

    if (formData.isRecurring) {
      if (!formData.durationMonths || parseInt(formData.durationMonths) <= 0) {
        newErrors.durationMonths = 'Duration in months is required for recurring payments'
      }
      if (!formData.periodSeconds || parseInt(formData.periodSeconds) <= 0) {
        newErrors.periodSeconds = 'Billing period is required for recurring payments'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Prepare request data
    const requestData: CreateLinkRequest = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      redirectUrl: formData.redirectUrl.trim() || undefined,
      expiresAt: formData.expiresAt || undefined,
      isRecurring: formData.isRecurring,
      durationMonths: formData.isRecurring ? parseInt(formData.durationMonths) : undefined,
      periodSeconds: formData.isRecurring ? parseInt(formData.periodSeconds) : undefined,
      tokenPrices: validTokenPrices.map(tp => ({
        token: tp.token,
        price: parseFloat(tp.price)
      }))
    }

    try {
      await createLinkAsync(requestData)

      // Reset form on success
      resetForm()
      onOpenChange(false)
    } catch (error) {
      // Error is handled by the mutation hook (toast notification)
      console.error('Failed to create link:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      redirectUrl: '',
      isRecurring: false,
      description: '',
      expiresAt: '',
      durationMonths: '',
      periodSeconds: ''
    })
    setTokenPrices([{ token: 'USDC', price: '' }])
    setErrors({})
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
    resetForm()
    onOpenChange(false)
  }

  const generatedUrl = formData.name
    ? `https://pay.pattpay.com/payment/${formData.name.toLowerCase().replace(/\s+/g, '-')}`
    : ''

  // Common period presets in seconds
  const periodPresets = [
    { label: 'Weekly', value: 604800, days: 7 },
    { label: 'Monthly', value: 2592000, days: 30 },
    { label: 'Quarterly', value: 7776000, days: 90 },
    { label: 'Yearly', value: 31536000, days: 365 },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-2 border-border rounded-2xl shadow-xl">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="flex items-center gap-3 font-mono text-lg font-bold text-foreground">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand border-2 border-brand/20">
              <LinkIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-foreground">Create Payment Link</p>
              <p className="text-xs font-normal text-muted-foreground mt-0.5">
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
              className={`flex h-11 w-full rounded-lg border-2 ${errors.name ? 'border-error focus-visible:border-error' : 'border-border focus-visible:border-brand'} bg-card px-4 py-2 font-mono text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(79,70,229,0.1)] hover:border-brand/50 transition-all duration-200`}
            />
            {errors.name && (
              <p className="text-error text-xs font-mono flex items-center gap-1 mt-1">
                ⚠ {errors.name}
              </p>
            )}
          </div>

          {/* Token Prices */}
          <div className="space-y-3">
            <label className="font-mono text-sm font-semibold text-foreground flex items-center gap-1">
              Token Prices <span className="text-error text-base">*</span>
            </label>
            <p className="text-muted-foreground text-xs font-mono -mt-1">
              Set the price for each accepted token
            </p>

            <div className="space-y-3">
              {tokenPrices.map((tp, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <select
                    value={tp.token}
                    onChange={(e) => updateTokenPrice(idx, 'token', e.target.value)}
                    className="flex h-11 w-32 rounded-lg border-2 border-border bg-card px-3 py-2 font-mono text-sm focus-visible:outline-none focus-visible:border-brand hover:border-brand/50 transition-all"
                  >
                    {availableTokens.map(token => (
                      <option key={token} value={token}>{token}</option>
                    ))}
                  </select>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={tp.price}
                      onChange={(e) => {
                        updateTokenPrice(idx, 'price', e.target.value)
                        setErrors({ ...errors, tokenPrices: '' })
                      }}
                      placeholder="0.00"
                      className="flex h-11 w-full rounded-lg border-2 border-border bg-card px-4 py-2 font-mono text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-brand hover:border-brand/50 transition-all"
                    />
                  </div>
                  {tokenPrices.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeTokenPrice(idx)}
                      className="h-11 px-3 border-2 border-error/20 hover:border-error hover:bg-error/5 text-error cursor-pointer"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {tokenPrices.length < availableTokens.length && (
              <Button
                type="button"
                variant="outline"
                onClick={addTokenPrice}
                className="w-full h-10 font-mono text-sm border-2 border-dashed border-brand/30 hover:border-brand hover:bg-brand/5 text-brand cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Token
              </Button>
            )}

            {errors.tokenPrices && (
              <p className="text-error text-xs font-mono flex items-center gap-1">
                ⚠ {errors.tokenPrices}
              </p>
            )}
          </div>

          {/* Payment Type Toggle */}
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
                  : 'border-border bg-card hover:border-brand/40 hover:bg-brand/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                  formData.isRecurring ? 'bg-brand/10 text-brand' : 'bg-muted/10 text-muted-foreground'
                }`}>
                  <Repeat className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-mono text-sm font-semibold text-foreground">
                    Recurring Payment
                  </p>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">
                    Charge automatically on a schedule
                  </p>
                </div>
              </div>
              <div className={`flex h-7 w-12 items-center rounded-full transition-all shadow-inner ${
                formData.isRecurring ? 'bg-brand' : 'bg-border'
              }`}>
                <motion.div
                  className="h-6 w-6 rounded-full bg-card shadow-md border border-border/20"
                  animate={{
                    x: formData.isRecurring ? 22 : 2
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </div>
            </button>
          </div>

          {/* Recurring Fields */}
          {formData.isRecurring && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 bg-brand/5 rounded-xl p-4 border-2 border-brand/20"
            >
              <h3 className="font-mono text-sm font-semibold text-brand flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                Subscription Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Duration Months */}
                <div className="space-y-2">
                  <label className="font-mono text-xs font-semibold text-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Duration (months) <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.durationMonths}
                    onChange={(e) => {
                      setFormData({ ...formData, durationMonths: e.target.value })
                      setErrors({ ...errors, durationMonths: '' })
                    }}
                    placeholder="12"
                    className={`flex h-10 w-full rounded-lg border-2 ${errors.durationMonths ? 'border-error' : 'border-border focus-visible:border-brand'} bg-card px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus-visible:outline-none`}
                  />
                  {errors.durationMonths && (
                    <p className="text-error text-xs font-mono">⚠ {errors.durationMonths}</p>
                  )}
                  <p className="text-muted-foreground text-xs font-mono">
                    Total subscription length
                  </p>
                </div>

                {/* Period Seconds */}
                <div className="space-y-2">
                  <label className="font-mono text-xs font-semibold text-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Billing Period (seconds) <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.periodSeconds}
                    onChange={(e) => {
                      setFormData({ ...formData, periodSeconds: e.target.value })
                      setErrors({ ...errors, periodSeconds: '' })
                    }}
                    placeholder="2592000"
                    className={`flex h-10 w-full rounded-lg border-2 ${errors.periodSeconds ? 'border-error' : 'border-border focus-visible:border-brand'} bg-card px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus-visible:outline-none`}
                  />
                  {errors.periodSeconds && (
                    <p className="text-error text-xs font-mono">⚠ {errors.periodSeconds}</p>
                  )}
                  <p className="text-muted-foreground text-xs font-mono">
                    How often to charge
                  </p>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2">
                {periodPresets.map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, periodSeconds: preset.value.toString() })}
                    className="px-3 py-1.5 rounded-lg border border-brand/20 bg-card hover:bg-brand/10 hover:border-brand text-xs font-mono text-foreground transition-all cursor-pointer"
                  >
                    {preset.label} ({preset.days}d)
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Redirect URL */}
          <div className="space-y-2">
            <label className="font-mono text-sm font-semibold text-foreground">
              Redirect URL <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
            </label>
            <div className="relative">
              <ExternalLink className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="url"
                value={formData.redirectUrl}
                onChange={(e) => {
                  setFormData({ ...formData, redirectUrl: e.target.value })
                  setErrors({ ...errors, redirectUrl: '' })
                }}
                placeholder="https://your-site.com/success"
                className={`flex h-11 w-full rounded-lg border-2 ${errors.redirectUrl ? 'border-error focus-visible:border-error' : 'border-border focus-visible:border-brand'} bg-card px-4 py-2 pl-11 font-mono text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(79,70,229,0.1)] hover:border-brand/50 transition-all duration-200`}
              />
            </div>
            {!errors.redirectUrl && (
              <p className="text-muted-foreground text-xs font-mono">
                Where to redirect users after successful payment
              </p>
            )}
            {errors.redirectUrl && (
              <p className="text-error text-xs font-mono flex items-center gap-1 mt-1">
                ⚠ {errors.redirectUrl}
              </p>
            )}
          </div>

          {/* Expiration Date */}
          <div className="space-y-2">
            <label className="font-mono text-sm font-semibold text-foreground">
              Expiration Date <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
            </label>
            <input
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              className="flex h-11 w-full rounded-lg border-2 border-border bg-card px-4 py-2 font-mono text-sm focus-visible:outline-none focus-visible:border-brand hover:border-brand/50 transition-all"
            />
            <p className="text-muted-foreground text-xs font-mono">
              When this link stops accepting payments
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="font-mono text-sm font-semibold text-foreground">
              Description <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add a description for this payment link..."
              rows={3}
              className="flex w-full rounded-lg border-2 border-border bg-card px-4 py-3 font-mono text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-brand focus-visible:shadow-[0_0_0_3px_rgba(79,70,229,0.1)] hover:border-brand/50 transition-all duration-200 resize-none"
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

                <div className="bg-card rounded-lg p-3 mb-3 border border-brand/10">
                  <p className="font-mono text-xs text-muted-foreground mb-1">URL</p>
                  <p className="font-mono text-sm text-foreground break-all font-medium">
                    {generatedUrl}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`${formData.isRecurring ? 'bg-card text-brand border-2 border-brand' : 'bg-card text-accent border-2 border-accent'} font-mono text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm`}>
                    {formData.isRecurring ? '🔄 Recurring' : '⚡ One-time'}
                  </Badge>
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
              disabled={isCreating}
              className="flex-1 h-12 font-mono text-sm font-semibold border-2 border-border hover:border-error hover:bg-error/5 hover:text-error transition-all cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="flex-1 h-12 font-mono text-sm font-semibold bg-brand hover:bg-brand-600 text-white shadow-lg shadow-brand/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Link
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
