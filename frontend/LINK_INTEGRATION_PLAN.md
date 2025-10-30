# Payment Links Integration Plan

## Overview

Este documento descreve os endpoints de **Payment Links** (Links de Pagamento) criados no backend e como integrá-los ao frontend do PattPay.

---

## Backend Endpoints Disponíveis

Todos os endpoints estão sob a rota base `/api/links` e **requerem autenticação** (Bearer Token).

### 1. Criar Payment Link
**Endpoint:** `POST /api/links/`

**Descrição:** Cria um link de pagamento único ou recorrente com múltiplas opções de tokens.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```typescript
{
  name: string;              // Nome do link (obrigatório)
  description?: string;      // Descrição opcional
  redirectUrl?: string;      // URL de redirecionamento após pagamento
  expiresAt?: string;        // Data de expiração (ISO 8601)
  isRecurring: boolean;      // true = subscription, false = one-time
  durationMonths?: number;   // Duração da subscription em meses (obrigatório se isRecurring=true)
  periodSeconds?: number;    // Período de cobrança em segundos (obrigatório se isRecurring=true)
  tokenPrices: Array<{       // Lista de tokens aceitos (min: 1, max: 10)
    token: 'USDC' | 'USDT' | 'SOL';
    price: number;           // Preço no token especificado (> 0)
  }>;
}
```

**Response (201):**
```typescript
{
  link: {
    id: string;
    name: string;
    description: string | null;
    url: string;                    // URL completa: {FRONTEND_URL}/payment/{id}
    redirectUrl: string | null;
    expiresAt: string | null;       // ISO 8601
    isRecurring: boolean;
    status: 'ACTIVE' | 'INACTIVE';
    durationMonths: number | null;
    periodSeconds: number | null;
    createdAt: string;              // ISO 8601
    updatedAt: string;              // ISO 8601
    receiver: {
      id: string;
      name: string;
      walletAddress: string;
    };
    tokenPrices: Array<{
      id: string;
      token: string;
      tokenMint: string;            // Mint address do token
      tokenDecimals: number;
      price: string;                // Decimal string
    }>;
  }
}
```

**Exemplo de Uso:**

```typescript
// One-time payment
POST /api/links/
{
  "name": "E-book Purchase",
  "description": "Complete Guide to Solana Development",
  "isRecurring": false,
  "tokenPrices": [
    { "token": "USDC", "price": 29.99 },
    { "token": "SOL", "price": 0.15 }
  ]
}

// Recurring subscription
POST /api/links/
{
  "name": "Premium Membership",
  "description": "Unlimited access to all features",
  "isRecurring": true,
  "durationMonths": 12,
  "periodSeconds": 2592000,  // 30 dias
  "redirectUrl": "https://myapp.com/welcome",
  "tokenPrices": [
    { "token": "USDC", "price": 10 }
  ]
}
```

---

### 2. Listar Payment Links
**Endpoint:** `GET /api/links/`

**Descrição:** Lista todos os payment links do usuário autenticado com paginação e filtros.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  page?: number;          // Número da página (default: 1, min: 1)
  limit?: number;         // Items por página (default: 10, min: 1, max: 100)
  status?: 'ACTIVE' | 'INACTIVE' | 'all';  // Filtro por status (default: 'all')
  isRecurring?: string;   // 'true', 'false', ou 'all'
  search?: string;        // Busca por nome
  datePreset?: 'last-7-days' | 'last-30-days' | 'last-90-days' | 'custom';
}
```

**Response (200):**
```typescript
{
  links: Array<{
    id: string;
    name: string;
    amountUSDC: number;          // Preço em USDC (se disponível)
    amountUSDT: number;          // Preço em USDT (se disponível)
    status: 'active' | 'inactive';
    url: string;
    isRecurring: boolean;
    redirectUrl: string | null;
    description: string | null;
    createdAt: string;
    totalPayments: number;       // Total de pagamentos recebidos
    conversions: number;         // Número de conversões
    views: number;               // Número de visualizações
    tokenPrices: Array<{
      id: string;
      token: string;
      tokenMint: string;
      tokenDecimals: number;
      price: string;
    }>;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;               // Total de items
    totalPages: number;
  };
  stats: {
    totalActive: number;         // Total de links ativos
    totalCreated: number;        // Total de links criados
    averageConversion: number;   // Taxa de conversão média (%)
    totalRevenue: number;        // Receita total
    totalRevenueUSD: number;     // Receita total em USD
  };
}
```

**Exemplo de Uso:**
```
GET /api/links/?page=1&limit=10&status=ACTIVE&isRecurring=false
```

---

### 3. Obter Payment Link por ID
**Endpoint:** `GET /api/links/:id`

**Descrição:** Retorna detalhes completos de um payment link específico.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
```typescript
{
  id: string;  // UUID do payment link
}
```

**Response (200):**
```typescript
{
  link: {
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
    expiresAt: string | null;
    durationMonths: number | null;
    periodSeconds: number | null;
    tokenPrices: Array<{
      id: string;
      token: string;
      tokenMint: string;
      tokenDecimals: number;
      price: string;
    }>;
    receiver: {
      id: string;
      name: string;
      walletAddress: string;
    };
  }
}
```

**Response (404):**
```typescript
{
  statusCode: 404;
  error: string;
  message: string;
}
```

**Exemplo de Uso:**
```
GET /api/links/abc-123-def-456
```

---

### 4. Atualizar Payment Link
**Endpoint:** `PUT /api/links/:id`

**Descrição:** Atualiza um payment link existente (nome, descrição, status, redirect URL, expiração e preços de tokens).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
```typescript
{
  id: string;  // UUID do payment link
}
```

**Request Body:**
```typescript
{
  name?: string;                    // Nome atualizado
  description?: string;             // Descrição atualizada
  status?: 'ACTIVE' | 'INACTIVE';   // Status atualizado
  redirectUrl?: string;             // URL de redirecionamento
  expiresAt?: string;               // Data de expiração (ISO 8601)
  tokenPrices?: Array<{             // Atualiza lista de tokens aceitos
    token: 'USDC' | 'USDT' | 'SOL';
    price: number;
  }>;
}
```

**Response (200):**
```typescript
{
  link: {
    id: string;
    name: string;
    status: string;
    url: string;
    createdAt: string;
    // ... todos os campos detalhados (mesmo formato do GET)
  }
}
```

**Response (404):**
```typescript
{
  statusCode: 404;
  error: string;
  message: string;
}
```

**Exemplo de Uso:**
```typescript
PUT /api/links/abc-123-def-456
{
  "name": "Updated Name",
  "status": "INACTIVE",
  "tokenPrices": [
    { "token": "USDC", "price": 19.99 }
  ]
}
```

---

## Frontend Integration

### 1. Estrutura de Arquivos

Seguindo o padrão estabelecido em `lib/api/auth.ts` e `lib/hooks/useAuth.ts`, devemos criar:

```
frontend/
├── lib/
│   ├── api/
│   │   ├── auth.ts           (existente)
│   │   └── links.ts          (novo - funções de API puras)
│   ├── hooks/
│   │   ├── useAuth.ts        (existente)
│   │   ├── useLinks.ts       (novo - hook principal)
│   │   ├── useLinkMutations.ts   (novo - mutations)
│   │   └── useLinkQueries.ts     (novo - queries)
│   └── utils/
│       └── token.ts          (existente)
├── types/
│   └── link.ts               (existente - atualizar)
```

---

### 2. Atualizar Types

**Arquivo:** `types/link.ts`

```typescript
// types/link.ts

// API Response Types (Backend)
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

export interface CheckoutLink {
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
  // Campos opcionais para detalhes
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

export interface LinkListResponse {
  links: CheckoutLink[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: LinkStats;
}

// Request Types
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

export interface LinkFilters {
  page?: number;
  limit?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'all';
  isRecurring?: 'true' | 'false' | 'all';
  search?: string;
  datePreset?: 'last-7-days' | 'last-30-days' | 'last-90-days' | 'custom';
}

// Error Types
export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  details?: unknown;
}
```

---

### 3. Criar API Layer

**Arquivo:** `lib/api/links.ts`

```typescript
// lib/api/links.ts

import {
  CreateLinkRequest,
  UpdateLinkRequest,
  LinkFilters,
  PaymentLink,
  CheckoutLink,
  LinkListResponse,
  ApiError,
} from '@/types/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper class for API errors
class LinkApiError extends Error {
  constructor(
    public statusCode: number,
    public error: string,
    message: string,
    public details?: unknown
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
    filters?: LinkFilters
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
  ): Promise<{ link: CheckoutLink }> {
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
   * Update a payment link
   */
  async update(
    token: string,
    id: string,
    data: UpdateLinkRequest
  ): Promise<{ link: CheckoutLink }> {
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
```

---

### 4. Criar Query Hooks (TanStack Query)

**Arquivo:** `lib/hooks/useLinkQueries.ts`

```typescript
// lib/hooks/useLinkQueries.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { linksApi } from '../api/links';
import { TokenStorage } from '../utils/token';
import type { LinkFilters } from '@/types/link';

/**
 * Query hook to fetch all payment links
 */
export function useLinks(filters?: LinkFilters) {
  const token = TokenStorage.get();

  return useQuery({
    queryKey: ['links', filters],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return linksApi.getAll(token, filters);
    },
    enabled: !!token,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Query hook to fetch a single payment link by ID
 */
export function useLink(id: string) {
  const token = TokenStorage.get();

  return useQuery({
    queryKey: ['link', id],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return linksApi.getById(token, id);
    },
    enabled: !!token && !!id,
    staleTime: 1000 * 60, // 1 minute
  });
}
```

---

**Arquivo:** `lib/hooks/useLinkMutations.ts`

```typescript
// lib/hooks/useLinkMutations.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { linksApi } from '../api/links';
import { TokenStorage } from '../utils/token';
import type { CreateLinkRequest, UpdateLinkRequest } from '@/types/link';

/**
 * Mutation hook to create a payment link
 */
export function useCreateLink() {
  const queryClient = useQueryClient();
  const token = TokenStorage.get();

  return useMutation({
    mutationFn: (data: CreateLinkRequest) => {
      if (!token) throw new Error('No authentication token');
      return linksApi.create(token, data);
    },
    onSuccess: () => {
      // Invalidate links list to refetch
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });
}

/**
 * Mutation hook to update a payment link
 */
export function useUpdateLink() {
  const queryClient = useQueryClient();
  const token = TokenStorage.get();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLinkRequest }) => {
      if (!token) throw new Error('No authentication token');
      return linksApi.update(token, id, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific link and list
      queryClient.invalidateQueries({ queryKey: ['link', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });
}
```

---

**Arquivo:** `lib/hooks/useLinks.ts` (Main Hook)

```typescript
// lib/hooks/useLinks.ts
'use client';

import { useLinks as useLinksQuery, useLink } from './useLinkQueries';
import { useCreateLink, useUpdateLink } from './useLinkMutations';
import type { LinkFilters } from '@/types/link';

/**
 * Main links hook
 * Combines TanStack Query hooks for payment links management
 */
export function useLinks(filters?: LinkFilters) {
  const { data, isLoading, error, refetch } = useLinksQuery(filters);
  const createMutation = useCreateLink();
  const updateMutation = useUpdateLink();

  return {
    // Data
    links: data?.links ?? [],
    pagination: data?.pagination,
    stats: data?.stats,

    // State
    isLoading,
    error,

    // Actions
    refetch,
    createLink: createMutation.mutate,
    createLinkAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    updateLink: updateMutation.mutate,
    updateLinkAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
}

/**
 * Hook for fetching a single link
 */
export function useLinkDetails(id: string) {
  const { data, isLoading, error, refetch } = useLink(id);
  const updateMutation = useUpdateLink();

  return {
    // Data
    link: data?.link,

    // State
    isLoading,
    error,

    // Actions
    refetch,
    updateLink: (data: Parameters<typeof updateMutation.mutate>[0]['data']) =>
      updateMutation.mutate({ id, data }),
    updateLinkAsync: (data: Parameters<typeof updateMutation.mutateAsync>[0]['data']) =>
      updateMutation.mutateAsync({ id, data }),
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
}
```

---

### 5. Exemplo de Uso em Componentes

#### Listar Links (Dashboard)

```typescript
// app/dashboard/links/page.tsx
'use client';

import { useLinks } from '@/lib/hooks/useLinks';
import { useState } from 'react';
import type { LinkFilters } from '@/types/link';

export default function LinksPage() {
  const [filters, setFilters] = useState<LinkFilters>({
    page: 1,
    limit: 10,
    status: 'all',
  });

  const { links, pagination, stats, isLoading, error } = useLinks(filters);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Payment Links</h1>

      {/* Stats */}
      <div className="stats">
        <div>Total Active: {stats?.totalActive}</div>
        <div>Total Revenue: ${stats?.totalRevenueUSD.toFixed(2)}</div>
      </div>

      {/* Filters */}
      <select
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
      >
        <option value="all">All</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
      </select>

      {/* Links Table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Type</th>
            <th>URL</th>
            <th>Payments</th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr key={link.id}>
              <td>{link.name}</td>
              <td>{link.status}</td>
              <td>{link.isRecurring ? 'Recurring' : 'One-time'}</td>
              <td><a href={link.url}>{link.url}</a></td>
              <td>{link.totalPayments}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div>
        Page {pagination?.page} of {pagination?.totalPages}
      </div>
    </div>
  );
}
```

---

#### Criar Link (Form)

```typescript
// components/create-link-form.tsx
'use client';

import { useLinks } from '@/lib/hooks/useLinks';
import { useState } from 'react';
import type { CreateLinkRequest } from '@/types/link';

export function CreateLinkForm() {
  const { createLink, isCreating, createError } = useLinks();
  const [formData, setFormData] = useState<CreateLinkRequest>({
    name: '',
    isRecurring: false,
    tokenPrices: [{ token: 'USDC', price: 0 }],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLink(formData, {
      onSuccess: () => {
        alert('Link created successfully!');
        // Reset form or redirect
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Link Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <label>
        <input
          type="checkbox"
          checked={formData.isRecurring}
          onChange={(e) =>
            setFormData({ ...formData, isRecurring: e.target.checked })
          }
        />
        Recurring Payment
      </label>

      {formData.isRecurring && (
        <>
          <input
            type="number"
            placeholder="Duration (months)"
            onChange={(e) =>
              setFormData({ ...formData, durationMonths: Number(e.target.value) })
            }
          />
          <input
            type="number"
            placeholder="Period (seconds)"
            onChange={(e) =>
              setFormData({ ...formData, periodSeconds: Number(e.target.value) })
            }
          />
        </>
      )}

      <h3>Token Prices</h3>
      {formData.tokenPrices.map((tp, idx) => (
        <div key={idx}>
          <select
            value={tp.token}
            onChange={(e) => {
              const newPrices = [...formData.tokenPrices];
              newPrices[idx].token = e.target.value as any;
              setFormData({ ...formData, tokenPrices: newPrices });
            }}
          >
            <option value="USDC">USDC</option>
            <option value="USDT">USDT</option>
            <option value="SOL">SOL</option>
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Price"
            value={tp.price}
            onChange={(e) => {
              const newPrices = [...formData.tokenPrices];
              newPrices[idx].price = Number(e.target.value);
              setFormData({ ...formData, tokenPrices: newPrices });
            }}
          />
        </div>
      ))}

      {createError && <div className="error">{createError.message}</div>}

      <button type="submit" disabled={isCreating}>
        {isCreating ? 'Creating...' : 'Create Link'}
      </button>
    </form>
  );
}
```

---

#### Ver Detalhes do Link

```typescript
// app/dashboard/links/[id]/page.tsx
'use client';

import { useLinkDetails } from '@/lib/hooks/useLinks';
import { useParams } from 'next/navigation';

export default function LinkDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const { link, isLoading, error, updateLink, isUpdating } = useLinkDetails(id);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!link) return <div>Link not found</div>;

  const toggleStatus = () => {
    updateLink({
      status: link.status === 'active' ? 'INACTIVE' : 'ACTIVE',
    });
  };

  return (
    <div>
      <h1>{link.name}</h1>
      <p>Status: {link.status}</p>
      <p>Type: {link.isRecurring ? 'Recurring' : 'One-time'}</p>
      <p>URL: <a href={link.url}>{link.url}</a></p>

      {link.receiver && (
        <div>
          <h2>Receiver</h2>
          <p>Name: {link.receiver.name}</p>
          <p>Wallet: {link.receiver.walletAddress}</p>
        </div>
      )}

      <h2>Token Prices</h2>
      <ul>
        {link.tokenPrices.map((tp) => (
          <li key={tp.id}>
            {tp.token}: {tp.price}
          </li>
        ))}
      </ul>

      <h2>Stats</h2>
      <p>Total Payments: {link.totalPayments}</p>
      <p>Conversions: {link.conversions}</p>
      <p>Views: {link.views}</p>

      <button onClick={toggleStatus} disabled={isUpdating}>
        {isUpdating
          ? 'Updating...'
          : link.status === 'active'
          ? 'Deactivate'
          : 'Activate'}
      </button>
    </div>
  );
}
```

---

## Notas Importantes

### 1. Autenticação
- **Todos os endpoints requerem um Bearer Token** no header `Authorization`
- O token deve ser obtido através do login (`/api/auth/signin` ou `/api/auth/signup`)
- Use `TokenStorage.get()` para recuperar o token armazenado no localStorage

### 2. TanStack Query Best Practices
- **Mutations** (create, update): Use `useMutation` para operações POST/PUT/DELETE
- **Queries** (list, details): Use `useQuery` para operações GET
- **Cache invalidation**: Após mutations, invalide queries relacionadas com `queryClient.invalidateQueries()`
- **Optimistic updates**: Considere implementar para melhor UX

### 3. Tipos de Payment Links
- **One-time**: `isRecurring: false`, sem `durationMonths` e `periodSeconds`
- **Recurring**: `isRecurring: true`, com `durationMonths` e `periodSeconds` obrigatórios

### 4. Valores Comuns de `periodSeconds`
- Weekly: `604800` (7 dias)
- Bi-weekly: `1209600` (14 dias)
- Monthly: `2592000` (30 dias)
- Quarterly: `7776000` (90 dias)

### 5. Tokens Suportados
- **USDC**: USD Coin
- **USDT**: Tether USD
- **SOL**: Solana

Cada token tem seu próprio `tokenMint` e `tokenDecimals` configurados automaticamente pelo backend.

---

## Próximos Passos

1. ✅ Criar `lib/api/links.ts` (API layer)
2. ✅ Criar `lib/hooks/useLinkQueries.ts` (TanStack Query queries)
3. ✅ Criar `lib/hooks/useLinkMutations.ts` (TanStack Query mutations)
4. ✅ Criar `lib/hooks/useLinks.ts` (Main hook)
5. ✅ Atualizar `types/link.ts` com tipos do backend
6. ⬜ Implementar página de listagem de links (`app/dashboard/links/page.tsx`)
7. ⬜ Implementar formulário de criação (`components/create-link-form.tsx`)
8. ⬜ Implementar página de detalhes do link (`app/dashboard/links/[id]/page.tsx`)
9. ⬜ Implementar formulário de edição (`components/edit-link-form.tsx`)
10. ⬜ Adicionar validação de formulários com Zod
11. ⬜ Implementar tratamento de erros e loading states
12. ⬜ Adicionar testes unitários e de integração

---

## Referências

- **Backend Docs**: `/home/yuri/pattpay/backend/PAYMENT_LINKS_EXPLAINED.md`
- **Backend Routes**: `/home/yuri/pattpay/backend/src/routes/plan.routes.ts`
- **Backend Controller**: `/home/yuri/pattpay/backend/src/controllers/plan.controller.ts`
- **Frontend CLAUDE.md**: `/home/yuri/pattpay/frontend/CLAUDE.md`
- **Auth Implementation**: `/home/yuri/pattpay/frontend/lib/api/auth.ts`
