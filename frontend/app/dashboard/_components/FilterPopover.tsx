'use client';

import * as React from 'react';
import {
  Calendar,
  Network,
  ArrowDownRight,
  ArrowUpRight,
  RotateCcw,
  CreditCard,
  Check,
  ChevronRight,
  ArrowLeft,
  SlidersHorizontal,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useFilterStore } from '@/lib/stores/filter-store';
import type { Network as NetworkType, TransactionType, DateRangePreset } from '@/lib/stores/filter-store';
import { motion, AnimatePresence } from 'framer-motion';

// Ícones de redes
const NetworkIcons: Record<NetworkType, React.ReactNode> = {
  ethereum: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
    </svg>
  ),
  solana: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.5 19l3-3h16l-3 3zM4.5 12l3-3h16l-3 3zM7.5 5l-3 3h16l3-3z" />
    </svg>
  ),
  ton: <Network className="h-4 w-4" />,
  polygon: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zm0 2.18l7.5 3.75v7.5L12 19.82l-7.5-3.75v-7.5L12 4.18z" />
    </svg>
  ),
  bitcoin: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.2 10.5c.4-1.1-.2-2.3-1.4-2.9.8-1.1.5-2.6-.7-3.3l-.6 2.3c-.2-.1-.4-.1-.6-.2l.6-2.3c-.2 0-.4-.1-.6-.1l-.6 2.3-1.2-.3.3-1.1c-.2 0-.4-.1-.6-.1l-.3 1.1-2.1-.6.4-1.5s.8.2.8.2c.4.1.6 0 .7-.3l1-4c0-.2 0-.6-.5-.7 0 0-.8-.2-.8-.2l.2-.9 2.3.6v.1l.3-1.1c.2 0 .4.1.6.1l-.3 1.1c.2.1.4.1.6.2l.3-1.1c.2 0 .4.1.6.1l-.3 1.1c1.3.5 2.2 1.3 2.1 2.6-.1.9-.6 1.5-1.4 1.7 1 .3 1.6 1 1.4 2.3zM13.8 9c.1-.9-.7-1.4-1.9-1.7l-.4 1.7c1.2.3 2 .3 2.1-.9zm-1.6 3.5l-.5 1.9c1.4.4 2.4.2 2.6-.9.2-1-.6-1.6-2.1-2z" />
    </svg>
  ),
};

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
  incoming: <ArrowDownRight className="h-4 w-4" />,
  outgoing: <ArrowUpRight className="h-4 w-4" />,
  refund: <RotateCcw className="h-4 w-4" />,
  subscription: <CreditCard className="h-4 w-4" />,
};

const DatePresetLabels: Record<DateRangePreset, string> = {
  'last-7-days': 'Last 7 days',
  'last-30-days': 'Last 30 days',
  'last-90-days': 'Last 90 days',
  'custom': 'Custom range',
};

type FilterCategory = 'main' | 'date' | 'network' | 'transaction-type';

interface CategoryItemProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  activeCount?: number;
  onClick: () => void;
}

function CategoryItem({ label, description, icon, activeCount, onClick }: CategoryItemProps) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full cursor-pointer items-center gap-3 rounded-lg border-2 border-border px-4 py-3 text-left transition-all hover:border-brand/30 hover:bg-muted/20"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-muted-foreground/30 text-muted-foreground transition-all group-hover:border-brand group-hover:bg-brand/5 group-hover:text-brand">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">{label}</span>
          {activeCount !== undefined && activeCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand/10 px-1.5 text-[10px] font-medium text-brand">
              {activeCount}
            </span>
          )}
        </div>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

interface OptionItemProps {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

function OptionItem({ label, icon, selected, onClick }: OptionItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        group flex w-full cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-2.5 text-left transition-all
        ${
          selected
            ? 'border-brand bg-brand/10 text-brand shadow-sm'
            : 'border-border bg-transparent hover:border-brand/30 hover:bg-muted/20'
        }
      `}
    >
      <div className={`flex items-center transition-colors ${selected ? 'text-brand' : 'text-muted-foreground group-hover:text-foreground'}`}>
        {icon}
      </div>
      <span className="flex-1 font-mono text-sm font-medium">{label}</span>

      {/* Checkbox - sempre visível */}
      <div
        className={`
          flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all
          ${
            selected
              ? 'border-brand bg-brand'
              : 'border-muted-foreground/30 bg-transparent group-hover:border-brand/50'
          }
        `}
      >
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
}

export function FilterPopover() {
  const {
    dateFilter,
    setDatePreset,
    networks,
    setNetworks,
    toggleNetwork,
    transactionTypes,
    setTransactionTypes,
    toggleTransactionType,
    clearFilters,
  } = useFilterStore();

  const [open, setOpen] = React.useState(false);
  const [currentView, setCurrentView] = React.useState<FilterCategory>('main');

  // Reset to main view when popover closes
  React.useEffect(() => {
    if (!open) {
      setCurrentView('main');
    }
  }, [open]);

  const getActiveCount = (category: FilterCategory) => {
    switch (category) {
      case 'date':
        return dateFilter.preset !== 'last-30-days' ? 1 : 0;
      case 'network':
        return networks.length;
      case 'transaction-type':
        return transactionTypes.length;
      default:
        return 0;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-10 gap-2 border-2 border-border bg-card font-mono text-sm shadow-sm transition-all hover:border-brand/30 hover:bg-card hover:shadow cursor-pointer px-4"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0 shadow-lg" align="start">
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              {currentView !== 'main' && (
                <button
                  onClick={() => setCurrentView('main')}
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border-2 border-border transition-all hover:border-brand hover:bg-brand/5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
              )}
              <h3 className="font-mono text-sm font-medium">
                {currentView === 'main' && 'Filters'}
                {currentView === 'date' && 'Date Range'}
                {currentView === 'network' && 'Network'}
                {currentView === 'transaction-type' && 'Transaction Type'}
              </h3>
            </div>

            {/* Clear buttons */}
            {currentView === 'main' && (
              <button
                onClick={clearFilters}
                className="cursor-pointer font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear all
              </button>
            )}
            {currentView === 'date' && dateFilter.preset !== 'last-30-days' && (
              <button
                onClick={() => setDatePreset('last-30-days')}
                className="cursor-pointer font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear
              </button>
            )}
            {currentView === 'network' && networks.length > 0 && (
              <button
                onClick={() => setNetworks([])}
                className="cursor-pointer font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear
              </button>
            )}
            {currentView === 'transaction-type' && transactionTypes.length > 0 && (
              <button
                onClick={() => setTransactionTypes([])}
                className="cursor-pointer font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          {/* Content */}
          <div className="min-h-[200px]">
            <AnimatePresence mode="wait">
              {/* Main Categories View */}
              {currentView === 'main' && (
                <motion.div
                  key="main"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-2 p-3"
                >
                  <CategoryItem
                    label="Date Range"
                    description="Filter by time period"
                    icon={<Calendar className="h-4 w-4" />}
                    activeCount={getActiveCount('date')}
                    onClick={() => setCurrentView('date')}
                  />
                  <CategoryItem
                    label="Network"
                    description="Filter by blockchain network"
                    icon={<Network className="h-4 w-4" />}
                    activeCount={getActiveCount('network')}
                    onClick={() => setCurrentView('network')}
                  />
                  <CategoryItem
                    label="Transaction Type"
                    description="Filter by transaction category"
                    icon={<ArrowDownRight className="h-4 w-4" />}
                    activeCount={getActiveCount('transaction-type')}
                    onClick={() => setCurrentView('transaction-type')}
                  />
                </motion.div>
              )}

              {/* Date Range Options */}
              {currentView === 'date' && (
                <motion.div
                  key="date"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-1 p-3"
                >
                  {(['last-7-days', 'last-30-days', 'last-90-days'] as DateRangePreset[]).map((preset) => (
                    <OptionItem
                      key={preset}
                      label={DatePresetLabels[preset]}
                      icon={<Calendar className="h-4 w-4" />}
                      selected={dateFilter.preset === preset}
                      onClick={() => {
                        setDatePreset(preset);
                        setTimeout(() => setCurrentView('main'), 200);
                      }}
                    />
                  ))}
                </motion.div>
              )}

              {/* Network Options */}
              {currentView === 'network' && (
                <motion.div
                  key="network"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-1 p-3"
                >
                  {(Object.keys(NetworkLabels) as NetworkType[]).map((network) => (
                    <OptionItem
                      key={network}
                      label={NetworkLabels[network]}
                      icon={NetworkIcons[network]}
                      selected={networks.includes(network)}
                      onClick={() => toggleNetwork(network)}
                    />
                  ))}
                </motion.div>
              )}

              {/* Transaction Type Options */}
              {currentView === 'transaction-type' && (
                <motion.div
                  key="transaction-type"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-1 p-3"
                >
                  {(Object.keys(TransactionTypeLabels) as TransactionType[]).map((type) => (
                    <OptionItem
                      key={type}
                      label={TransactionTypeLabels[type]}
                      icon={TransactionTypeIcons[type]}
                      selected={transactionTypes.includes(type)}
                      onClick={() => toggleTransactionType(type)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
