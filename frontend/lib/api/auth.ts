const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Auth method constants
export const AUTH_METHOD = {
  EMAIL_PASSWORD: 'EMAIL_PASSWORD',
  SOLANA_WALLET: 'SOLANA_WALLET',
} as const;

export type AuthMethodType = (typeof AUTH_METHOD)[keyof typeof AUTH_METHOD];

// API response types
export interface User {
  id: string;
  name: string;
  email: string;
  authMethod: AuthMethodType;
  walletAddress: string;
  tokenAccountUSDT: string;
  tokenAccountUSDC: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface MeResponse {
  user: User;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any;
}

// Helper class for API errors
class AuthApiError extends Error {
  constructor(
    public statusCode: number,
    public error: string,
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public details?: any
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

// API functions
export const authApi = {
  async signup(data: {
    name: string;
    email: string;
    password: string;
    walletAddress: string;
    tokenAccountUSDT: string;
    tokenAccountUSDC: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        authMethod: AUTH_METHOD.EMAIL_PASSWORD,
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new AuthApiError(
        json.statusCode,
        json.error,
        json.message,
        json.details
      );
    }

    return json;
  },

  async signin(data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        authMethod: AUTH_METHOD.EMAIL_PASSWORD,
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new AuthApiError(
        json.statusCode,
        json.error,
        json.message,
        json.details
      );
    }

    return json;
  },

  async getMe(token: string): Promise<MeResponse> {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const json = await response.json();

    if (!response.ok) {
      throw new AuthApiError(
        json.statusCode,
        json.error,
        json.message
      );
    }

    return json;
  },
};
