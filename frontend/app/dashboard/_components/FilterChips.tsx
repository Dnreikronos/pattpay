'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Network, ArrowDownRight, ArrowUpRight, RotateCcw, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { useFilterStore } from '@/lib/stores/filter-store';
import type { Network as NetworkType, TransactionType } from '@/lib/stores/filter-store';
import { Badge } from '@/components/ui/badge';

// Labels e ícones (mesmos do CommandMenu)
const NetworkLabels: Record<NetworkType, string> = {
  ethereum: 'Ethereum',
  solana: 'Solana',
  ton: 'TON',
  polygon: 'Polygon',
  bitcoin: 'Bitcoin',
};

const TransactionTypeLabels: Record<TransactionType, string> = {
  incoming: 'Incoming',
  outgoing: 'Outgoing',
  refund: 'Refund',
  subscription: 'Subscription',
};

const TransactionTypeIcons: Record<TransactionType, React.ReactNode> = {
  incoming: <ArrowDownRight className="h-3 w-3" />,
  outgoing: <ArrowUpRight className="h-3 w-3" />,
  refund: <RotateCcw className="h-3 w-3" />,
  subscription: <CreditCard className="h-3 w-3" />,
};

const NetworkIcons: Record<NetworkType, React.ReactNode> = {
  ethereum: (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
    </svg>
  ),
  solana: (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.5 19l3-3h16l-3 3zM4.5 12l3-3h16l-3 3zM7.5 5l-3 3h16l3-3z" />
    </svg>
  ),
  ton: <Network className="h-3 w-3" />,
  polygon: (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zm0 2.18l7.5 3.75v7.5L12 19.82l-7.5-3.75v-7.5L12 4.18z" />
    </svg>
  ),
  bitcoin: (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.2 10.5c.4-1.1-.2-2.3-1.4-2.9.8-1.1.5-2.6-.7-3.3l-.6 2.3c-.2-.1-.4-.1-.6-.2l.6-2.3c-.2 0-.4-.1-.6-.1l-.6 2.3-1.2-.3.3-1.1c-.2 0-.4-.1-.6-.1l-.3 1.1-2.1-.6.4-1.5s.8.2.8.2c.4.1.6 0 .7-.3l1-4c0-.2 0-.6-.5-.7 0 0-.8-.2-.8-.2l.2-.9 2.3.6v.1l.3-1.1c.2 0 .4.1.6.1l-.3 1.1c.2.1.4.1.6.2l.3-1.1c.2 0 .4.1.6.1l-.3 1.1c1.3.5 2.2 1.3 2.1 2.6-.1.9-.6 1.5-1.4 1.7 1 .3 1.6 1 1.4 2.3zM13.8 9c.1-.9-.7-1.4-1.9-1.7l-.4 1.7c1.2.3 2 .3 2.1-.9zm-1.6 3.5l-.5 1.9c1.4.4 2.4.2 2.6-.9.2-1-.6-1.6-2.1-2z" />
    </svg>
  ),
};

interface FilterChipProps {
  label: string;
  icon?: React.ReactNode;
  onRemove: () => void;
}

function FilterChip({ label, icon, onRemove }: FilterChipProps) {
  return (
    <motion.div
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <Badge
        variant="secondary"
        className="group flex items-center gap-1.5 rounded-2xl border-2 border-border bg-white px-3 py-1.5 text-xs font-medium shadow-sm transition-all hover:border-brand/30"
      >
        {icon && <span className="flex items-center">{icon}</span>}
        <span>{label}</span>
        <button
          onClick={onRemove}
          className="ml-1 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full transition-all hover:bg-muted/50 focus:outline-none"
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    </motion.div>
  );
}

export function FilterChips() {
  const { dateFilter, networks, transactionTypes, removeFilter, clearFilters, hasActiveFilters } =
    useFilterStore();

  // Formatar label de data
  const getDateLabel = () => {
    switch (dateFilter.preset) {
      case 'last-7-days':
        return 'Last 7 days';
      case 'last-30-days':
        return 'Last 30 days';
      case 'last-90-days':
        return 'Last 90 days';
      case 'custom':
        if (dateFilter.from && dateFilter.to) {
          return `${format(dateFilter.from, 'MMM dd')} - ${format(dateFilter.to, 'MMM dd')}`;
        }
        return 'Custom range';
      default:
        return 'Last 30 days';
    }
  };

  if (!hasActiveFilters() && networks.length === 0 && transactionTypes.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-2"
    >
      <AnimatePresence mode="popLayout">
        {/* Date Filter */}
        <FilterChip
          key="date-filter"
          label={getDateLabel()}
          icon={<Calendar className="h-3 w-3" />}
          onRemove={() => removeFilter('date')}
        />

        {/* Network Filters */}
        {networks.map((network) => (
          <FilterChip
            key={`network-${network}`}
            label={NetworkLabels[network]}
            icon={NetworkIcons[network]}
            onRemove={() => removeFilter('network', network)}
          />
        ))}

        {/* Transaction Type Filters */}
        {transactionTypes.map((type) => (
          <FilterChip
            key={`type-${type}`}
            label={TransactionTypeLabels[type]}
            icon={TransactionTypeIcons[type]}
            onRemove={() => removeFilter('transactionType', type)}
          />
        ))}

        {/* Clear All Button */}
        {(networks.length > 0 || transactionTypes.length > 0 || dateFilter.preset !== 'last-30-days') && (
          <motion.button
            layout
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={clearFilters}
            className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear all
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
