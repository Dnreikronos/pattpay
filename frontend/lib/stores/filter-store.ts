import { create } from 'zustand';
import { addDays, startOfDay, endOfDay } from 'date-fns';

// Tipos de filtros
export type DateRangePreset = 'last-7-days' | 'last-30-days' | 'last-90-days' | 'custom';

export type Network = 'ethereum' | 'solana' | 'ton' | 'polygon' | 'bitcoin';

export type TransactionType = 'incoming' | 'outgoing' | 'refund' | 'subscription';

export interface DateFilter {
  preset: DateRangePreset;
  from?: Date;
  to?: Date;
}

export interface FilterState {
  // Filtros ativos
  dateFilter: DateFilter;
  networks: Network[];
  transactionTypes: TransactionType[];

  // Estado da UI
  isCommandOpen: boolean;

  // Actions
  setDateFilter: (filter: DateFilter) => void;
  setDatePreset: (preset: DateRangePreset) => void;
  setCustomDateRange: (from: Date, to: Date) => void;

  toggleNetwork: (network: Network) => void;
  setNetworks: (networks: Network[]) => void;

  toggleTransactionType: (type: TransactionType) => void;
  setTransactionTypes: (types: TransactionType[]) => void;

  clearFilters: () => void;
  removeFilter: (filterType: 'date' | 'network' | 'transactionType', value?: string) => void;

  setCommandOpen: (open: boolean) => void;

  // Helpers
  getActiveFiltersCount: () => number;
  hasActiveFilters: () => boolean;
}

// Função auxiliar para obter datas baseadas no preset
const getDateRangeFromPreset = (preset: DateRangePreset): { from?: Date; to?: Date } => {
  const now = new Date();
  const today = endOfDay(now);

  switch (preset) {
    case 'last-7-days':
      return {
        from: startOfDay(addDays(now, -7)),
        to: today,
      };
    case 'last-30-days':
      return {
        from: startOfDay(addDays(now, -30)),
        to: today,
      };
    case 'last-90-days':
      return {
        from: startOfDay(addDays(now, -90)),
        to: today,
      };
    case 'custom':
      return {};
    default:
      return {};
  }
};

export const useFilterStore = create<FilterState>((set, get) => ({
  // Estado inicial
  dateFilter: {
    preset: 'last-30-days',
    ...getDateRangeFromPreset('last-30-days'),
  },
  networks: [],
  transactionTypes: [],
  isCommandOpen: false,

  // Date actions
  setDateFilter: (filter) => set({ dateFilter: filter }),

  setDatePreset: (preset) => {
    const range = getDateRangeFromPreset(preset);
    set({
      dateFilter: {
        preset,
        ...range,
      },
    });
  },

  setCustomDateRange: (from, to) => {
    set({
      dateFilter: {
        preset: 'custom',
        from: startOfDay(from),
        to: endOfDay(to),
      },
    });
  },

  // Network actions
  toggleNetwork: (network) => {
    const current = get().networks;
    const newNetworks = current.includes(network)
      ? current.filter((n) => n !== network)
      : [...current, network];
    set({ networks: newNetworks });
  },

  setNetworks: (networks) => set({ networks }),

  // Transaction type actions
  toggleTransactionType: (type) => {
    const current = get().transactionTypes;
    const newTypes = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    set({ transactionTypes: newTypes });
  },

  setTransactionTypes: (types) => set({ transactionTypes: types }),

  // Clear filters
  clearFilters: () => {
    set({
      dateFilter: {
        preset: 'last-30-days',
        ...getDateRangeFromPreset('last-30-days'),
      },
      networks: [],
      transactionTypes: [],
    });
  },

  // Remove specific filter
  removeFilter: (filterType, value) => {
    switch (filterType) {
      case 'date':
        set({
          dateFilter: {
            preset: 'last-30-days',
            ...getDateRangeFromPreset('last-30-days'),
          },
        });
        break;
      case 'network':
        if (value) {
          const current = get().networks;
          set({ networks: current.filter((n) => n !== value) });
        }
        break;
      case 'transactionType':
        if (value) {
          const current = get().transactionTypes;
          set({ transactionTypes: current.filter((t) => t !== value) });
        }
        break;
    }
  },

  // Command menu
  setCommandOpen: (open) => set({ isCommandOpen: open }),

  // Helpers
  getActiveFiltersCount: () => {
    const state = get();
    let count = 0;

    // Date sempre conta como 1 (sempre tem um preset ativo)
    count += 1;

    // Networks
    count += state.networks.length;

    // Transaction types
    count += state.transactionTypes.length;

    return count;
  },

  hasActiveFilters: () => {
    const state = get();
    return (
      state.dateFilter.preset !== 'last-30-days' ||
      state.networks.length > 0 ||
      state.transactionTypes.length > 0
    );
  },
}));
