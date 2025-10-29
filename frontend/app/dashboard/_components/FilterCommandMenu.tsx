'use client';

import * as React from 'react';
import {
  Calendar,
  Network,
  ArrowDownRight,
  ArrowUpRight,
  RotateCcw,
  CreditCard,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useFilterStore } from '@/lib/stores/filter-store';
import type { Network as NetworkType, TransactionType } from '@/lib/stores/filter-store';

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

// Labels amigáveis
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

export function FilterCommandMenu() {
  const {
    isCommandOpen,
    setCommandOpen,
    setDatePreset,
    toggleNetwork,
    toggleTransactionType,
    networks,
    transactionTypes,
  } = useFilterStore();

  // Atalho de teclado F para abrir
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen(!isCommandOpen);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isCommandOpen, setCommandOpen]);

  return (
    <CommandDialog open={isCommandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder="Search filters..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Date Range */}
        <CommandGroup heading="Date Range">
          <CommandItem
            onSelect={() => {
              setDatePreset('last-7-days');
              setCommandOpen(false);
            }}
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span>Last 7 days</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setDatePreset('last-30-days');
              setCommandOpen(false);
            }}
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span>Last 30 days</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setDatePreset('last-90-days');
              setCommandOpen(false);
            }}
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span>Last 90 days</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Networks */}
        <CommandGroup heading="Network">
          {(Object.keys(NetworkLabels) as NetworkType[]).map((network) => (
            <CommandItem
              key={network}
              onSelect={() => {
                toggleNetwork(network);
              }}
            >
              <div className="mr-2">{NetworkIcons[network]}</div>
              <span>{NetworkLabels[network]}</span>
              {networks.includes(network) && (
                <span className="ml-auto text-xs text-muted-foreground">✓</span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Transaction Types */}
        <CommandGroup heading="Transaction Type">
          {(Object.keys(TransactionTypeLabels) as TransactionType[]).map((type) => (
            <CommandItem
              key={type}
              onSelect={() => {
                toggleTransactionType(type);
              }}
            >
              <div className="mr-2">{TransactionTypeIcons[type]}</div>
              <span>{TransactionTypeLabels[type]}</span>
              {transactionTypes.includes(type) && (
                <span className="ml-auto text-xs text-muted-foreground">✓</span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
