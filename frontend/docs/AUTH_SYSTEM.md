# PattPay Dashboard - Mock Authentication System

**Document:** Mock Authentication System
**Last Update:** 2025-10-18

---

## 🔐 Overview

The dashboard uses a **mock authentication system** via React Context API for MVP development. This allows rapid frontend development without backend dependency, with an easy migration path to real Solana wallet authentication later.

---

## 🏗️ Architecture

### Context Structure

The authentication state is managed globally using React Context, providing user state and auth functions across the entire application.

**File:** `contexts/AuthContext.tsx`

---

## 📋 Type Definitions

### User Interface

```typescript
interface User {
  id: string
  name: string
  email: string
  wallet: string // Solana wallet address
  avatar?: string
  createdAt: string
}
```

### Auth State Interface

```typescript
interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (wallet: string) => Promise<void>
  logout: () => void
}
```

---

## 🛠️ Implementation

### AuthContext Provider

```typescript
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Types
interface User {
  id: string
  name: string
  email: string
  wallet: string
  avatar?: string
  createdAt: string
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (wallet: string) => Promise<void>
  logout: () => void
}

// Create context
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('pattpay_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  // Login function (simulated)
  const login = async (wallet: string): Promise<void> => {
    setLoading(true)

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Create mock user
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      email: 'john@pattpay.com',
      wallet: wallet,
      avatar: '/avatars/default.png',
      createdAt: new Date().toISOString()
    }

    // Save to localStorage
    localStorage.setItem('pattpay_user', JSON.stringify(mockUser))

    setUser(mockUser)
    setLoading(false)
  }

  // Logout function
  const logout = (): void => {
    localStorage.removeItem('pattpay_user')
    setUser(null)
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

---

## 🔒 Route Protection

### Dashboard Layout Protection

**File:** `app/dashboard/layout.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Sidebar } from '@/components/dashboard/layout/Sidebar'
import { DashboardHeader } from '@/components/dashboard/layout/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Render dashboard layout
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

## 🎨 Login Page (Future)

### Login Page Structure

**File:** `app/login/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { PixelButton } from '@/components/PixelButton'

export default function LoginPage() {
  const router = useRouter()
  const { login, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const handleMockLogin = async () => {
    try {
      setError(null)
      // Mock wallet address
      await login('AbCd1234567890EfGhIjKlMnOpQrStUvWxYz')
      router.push('/dashboard')
    } catch (err) {
      setError('Failed to login. Please try again.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="max-w-md w-full p-8 bg-surface border-4 border-brand shadow-[8px_8px_0_0_rgba(79,70,229,0.3)]">
        <h1 className="font-display text-2xl text-brand mb-6 text-center">
          Welcome to PattPay
        </h1>

        <p className="font-mono text-sm text-muted mb-8 text-center">
          Connect your Solana wallet to access the dashboard
        </p>

        {error && (
          <div className="mb-4 p-3 bg-error/10 border-2 border-error text-error font-mono text-sm">
            {error}
          </div>
        )}

        <PixelButton
          onClick={handleMockLogin}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Connecting...' : 'Connect Wallet (Mock)'}
        </PixelButton>

        <p className="mt-4 font-mono text-xs text-muted text-center">
          This is a mock authentication for development.
          Real wallet integration coming soon.
        </p>
      </div>
    </div>
  )
}
```

---

## 🔄 Usage Examples

### In Components

```typescript
import { useAuth } from '@/contexts/AuthContext'

function UserProfile() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div>
      <p>Welcome, {user.name}</p>
      <p>Wallet: {user.wallet}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Conditional Rendering

```typescript
function DashboardPage() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <div>Please login to view dashboard</div>
  }

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      {/* Dashboard content */}
    </div>
  )
}
```

### Protected API Calls

```typescript
async function fetchUserData() {
  const { user } = useAuth()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const response = await fetch('/api/user-data', {
    headers: {
      'Authorization': `Bearer ${user.id}` // Mock token
    }
  })

  return response.json()
}
```

---

## 🚀 Migration Path to Real Auth

When ready to integrate real Solana wallet authentication:

### Step 1: Install Solana Wallet Adapter

```bash
pnpm add @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js
```

### Step 2: Update AuthContext

```typescript
import { useWallet } from '@solana/wallet-adapter-react'

export function AuthProvider({ children }: { children: ReactNode }) {
  const { publicKey, connected, signMessage } = useWallet()

  const login = async () => {
    if (!publicKey || !signMessage) {
      throw new Error('Wallet not connected')
    }

    // Sign message to verify wallet ownership
    const message = new TextEncoder().encode(
      `Sign in to PattPay\nNonce: ${Date.now()}`
    )
    const signature = await signMessage(message)

    // Send signature to backend for verification
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publicKey: publicKey.toBase58(),
        signature: Buffer.from(signature).toString('base64'),
        message: Buffer.from(message).toString('base64')
      })
    })

    const { user, token } = await response.json()

    // Save auth token
    localStorage.setItem('pattpay_token', token)
    setUser(user)
  }

  // ... rest of implementation
}
```

### Step 3: Add Wallet Provider Wrapper

```typescript
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'

export function RootLayout({ children }) {
  const network = WalletAdapterNetwork.Mainnet
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({ network })
  ]

  return (
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </WalletModalProvider>
    </WalletProvider>
  )
}
```

### Step 4: Update Login UI

```typescript
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

function LoginPage() {
  return (
    <div>
      <h1>Connect Your Wallet</h1>
      <WalletMultiButton />
    </div>
  )
}
```

---

## 🔑 Security Considerations

### Current (Mock Phase)

- ⚠️ No real authentication
- ⚠️ Data only persisted in localStorage
- ⚠️ No sensitive data should be stored
- ⚠️ For development/demo purposes only

### Future (Production Phase)

- [ ] Wallet signature verification
- [ ] HTTPS only
- [ ] Secure token storage
- [ ] CSRF protection
- [ ] XSS prevention
- [ ] Rate limiting on auth endpoints
- [ ] Session expiration
- [ ] Refresh token rotation

---

## 📊 Auth Flow Diagrams

### Mock Auth Flow (Current)

```
User clicks "Connect Wallet"
         ↓
Simulated 500ms delay
         ↓
Mock user created
         ↓
Saved to localStorage
         ↓
User state updated
         ↓
Redirect to /dashboard
```

### Real Auth Flow (Future)

```
User clicks "Connect Wallet"
         ↓
Wallet selection modal
         ↓
User selects wallet (Phantom, Solflare, etc.)
         ↓
Wallet connection request
         ↓
User approves in wallet
         ↓
Sign authentication message
         ↓
Send signature to backend
         ↓
Backend verifies signature
         ↓
Backend generates JWT token
         ↓
Token saved to localStorage
         ↓
User state updated
         ↓
Redirect to /dashboard
```

---

## ✅ Implementation Checklist

### Phase 0 (Mock Auth)

- [ ] Create `contexts/AuthContext.tsx`
- [ ] Implement mock user state
- [ ] Add localStorage persistence
- [ ] Create `useAuth` hook
- [ ] Add AuthProvider to root layout
- [ ] Create login page with mock button
- [ ] Protect dashboard routes
- [ ] Add loading states
- [ ] Implement logout functionality

### Future (Real Auth)

- [ ] Install Solana wallet adapter packages
- [ ] Create WalletProvider wrapper
- [ ] Update AuthContext for real wallets
- [ ] Implement signature verification
- [ ] Create backend auth endpoints
- [ ] Add JWT token management
- [ ] Implement refresh token flow
- [ ] Add session management
- [ ] Security hardening (CSRF, XSS)

---

**Next:** Review [API_MOCK.md](./API_MOCK.md) for mock API endpoints and data structures.
