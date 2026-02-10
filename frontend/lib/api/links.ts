const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// API response types
export interface TokenPrice {
  id: string;
  token: 'USDC' | 'USDT' | 'SOL';
  tokenMint: string;
  tokenDecimals: number;
  price: string; // Decimal string from backend
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

export interface CheckoutLinkResponse {
  id: string;
  name: string;
  amountUSDC: number;
  amountUSDT: number;
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
  // Optional fields for details
  expiresAt?: string | null;
  durationMonths?: number | null;
  periodSeconds?: number | null;
  receiver?: {
    id: string;
    name: string;
    walletAddress: string;
  };
}

export interface LinkListResponse {
  links: CheckoutLinkResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    totalActive: number;
    totalCreated: number;
    averageConversion: number;
    totalRevenue: number;
    totalRevenueUSD: number;
  };
}

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

export interface LinkFiltersParams {
  page?: number;
  limit?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'all';
  isRecurring?: 'true' | 'false' | 'all';
  search?: string;
  datePreset?: 'last-7-days' | 'last-30-days' | 'last-90-days' | 'custom';
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any;
}

// Helper class for API errors
class LinkApiError extends Error {
  constructor(
    public statusCode: number,
    public error: string,
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public details?: any
  ) {
    super(message);
    this.name = 'LinkApiError';
  }
}

// Get Authorization header with token
function getAuthHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// API functions
export const linksApi = {
  /**
   * Create a new payment link
   */
  async create(
    token: string,
    data: CreateLinkRequest
  ): Promise<{ link: PaymentLink }> {
    const response = await fetch(`${API_URL}/api/links/`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new LinkApiError(
        json.statusCode,
        json.error,
        json.message,
        json.details
      );
    }

    return json;
  },

  /**
   * Get all payment links with filters
   */
  async getAll(
    token: string,
    filters?: LinkFiltersParams
  ): Promise<LinkListResponse> {
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `${API_URL}/api/links/?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new LinkApiError(json.statusCode, json.error, json.message);
    }

    return json;
  },

  /**
   * Get a single payment link by ID
   */
  async getById(
    token: string,
    id: string
  ): Promise<{ link: CheckoutLinkResponse }> {
    const response = await fetch(`${API_URL}/api/links/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new LinkApiError(json.statusCode, json.error, json.message);
    }

    return json;
  },

  /**
   * Get a payment link by ID (public access - no authentication required)
   */
  async getByIdPublic(id: string): Promise<{ link: CheckoutLinkResponse }> {
    const response = await fetch(`${API_URL}/api/links/public/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const json = await response.json();

    if (!response.ok) {
      throw new LinkApiError(json.statusCode, json.error, json.message);
    }

    return json;
  },

  /**
   * Update a payment link
   */
  async update(
    token: string,
    id: string,
    data: UpdateLinkRequest
  ): Promise<{ link: CheckoutLinkResponse }> {
    const response = await fetch(`${API_URL}/api/links/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new LinkApiError(
        json.statusCode,
        json.error,
        json.message,
        json.details
      );
    }

    return json;
  },
};
