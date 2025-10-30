// Link types for PattPay dashboard

// API Types (from backend)
export interface TokenPrice {
  id: string;
  token: 'USDC' | 'USDT' | 'SOL';
  tokenMint: string;
  tokenDecimals: number;
  price: string; // Decimal string
}

export interface PaymentLink {
  id: string;
  name: string;
  description: string | null;
  url: string;
  redirectUrl: string | null;
  expiresAt: string | null;
  isRecurring: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  durationMonths: number | null;
  periodSeconds: number | null;
  createdAt: string;
  updatedAt: string;
  receiver: {
    id: string;
    name: string;
    walletAddress: string;
  };
  tokenPrices: TokenPrice[];
}

// UI Types
export interface CheckoutLink {
  id: string;
  name: string;
  amount: number; // For backwards compatibility (SOL)
  amountUSD: number; // For backwards compatibility (USD)
  amountUSDC: number; // Price in USDC (if available)
  amountUSDT: number; // Price in USDT (if available)
  status: 'active' | 'inactive';
  url: string;
  isRecurring: boolean;
  redirectUrl: string | null;
  description: string | null;
  createdAt: string;
  totalPayments: number;
  conversions: number;
  views: number;
  tokenPrices: TokenPrice[];
  // Optional fields for details page
  expiresAt?: string | null;
  durationMonths?: number | null;
  periodSeconds?: number | null;
  receiver?: {
    id: string;
    name: string;
    walletAddress: string;
  };
}

export interface LinkStats {
  totalActive: number;
  totalCreated: number;
  averageConversion: number;
  totalRevenue: number;
  totalRevenueUSD: number;
}

export type LinkStatus = 'active' | 'inactive';

export interface LinkFilters {
  statuses?: LinkStatus[];
  isRecurring?: boolean | 'all';
  search?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  datePreset?: 'last-7-days' | 'last-30-days' | 'last-90-days' | 'custom';
}

// API Request Types
export interface CreateLinkRequest {
  name: string;
  description?: string;
  redirectUrl?: string;
  expiresAt?: string;
  isRecurring: boolean;
  durationMonths?: number;
  periodSeconds?: number;
  tokenPrices: Array<{
    token: 'USDC' | 'USDT' | 'SOL';
    price: number;
  }>;
}

export interface UpdateLinkRequest {
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  redirectUrl?: string;
  expiresAt?: string;
  tokenPrices?: Array<{
    token: 'USDC' | 'USDT' | 'SOL';
    price: number;
  }>;
}

// API Query Params
export interface LinkFiltersParams {
  page?: number;
  limit?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'all';
  isRecurring?: 'true' | 'false' | 'all';
  search?: string;
  datePreset?: 'last-7-days' | 'last-30-days' | 'last-90-days' | 'custom';
}

// Component Props
export interface LinkTableProps {
  links: CheckoutLink[];
  loading?: boolean;
  onRowClick?: (id: string) => void;
}
