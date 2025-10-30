# Payers & Subscriptions Integration Plan

## 📋 Visão Geral

Este documento detalha o plano de integração dos endpoints de **Payers** e **Subscriptions** do backend no frontend, seguindo os padrões estabelecidos no projeto (TanStack Query + localStorage).

---

## 🔗 Endpoints do Backend

### 1. Payers API (`/api/payers`)

#### 1.1 POST `/api/payers` - Criar Payer

**Descrição**: Cria um novo payer (cliente/assinante) com wallet Solana.

**Autenticação**: Bearer token (JWT)

**Request Body**:
```typescript
{
  walletAddress: string;  // Endereço Solana (obrigatório, único)
  name: string;           // Nome completo (obrigatório)
  email?: string;         // Email para notificações (opcional)
}
```

**Response 201**:
```typescript
{
  id: string;              // UUID
  walletAddress: string;
  name: string;
  email: string | null;
  createdAt: string;       // ISO timestamp
  updatedAt: string;
}
```

**Errors**:
- `409`: Wallet address já existe
- `400`: Validação falhou

---

#### 1.2 GET `/api/payers` - Listar Payers

**Descrição**: Lista todos os payers com paginação e busca. Inclui contagem de subscriptions.

**Autenticação**: Bearer token (JWT)

**Query Parameters**:
```typescript
{
  page?: number;          // Página atual (default: 1)
  limit?: number;         // Items por página (default: 10, max: 100)
  search?: string;        // Busca por nome, email ou wallet (case-insensitive)
}
```

**Response 200**:
```typescript
{
  data: Array<{
    id: string;
    walletAddress: string;
    name: string;
    email: string | null;
    createdAt: string;
    updatedAt: string;
    subscriptions: Array<Subscription>;  // Array de subscriptions ativas
  }>;
  meta: {
    page: number;          // Página atual
    limit: number;         // Items por página
    total: number;         // Total de payers
    totalPages: number;    // Total de páginas
  };
}
```

---

#### 1.3 GET `/api/payers/:id` - Buscar Payer por ID

**Descrição**: Retorna detalhes completos de um payer incluindo todas suas subscriptions.

**Autenticação**: Bearer token (JWT)

**URL Params**:
- `id` (string, UUID): ID do payer

**Response 200**:
```typescript
{
  id: string;
  walletAddress: string;
  name: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  subscriptions: Array<{
    id: string;
    planId: string;
    status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
    tokenMint: string;
    nextDueAt: string;
    lastPaidAt: string;
    // ... outros campos
  }>;
}
```

**Errors**:
- `404`: Payer não encontrado

---

#### 1.4 PUT `/api/payers/:id` - Atualizar Payer

**Descrição**: Atualiza informações do payer. Todos os campos são opcionais.

**Autenticação**: Bearer token (JWT)

**URL Params**:
- `id` (string, UUID): ID do payer

**Request Body** (todos opcionais):
```typescript
{
  walletAddress?: string;  // Novo wallet address (deve ser único)
  name?: string;
  email?: string;
}
```

**Response 200**:
```typescript
{
  id: string;
  walletAddress: string;
  name: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;        // Reflete o horário da atualização
}
```

**Errors**:
- `404`: Payer não encontrado
- `400`: Wallet address duplicado ou validação falhou

---

#### 1.5 DELETE `/api/payers/:id` - Deletar Payer

**Descrição**: Deleta permanentemente um payer e todas suas subscriptions (CASCADE delete).

**⚠️ ATENÇÃO**: Esta ação é irreversível e remove todas as subscriptions associadas!

**Autenticação**: Bearer token (JWT)

**URL Params**:
- `id` (string, UUID): ID do payer

**Response 204**: No content (sucesso)

**Errors**:
- `404`: Payer não encontrado

---

### 2. Subscriptions API (`/api/subscriptions`)

#### 2.1 POST `/api/subscriptions` - Criar Subscription

**Descrição**: Cria uma nova subscription **APÓS** aprovação on-chain do delegate.

**⚠️ IMPORTANTE**: Esta chamada só deve ser feita APÓS:
1. Payer criado via `POST /api/payers`
2. Usuário aprovou delegation via instrução `approve_delegate` no contrato Solana
3. Transaction foi confirmada e você tem a signature

**Autenticação**: NÃO requer token (chamada é feita pelo usuário/payer)

**Request Body**:
```typescript
{
  planId: string;                  // UUID do plano (de GET /api/plans)
  payerId: string;                 // UUID do payer (criado previamente)
  tokenMint: string;               // Endereço do token SPL (USDC/USDT/SOL)
  delegateTxSignature: string;     // Signature da tx approve_delegate
  delegateAuthority: string;       // Endereço PDA com autoridade de delegate
  delegateApprovedAt: string;      // ISO timestamp da aprovação on-chain
}
```

**Response 201**:
```typescript
{
  id: string;                      // Subscription UUID
  planId: string;
  payerId: string;
  tokenMint: string;
  status: 'ACTIVE';                // Sempre ACTIVE após criação
  nextDueAt: string;               // Data da próxima cobrança
  lastPaidAt: string;              // Data da última cobrança
  delegateAuthority: string;       // PDA para o relayer usar
  delegateTxSignature: string;
  delegateApprovedAt: string;
  tokenDecimals: number;
  totalApprovedAmount: string;     // Total aprovado (plan.price * durationMonths)
  createdAt: string;
  updatedAt: string;
}
```

**Errors**:
- `404`: Plan não encontrado, payer não encontrado, ou plan inativo
- `400`: Token não suportado pelo plan ou validação falhou

**Fluxo Frontend**:
```typescript
// 1. Criar payer (se não existir)
const payer = await payersApi.create(token, { walletAddress, name, email });

// 2. Chamar contrato approve_delegate
const delegateTx = await program.methods
  .approveDelegate(subscriptionId, approvedAmount)
  .accounts({ payer: wallet.publicKey, receiver: receiverWallet, /* ... */ })
  .rpc();

// 3. Aguardar confirmação
await connection.confirmTransaction(delegateTx);

// 4. Criar subscription no backend
const subscription = await subscriptionsApi.create({
  planId,
  payerId: payer.id,
  tokenMint,
  delegateTxSignature: delegateTx,
  delegateAuthority: pdaAddress.toString(),
  delegateApprovedAt: new Date().toISOString(),
});
```

---

#### 2.2 GET `/api/subscriptions` - Listar Subscriptions

**Descrição**: Lista todas as subscriptions do receiver autenticado com filtros avançados.

**Autenticação**: Bearer token (JWT) - apenas subscriptions dos plans do receiver

**Query Parameters**:
```typescript
{
  page?: number;           // Default: 1
  limit?: number;          // Default: 10, max: 100
  status?: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'all';  // Default: 'all'
  planId?: string;         // Filtrar por plan específico
  tokenMint?: string;      // Filtrar por token (ex: apenas USDC)
  dateFrom?: string;       // ISO date - subscriptions criadas a partir de
  dateTo?: string;         // ISO date - subscriptions criadas até
  search?: string;         // Busca por payer name, wallet, ou plan name
}
```

**Response 200**:
```typescript
{
  data: Array<{
    id: string;
    planId: string;
    payerId: string;
    tokenMint: string;
    status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
    nextDueAt: string;
    lastPaidAt: string;
    delegateAuthority: string;
    delegateTxSignature: string;
    delegateApprovedAt: string;
    tokenDecimals: number;
    totalApprovedAmount: string;
    createdAt: string;
    updatedAt: string;
    // Relations
    payer: {
      id: string;
      name: string;
      walletAddress: string;
      email: string | null;
    };
    plan: {
      id: string;
      name: string;
      description: string;
      durationMonths: number;
      periodSeconds: number;
      planTokens: Array<{
        token: string;
        tokenMint: string;
        price: string;
        tokenDecimals: number;
      }>;
    };
  }>;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

#### 2.3 GET `/api/subscriptions/:id` - Buscar Subscription por ID

**Descrição**: Retorna detalhes completos da subscription incluindo histórico de pagamentos (últimas 10 execuções).

**Autenticação**: Bearer token (JWT)

**URL Params**:
- `id` (string, UUID): ID da subscription

**Response 200**:
```typescript
{
  id: string;
  planId: string;
  payerId: string;
  tokenMint: string;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  nextDueAt: string;
  lastPaidAt: string;
  delegateAuthority: string;
  delegateTxSignature: string;
  delegateApprovedAt: string;
  tokenDecimals: number;
  totalApprovedAmount: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  payer: {
    id: string;
    name: string;
    walletAddress: string;
    email: string | null;
  };
  plan: {
    id: string;
    name: string;
    description: string;
    durationMonths: number;
    periodSeconds: number;
    planTokens: Array</* ... */>;
    receiver: {
      id: string;
      name: string;
      walletAddress: string;
    };
  };
  paymentExecutions: Array<{
    id: string;
    subscriptionId: string;
    status: 'SUCCESS' | 'FAILED';
    amount: string;
    txSignature: string | null;
    errorMessage: string | null;
    executedAt: string;
  }>;  // Últimas 10 execuções, ordenadas por executedAt desc
}
```

**Errors**:
- `404`: Subscription não encontrada ou não pertence ao receiver

---

#### 2.4 DELETE `/api/subscriptions/:id` - Cancelar Subscription

**Descrição**: Cancela uma subscription ativa **APÓS** revogar o delegate on-chain.

**⚠️ IMPORTANTE**: Esta chamada só deve ser feita APÓS:
1. Usuário revogou delegation via instrução `revoke_delegate` no contrato
2. Transaction foi confirmada e você tem a signature

**Autenticação**: Bearer token (JWT)

**URL Params**:
- `id` (string, UUID): ID da subscription

**Request Body**:
```typescript
{
  revokeTxSignature: string;  // Signature da tx revoke_delegate (prova on-chain)
}
```

**Response 200**:
```typescript
{
  id: string;
  status: 'CANCELLED';  // Status agora é CANCELLED
  // ... outros campos
  payer: { /* ... */ };
  plan: { /* ... */ };
}
```

**Errors**:
- `404`: Subscription não encontrada ou não pertence ao receiver/payer
- `400`: Subscription já cancelada ou validação falhou

**Fluxo Frontend**:
```typescript
// 1. Chamar contrato revoke_delegate
const revokeTx = await program.methods
  .revokeDelegate(subscriptionId)
  .accounts({ payer: wallet.publicKey, /* ... */ })
  .rpc();

// 2. Aguardar confirmação
await connection.confirmTransaction(revokeTx);

// 3. Cancelar subscription no backend
await subscriptionsApi.cancel(token, subscriptionId, {
  revokeTxSignature: revokeTx,
});
```

---

## 🏗️ Arquitetura Frontend

### Estrutura de Diretórios

```
frontend/
├── lib/
│   ├── api/
│   │   ├── payers.ts              # API layer para payers
│   │   └── subscriptions.ts       # API layer para subscriptions
│   ├── hooks/
│   │   ├── usePayerQueries.ts     # TanStack Query para GET payers
│   │   ├── usePayerMutations.ts   # TanStack Mutations para payers CUD
│   │   ├── useSubscriptionQueries.ts   # TanStack Query para GET subscriptions
│   │   ├── useSubscriptionMutations.ts # TanStack Mutations para subscriptions
│   │   ├── usePayers.ts           # Hook principal (orquestrador)
│   │   └── useSubscriptions.ts    # Hook principal (orquestrador)
│   └── utils/
│       └── payer-transform.ts     # Transformações se necessário
├── types/
│   ├── payer.ts                   # TypeScript types para Payers
│   └── subscription.ts            # TypeScript types para Subscriptions
└── app/
    └── dashboard/
        ├── payers/
        │   ├── page.tsx                    # Lista de payers
        │   ├── [id]/
        │   │   └── page.tsx                # Detalhes do payer
        │   └── _components/
        │       ├── PayerTable.tsx
        │       ├── CreatePayerModal.tsx
        │       ├── EditPayerModal.tsx
        │       └── DeletePayerDialog.tsx
        └── subscriptions/
            ├── page.tsx                    # Lista de subscriptions
            ├── [id]/
            │   └── page.tsx                # Detalhes da subscription
            └── _components/
                ├── SubscriptionTable.tsx
                ├── SubscriptionFilters.tsx
                ├── PaymentHistoryCard.tsx
                └── CancelSubscriptionDialog.tsx
```

---

## 📦 Implementação

### 1. Types (TypeScript)

#### `types/payer.ts`

```typescript
// Backend response types
export interface PayerResponse {
  id: string;
  walletAddress: string;
  name: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  subscriptions?: SubscriptionResponse[];  // Quando incluído
}

export interface PayersListResponse {
  data: PayerResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request types
export interface CreatePayerRequest {
  walletAddress: string;
  name: string;
  email?: string;
}

export interface UpdatePayerRequest {
  walletAddress?: string;
  name?: string;
  email?: string;
}

// Filter types
export interface PayerFilters {
  page?: number;
  limit?: number;
  search?: string;
}
```

#### `types/subscription.ts`

```typescript
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
export type PaymentExecutionStatus = 'SUCCESS' | 'FAILED';

// Backend response types
export interface SubscriptionResponse {
  id: string;
  planId: string;
  payerId: string;
  tokenMint: string;
  status: SubscriptionStatus;
  nextDueAt: string;
  lastPaidAt: string;
  delegateAuthority: string;
  delegateTxSignature: string;
  delegateApprovedAt: string;
  tokenDecimals: number;
  totalApprovedAmount: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  payer?: {
    id: string;
    name: string;
    walletAddress: string;
    email: string | null;
  };
  plan?: {
    id: string;
    name: string;
    description: string;
    durationMonths: number;
    periodSeconds: number;
    planTokens: Array<{
      token: string;
      tokenMint: string;
      price: string;
      tokenDecimals: number;
    }>;
    receiver?: {
      id: string;
      name: string;
      walletAddress: string;
    };
  };
  paymentExecutions?: PaymentExecutionResponse[];
}

export interface PaymentExecutionResponse {
  id: string;
  subscriptionId: string;
  status: PaymentExecutionStatus;
  amount: string;
  txSignature: string | null;
  errorMessage: string | null;
  executedAt: string;
}

export interface SubscriptionsListResponse {
  data: SubscriptionResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request types
export interface CreateSubscriptionRequest {
  planId: string;
  payerId: string;
  tokenMint: string;
  delegateTxSignature: string;
  delegateAuthority: string;
  delegateApprovedAt: string;
}

export interface CancelSubscriptionRequest {
  revokeTxSignature: string;
}

// Filter types
export interface SubscriptionFilters {
  page?: number;
  limit?: number;
  status?: SubscriptionStatus | 'all';
  planId?: string;
  tokenMint?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}
```

---

### 2. API Layer

#### `lib/api/payers.ts`

```typescript
import { getAuthHeaders } from './auth';
import type {
  PayerResponse,
  PayersListResponse,
  CreatePayerRequest,
  UpdatePayerRequest,
  PayerFilters,
} from '@/types/payer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class PayerApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'PayerApiError';
  }
}

export const payersApi = {
  /**
   * Create a new payer
   */
  async create(token: string, data: CreatePayerRequest): Promise<PayerResponse> {
    const response = await fetch(`${API_URL}/api/payers`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new PayerApiError(
        response.status,
        error.message || 'Failed to create payer'
      );
    }

    return response.json();
  },

  /**
   * Get all payers with pagination and search
   */
  async getAll(token: string, filters?: PayerFilters): Promise<PayersListResponse> {
    const params = new URLSearchParams();
    if (filters?.page) params.set('page', filters.page.toString());
    if (filters?.limit) params.set('limit', filters.limit.toString());
    if (filters?.search) params.set('search', filters.search);

    const url = `${API_URL}/api/payers?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new PayerApiError(
        response.status,
        error.message || 'Failed to fetch payers'
      );
    }

    return response.json();
  },

  /**
   * Get payer by ID with subscriptions
   */
  async getById(token: string, id: string): Promise<PayerResponse> {
    const response = await fetch(`${API_URL}/api/payers/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new PayerApiError(
        response.status,
        error.message || 'Failed to fetch payer'
      );
    }

    return response.json();
  },

  /**
   * Update payer
   */
  async update(
    token: string,
    id: string,
    data: UpdatePayerRequest
  ): Promise<PayerResponse> {
    const response = await fetch(`${API_URL}/api/payers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new PayerApiError(
        response.status,
        error.message || 'Failed to update payer'
      );
    }

    return response.json();
  },

  /**
   * Delete payer (CASCADE deletes subscriptions)
   */
  async delete(token: string, id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/payers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new PayerApiError(
        response.status,
        error.message || 'Failed to delete payer'
      );
    }

    // 204 No Content - no response body
  },
};
```

#### `lib/api/subscriptions.ts`

```typescript
import { getAuthHeaders } from './auth';
import type {
  SubscriptionResponse,
  SubscriptionsListResponse,
  CreateSubscriptionRequest,
  CancelSubscriptionRequest,
  SubscriptionFilters,
} from '@/types/subscription';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class SubscriptionApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'SubscriptionApiError';
  }
}

export const subscriptionsApi = {
  /**
   * Create subscription (no auth required - called by payer)
   */
  async create(data: CreateSubscriptionRequest): Promise<SubscriptionResponse> {
    const response = await fetch(`${API_URL}/api/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new SubscriptionApiError(
        response.status,
        error.message || 'Failed to create subscription'
      );
    }

    return response.json();
  },

  /**
   * Get all subscriptions for authenticated receiver
   */
  async getAll(
    token: string,
    filters?: SubscriptionFilters
  ): Promise<SubscriptionsListResponse> {
    const params = new URLSearchParams();
    if (filters?.page) params.set('page', filters.page.toString());
    if (filters?.limit) params.set('limit', filters.limit.toString());
    if (filters?.status) params.set('status', filters.status);
    if (filters?.planId) params.set('planId', filters.planId);
    if (filters?.tokenMint) params.set('tokenMint', filters.tokenMint);
    if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom.toISOString());
    if (filters?.dateTo) params.set('dateTo', filters.dateTo.toISOString());
    if (filters?.search) params.set('search', filters.search);

    const url = `${API_URL}/api/subscriptions?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new SubscriptionApiError(
        response.status,
        error.message || 'Failed to fetch subscriptions'
      );
    }

    return response.json();
  },

  /**
   * Get subscription by ID with payment history
   */
  async getById(token: string, id: string): Promise<SubscriptionResponse> {
    const response = await fetch(`${API_URL}/api/subscriptions/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new SubscriptionApiError(
        response.status,
        error.message || 'Failed to fetch subscription'
      );
    }

    return response.json();
  },

  /**
   * Cancel subscription (requires auth)
   */
  async cancel(
    token: string,
    id: string,
    data: CancelSubscriptionRequest
  ): Promise<SubscriptionResponse> {
    const response = await fetch(`${API_URL}/api/subscriptions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new SubscriptionApiError(
        response.status,
        error.message || 'Failed to cancel subscription'
      );
    }

    return response.json();
  },
};
```

---

### 3. TanStack Query Hooks

#### `lib/hooks/usePayerQueries.ts`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { payersApi } from '../api/payers';
import { TokenStorage } from '../utils/token-storage';
import type { PayerFilters } from '@/types/payer';

/**
 * Query for fetching all payers
 */
export function usePayersQuery(filters?: PayerFilters) {
  const token = TokenStorage.getToken();

  return useQuery({
    queryKey: ['payers', filters],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return payersApi.getAll(token, filters);
    },
    enabled: !!token,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Query for fetching a single payer by ID
 */
export function usePayerQuery(id: string) {
  const token = TokenStorage.getToken();

  return useQuery({
    queryKey: ['payer', id],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return payersApi.getById(token, id);
    },
    enabled: !!token && !!id,
    staleTime: 60000, // 1 minute
  });
}
```

#### `lib/hooks/usePayerMutations.ts`

```typescript
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { payersApi } from '../api/payers';
import { TokenStorage } from '../utils/token-storage';
import { toast } from 'sonner';
import type { CreatePayerRequest, UpdatePayerRequest } from '@/types/payer';

/**
 * Mutation for creating a payer
 */
export function useCreatePayer() {
  const queryClient = useQueryClient();
  const token = TokenStorage.getToken();

  return useMutation({
    mutationFn: (data: CreatePayerRequest) => {
      if (!token) throw new Error('No authentication token');
      return payersApi.create(token, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payers'] });
      toast.success('Payer created!', {
        description: `${data.name} was added successfully.`,
      });
    },
    onError: (error: any) => {
      toast.error('Failed to create payer', {
        description: error.message || 'An unexpected error occurred',
      });
    },
  });
}

/**
 * Mutation for updating a payer
 */
export function useUpdatePayer() {
  const queryClient = useQueryClient();
  const token = TokenStorage.getToken();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePayerRequest }) => {
      if (!token) throw new Error('No authentication token');
      return payersApi.update(token, id, data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payer', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['payers'] });
      toast.success('Payer updated!', {
        description: `${data.name} was updated successfully.`,
      });
    },
    onError: (error: any) => {
      toast.error('Failed to update payer', {
        description: error.message || 'An unexpected error occurred',
      });
    },
  });
}

/**
 * Mutation for deleting a payer
 */
export function useDeletePayer() {
  const queryClient = useQueryClient();
  const token = TokenStorage.getToken();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error('No authentication token');
      return payersApi.delete(token, id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['payers'] });
      queryClient.removeQueries({ queryKey: ['payer', id] });
      toast.success('Payer deleted!', {
        description: 'Payer and all subscriptions were removed.',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to delete payer', {
        description: error.message || 'An unexpected error occurred',
      });
    },
  });
}
```

#### `lib/hooks/useSubscriptionQueries.ts`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi } from '../api/subscriptions';
import { TokenStorage } from '../utils/token-storage';
import type { SubscriptionFilters } from '@/types/subscription';

/**
 * Query for fetching all subscriptions
 */
export function useSubscriptionsQuery(filters?: SubscriptionFilters) {
  const token = TokenStorage.getToken();

  return useQuery({
    queryKey: ['subscriptions', filters],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return subscriptionsApi.getAll(token, filters);
    },
    enabled: !!token,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Query for fetching a single subscription by ID
 */
export function useSubscriptionQuery(id: string) {
  const token = TokenStorage.getToken();

  return useQuery({
    queryKey: ['subscription', id],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return subscriptionsApi.getById(token, id);
    },
    enabled: !!token && !!id,
    staleTime: 60000, // 1 minute
  });
}
```

#### `lib/hooks/useSubscriptionMutations.ts`

```typescript
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '../api/subscriptions';
import { TokenStorage } from '../utils/token-storage';
import { toast } from 'sonner';
import type {
  CreateSubscriptionRequest,
  CancelSubscriptionRequest,
} from '@/types/subscription';

/**
 * Mutation for creating a subscription
 * No auth required - called by payer
 */
export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubscriptionRequest) => {
      return subscriptionsApi.create(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription activated!', {
        description: 'Your subscription is now active.',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to create subscription', {
        description: error.message || 'An unexpected error occurred',
      });
    },
  });
}

/**
 * Mutation for cancelling a subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();
  const token = TokenStorage.getToken();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelSubscriptionRequest }) => {
      if (!token) throw new Error('No authentication token');
      return subscriptionsApi.cancel(token, id, data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription cancelled', {
        description: 'The subscription has been cancelled successfully.',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to cancel subscription', {
        description: error.message || 'An unexpected error occurred',
      });
    },
  });
}
```

---

### 4. Orchestrator Hooks

#### `lib/hooks/usePayers.ts`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { usePayersQuery } from './usePayerQueries';
import { useCreatePayer, useUpdatePayer, useDeletePayer } from './usePayerMutations';
import type { PayerFilters } from '@/types/payer';

/**
 * Main payers hook
 * Orchestrates TanStack Query hooks for payers management
 */
export function usePayers(filters: PayerFilters) {
  const [currentPage, setCurrentPage] = useState(filters.page || 1);
  const [perPage, setPerPage] = useState(filters.limit || 10);

  // Build query filters
  const queryFilters: PayerFilters = {
    page: currentPage,
    limit: perPage,
    search: filters.search,
  };

  // Fetch payers using TanStack Query
  const { data, isLoading, error, refetch } = usePayersQuery(queryFilters);

  // Mutations
  const createMutation = useCreatePayer();
  const updateMutation = useUpdatePayer();
  const deleteMutation = useDeletePayer();

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search]);

  // Extract data from response
  const payers = data?.data || [];
  const pagination = data?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  return {
    // Data
    payers,
    totalPages: pagination.totalPages,
    currentPage: pagination.page,
    perPage: pagination.limit,
    totalItems: pagination.total,

    // State
    loading: isLoading,
    error,

    // Actions
    setPage: setCurrentPage,
    setPerPage: (newPerPage: number) => {
      setPerPage(newPerPage);
      setCurrentPage(1);
    },
    refetch,

    // Mutations
    createPayer: createMutation.mutate,
    createPayerAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    updatePayer: updateMutation.mutate,
    updatePayerAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    deletePayer: deleteMutation.mutate,
    deletePayerAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}

/**
 * Hook for fetching a single payer details
 */
export { usePayerQuery as usePayerDetails } from './usePayerQueries';
```

#### `lib/hooks/useSubscriptions.ts`

```typescript
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSubscriptionsQuery } from './useSubscriptionQueries';
import { useCreateSubscription, useCancelSubscription } from './useSubscriptionMutations';
import type { SubscriptionFilters } from '@/types/subscription';

/**
 * Main subscriptions hook
 * Orchestrates TanStack Query hooks for subscriptions management
 */
export function useSubscriptions(filters: SubscriptionFilters) {
  const [currentPage, setCurrentPage] = useState(filters.page || 1);
  const [perPage, setPerPage] = useState(filters.limit || 10);

  // Build query filters
  const queryFilters: SubscriptionFilters = useMemo(() => ({
    page: currentPage,
    limit: perPage,
    status: filters.status || 'all',
    planId: filters.planId,
    tokenMint: filters.tokenMint,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    search: filters.search,
  }), [currentPage, perPage, filters]);

  // Fetch subscriptions using TanStack Query
  const { data, isLoading, error, refetch } = useSubscriptionsQuery(queryFilters);

  // Mutations
  const createMutation = useCreateSubscription();
  const cancelMutation = useCancelSubscription();

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.status, filters.planId, filters.tokenMint, filters.search]);

  // Extract data from response
  const subscriptions = data?.data || [];
  const pagination = data?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  return {
    // Data
    subscriptions,
    totalPages: pagination.totalPages,
    currentPage: pagination.page,
    perPage: pagination.limit,
    totalItems: pagination.total,

    // State
    loading: isLoading,
    error,

    // Actions
    setPage: setCurrentPage,
    setPerPage: (newPerPage: number) => {
      setPerPage(newPerPage);
      setCurrentPage(1);
    },
    refetch,

    // Mutations
    createSubscription: createMutation.mutate,
    createSubscriptionAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    cancelSubscription: cancelMutation.mutate,
    cancelSubscriptionAsync: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    cancelError: cancelMutation.error,
  };
}

/**
 * Hook for fetching a single subscription details
 */
export { useSubscriptionQuery as useSubscriptionDetails } from './useSubscriptionQueries';
```

---

## 🎯 Resumo da Implementação

### Padrões Estabelecidos

1. **API Layer**: Funções puras com error handling consistente
2. **TanStack Query**: Queries para GET, Mutations para CUD
3. **Orchestrator Hooks**: Combinam queries + mutations + state management
4. **localStorage**: Gerenciamento de token via `TokenStorage`
5. **Toast Notifications**: Feedback visual com Sonner
6. **TypeScript Strict**: Types completos para todas as interfaces

### Componentes UI Necessários

#### Payers:
- **PayerTable**: Lista com paginação, busca, e ações (edit/delete)
- **CreatePayerModal**: Form para criar novo payer
- **EditPayerModal**: Form para editar payer existente
- **DeletePayerDialog**: Confirmação de exclusão com warning sobre subscriptions

#### Subscriptions:
- **SubscriptionTable**: Lista com filtros avançados (status, plan, token, dates)
- **SubscriptionFilters**: Sidebar ou cards com filtros
- **PaymentHistoryCard**: Timeline com últimas 10 execuções
- **CancelSubscriptionDialog**: Confirmação + integração Solana para revoke

### Fluxo de Dados

```
User Action → Component → Orchestrator Hook → TanStack Query/Mutation → API Layer → Backend
                ↓                                      ↓
            UI Update ← State Update ← Cache Update ← Response
```

### Integração Solana

Para subscriptions, será necessário:
1. Instalar `@solana/web3.js` e `@project-serum/anchor`
2. Configurar connection para Solana network (devnet/mainnet)
3. Implementar funções para `approve_delegate` e `revoke_delegate`
4. Conectar wallet do usuário (via Phantom, Solflare, etc.)

---

## ✅ Checklist de Implementação

### Phase 1: Types & API Layer
- [ ] Criar `types/payer.ts` com todas as interfaces
- [ ] Criar `types/subscription.ts` com todas as interfaces
- [ ] Criar `lib/api/payers.ts` com todas as funções
- [ ] Criar `lib/api/subscriptions.ts` com todas as funções

### Phase 2: TanStack Query Hooks
- [ ] Criar `lib/hooks/usePayerQueries.ts`
- [ ] Criar `lib/hooks/usePayerMutations.ts`
- [ ] Criar `lib/hooks/useSubscriptionQueries.ts`
- [ ] Criar `lib/hooks/useSubscriptionMutations.ts`

### Phase 3: Orchestrator Hooks
- [ ] Criar `lib/hooks/usePayers.ts`
- [ ] Criar `lib/hooks/useSubscriptions.ts`

### Phase 4: UI Components - Payers
- [ ] Criar página `app/dashboard/payers/page.tsx`
- [ ] Criar página `app/dashboard/payers/[id]/page.tsx`
- [ ] Criar `PayerTable` component
- [ ] Criar `CreatePayerModal` component
- [ ] Criar `EditPayerModal` component
- [ ] Criar `DeletePayerDialog` component

### Phase 5: UI Components - Subscriptions
- [ ] Criar página `app/dashboard/subscriptions/page.tsx`
- [ ] Criar página `app/dashboard/subscriptions/[id]/page.tsx`
- [ ] Criar `SubscriptionTable` component
- [ ] Criar `SubscriptionFilters` component
- [ ] Criar `PaymentHistoryCard` component
- [ ] Criar `CancelSubscriptionDialog` component

### Phase 6: Solana Integration
- [ ] Instalar dependências Solana
- [ ] Configurar Solana connection
- [ ] Implementar `approve_delegate` flow
- [ ] Implementar `revoke_delegate` flow
- [ ] Conectar com wallet provider

### Phase 7: Testing & Polish
- [ ] Testar create/read/update/delete payers
- [ ] Testar filtros e paginação
- [ ] Testar create subscription (com mock Solana)
- [ ] Testar cancel subscription (com mock Solana)
- [ ] Validar error handling
- [ ] Ajustar UX e feedback messages

---

## 📚 Referências

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
- [Anchor Framework](https://www.anchor-lang.com/)
- Backend CLAUDE.md para detalhes da API

---

**Última atualização**: 2025-01-30
