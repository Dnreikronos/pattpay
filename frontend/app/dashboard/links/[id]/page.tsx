'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft,
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Clock,
  User,
  Activity,
  Eye,
  CreditCard,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLinkDetails } from '@/lib/hooks/useLinks';
import { toast } from 'sonner';

export default function LinkDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading, error } = useLinkDetails(id);
  const link = data?.link;

  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    if (link?.url) {
      navigator.clipboard.writeText(link.url);
      setCopied(true);
      toast.success('URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleStatus = async () => {
    // TODO: Implement status toggle with mutation
    toast.info('Status toggle not yet implemented');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin text-4xl">⏳</div>
        <p className="font-mono text-muted-foreground">Loading link details...</p>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-6xl">⚠️</div>
        <h2 className="font-mono text-xl font-bold text-foreground">Link not found</h2>
        <p className="font-mono text-muted-foreground">
          {error ? (error as Error).message : 'The payment link you are looking for does not exist.'}
        </p>
        <Button
          onClick={() => router.push('/dashboard/links')}
          className="mt-4 font-mono bg-brand hover:bg-brand-600 text-white cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Links
        </Button>
      </div>
    );
  }

  const statusColor = link.status === 'active' ? 'bg-success' : 'bg-muted';
  const statusText = link.status === 'active' ? 'Active' : 'Inactive';

  return (
    <div className="flex flex-col gap-6 p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Button
            onClick={() => router.push('/dashboard/links')}
            variant="outline"
            className="h-10 w-10 p-0 border-2 border-border hover:border-brand hover:bg-brand/5 cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1
              className="text-foreground mb-2"
              style={{
                fontFamily: 'var(--font-press-start)',
                fontWeight: 400,
                fontSize: '2rem',
              }}
            >
              {link.name}
            </h1>
            {link.description && (
              <p className="font-mono text-muted-foreground text-sm">{link.description}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Badge
            className={`${statusColor} text-white font-mono text-sm px-4 py-2 rounded-lg shadow-sm`}
          >
            {statusText}
          </Badge>
          <Button
            onClick={handleToggleStatus}
            variant="outline"
            className="font-mono border-2 border-border hover:border-brand hover:bg-brand/5 cursor-pointer"
          >
            <Settings className="h-4 w-4 mr-2" />
            {link.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </div>

      {/* URL Card */}
      <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <LinkIcon className="h-5 w-5 text-brand" />
          <h2 className="font-mono font-bold text-foreground">Payment URL</h2>
        </div>
        <div className="flex items-center gap-3 bg-surface border border-border rounded-lg p-4">
          <code className="flex-1 font-mono text-sm text-foreground break-all">{link.url}</code>
          <Button
            onClick={handleCopyUrl}
            variant="outline"
            size="sm"
            className="border-2 border-brand/30 hover:border-brand hover:bg-brand/10 text-brand cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button
            onClick={() => window.open(link.url, '_blank')}
            variant="outline"
            size="sm"
            className="border-2 border-border hover:border-brand hover:bg-brand/10 cursor-pointer"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statistics */}
        <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="h-5 w-5 text-brand" />
            <h2 className="font-mono font-bold text-foreground">Statistics</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-success" />
                <p className="font-mono text-xs text-muted-foreground">Total Payments</p>
              </div>
              <p className="font-mono text-2xl font-bold text-foreground">{link.totalPayments}</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-4 w-4 text-brand" />
                <p className="font-mono text-xs text-muted-foreground">Conversions</p>
              </div>
              <p className="font-mono text-2xl font-bold text-foreground">{link.conversions}</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-accent" />
                <p className="font-mono text-xs text-muted-foreground">Views</p>
              </div>
              <p className="font-mono text-2xl font-bold text-foreground">{link.views}</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-brand-300" />
                <p className="font-mono text-xs text-muted-foreground">Conversion Rate</p>
              </div>
              <p className="font-mono text-2xl font-bold text-foreground">
                {link.views > 0 ? ((link.conversions / link.views) * 100).toFixed(1) : '0'}%
              </p>
            </div>
          </div>
        </div>

        {/* Link Details */}
        <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <LinkIcon className="h-5 w-5 text-brand" />
            <h2 className="font-mono font-bold text-foreground">Link Details</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <span className="font-mono text-sm text-muted-foreground">Type</span>
              <Badge
                className={`${
                  link.isRecurring ? 'bg-brand/10 text-brand' : 'bg-accent/10 text-accent'
                } font-mono text-xs px-3 py-1 rounded-lg`}
              >
                {link.isRecurring ? '🔄 Recurring' : '⚡ One-time'}
              </Badge>
            </div>
            {link.isRecurring && link.durationMonths && (
              <div className="flex items-start justify-between border-b border-border pb-3">
                <span className="font-mono text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Duration
                </span>
                <span className="font-mono text-sm font-semibold text-foreground">
                  {link.durationMonths} months
                </span>
              </div>
            )}
            {link.isRecurring && link.periodSeconds && (
              <div className="flex items-start justify-between border-b border-border pb-3">
                <span className="font-mono text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Billing Period
                </span>
                <span className="font-mono text-sm font-semibold text-foreground">
                  {(link.periodSeconds / 86400).toFixed(0)} days
                </span>
              </div>
            )}
            {link.redirectUrl && (
              <div className="flex items-start justify-between border-b border-border pb-3">
                <span className="font-mono text-sm text-muted-foreground flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Redirect URL
                </span>
                <a
                  href={link.redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-brand hover:underline truncate max-w-[200px]"
                >
                  {link.redirectUrl}
                </a>
              </div>
            )}
            {link.expiresAt && (
              <div className="flex items-start justify-between border-b border-border pb-3">
                <span className="font-mono text-sm text-muted-foreground">Expires At</span>
                <span className="font-mono text-sm font-semibold text-foreground">
                  {new Date(link.expiresAt).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex items-start justify-between">
              <span className="font-mono text-sm text-muted-foreground">Created</span>
              <span className="font-mono text-sm font-semibold text-foreground">
                {new Date(link.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Token Prices */}
      <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="h-5 w-5 text-brand" />
          <h2 className="font-mono font-bold text-foreground">Token Prices</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {link.tokenPrices.map((tp) => (
            <div
              key={tp.id}
              className="bg-surface border-2 border-border rounded-xl p-5 hover:border-brand/50 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-sm font-semibold text-muted-foreground">
                  {tp.token}
                </span>
                <Badge className="bg-brand/10 text-brand font-mono text-xs px-2 py-1 rounded">
                  {tp.tokenDecimals} decimals
                </Badge>
              </div>
              <p className="font-mono text-3xl font-bold text-foreground mb-2">{tp.price}</p>
              <p className="font-mono text-xs text-muted-foreground break-all">
                {tp.tokenMint.slice(0, 8)}...{tp.tokenMint.slice(-6)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Receiver Info */}
      {link.receiver && (
        <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <User className="h-5 w-5 text-brand" />
            <h2 className="font-mono font-bold text-foreground">Receiver</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <span className="font-mono text-sm text-muted-foreground">Name</span>
              <span className="font-mono text-sm font-semibold text-foreground">
                {link.receiver.name}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="font-mono text-sm text-muted-foreground">Wallet Address</span>
              <code className="font-mono text-sm text-foreground bg-surface px-2 py-1 rounded">
                {link.receiver.walletAddress.slice(0, 8)}...
                {link.receiver.walletAddress.slice(-6)}
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
