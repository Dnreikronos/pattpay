# Sign in with Solana (SIWS) Implementation Guide

**Version:** 1.0  
**Last Update:** 2025-01-18  
**Status:** 🟡 Implementation Guide

---

## 📋 Overview

This document provides a comprehensive guide for implementing "Sign in with Solana" (SIWS) authentication using the `@solana/wallet-standard-util` package, following the official SIWS standard.

---

## 📦 Required Dependencies

### **Backend Dependencies**

```bash
npm install @solana/wallet-standard-util @solana/wallet-standard-features
```

### **Frontend Dependencies**

```bash
npm install @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets
```

---

## 🔧 Backend Implementation

### **1. Generate Sign-In Data Endpoint**

```typescript
// backend/src/routes/auth.ts
import { SolanaSignInInput } from "@solana/wallet-standard-features";
import crypto from "crypto";

export async function generateSignInData(req: Request, res: Response) {
  const { walletAddress } = req.body;

  // Generate secure nonce
  const nonce = crypto.randomBytes(32).toString("base64");

  // Create SIWS sign-in data
  const signInData: SolanaSignInInput = {
    domain: process.env.DOMAIN || "pattpay.com",
    statement: "Please sign this message to authenticate with PattPay.",
    version: "1",
    nonce: nonce,
    chainId: "mainnet", // or "devnet" for development
    issuedAt: new Date().toISOString(),
    resources: [process.env.FRONTEND_URL || "https://pattpay.com"],
  };

  // Store nonce temporarily (Redis recommended)
  await redis.setex(`nonce:${walletAddress}`, 300, nonce); // 5 minutes expiry

  res.json({ signInData });
}
```

### **2. Verify Sign-In Output Endpoint**

```typescript
// backend/src/routes/auth.ts
import { verifySignIn } from "@solana/wallet-standard-util";
import {
  SolanaSignInInput,
  SolanaSignInOutput,
} from "@solana/wallet-standard-features";

export async function verifySignInOutput(req: Request, res: Response) {
  const { signInData, signInOutput, name } = req.body;

  try {
    // Verify the signature using SIWS standard
    const isValid = verifySignIn(signInData, signInOutput);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Verify nonce hasn't been used
    const storedNonce = await redis.get(
      `nonce:${signInOutput.account.address}`
    );
    if (!storedNonce || storedNonce !== signInData.nonce) {
      return res.status(401).json({ error: "Invalid or expired nonce" });
    }

    // Clean up nonce
    await redis.del(`nonce:${signInOutput.account.address}`);

    // Check if user exists
    let receiver = await prisma.receiver.findUnique({
      where: { walletAddress: signInOutput.account.address },
    });

    // Create new user if doesn't exist
    if (!receiver) {
      receiver = await prisma.receiver.create({
        data: {
          name: name || "Unknown User",
          authMethod: "SOLANA_WALLET",
          walletAddress: signInOutput.account.address,
          // Note: tokenAccountUSDT and tokenAccountUSDC need to be set
          // This should be handled in a separate onboarding flow
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: receiver.id, walletAddress: receiver.walletAddress },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      user: {
        id: receiver.id,
        walletAddress: receiver.walletAddress,
        name: receiver.name,
        authMethod: receiver.authMethod,
        createdAt: receiver.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("SIWS verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
```

---

## 🎨 Frontend Implementation

### **1. Wallet Connection Setup**

```typescript
// frontend/src/providers/WalletProvider.tsx
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

export function WalletProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const network = WalletAdapterNetwork.Mainnet;
  const wallets = [new PhantomWalletAdapter({ network })];

  return (
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>{children}</WalletModalProvider>
    </WalletProvider>
  );
}
```

### **2. SIWS Authentication Hook**

```typescript
// frontend/src/hooks/useSIWSAuth.ts
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

interface SignInData {
  domain: string;
  statement: string;
  version: string;
  nonce: string;
  chainId: string;
  issuedAt: string;
  resources: string[];
}

interface SignInOutput {
  account: {
    address: string;
    publicKey: string;
  };
  signature: string;
}

export function useSIWSAuth() {
  const { wallet, publicKey, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithSolana = async (name?: string) => {
    if (!wallet || !publicKey) {
      throw new Error("Wallet not connected");
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Get sign-in data from backend
      const response = await fetch("/api/auth/solana-signin-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: publicKey.toBase58() }),
      });

      const { signInData }: { signInData: SignInData } = await response.json();

      // 2. Request wallet to sign the SIWS message
      const signInOutput: SignInOutput = await wallet.signIn(signInData);

      // 3. Send to backend for verification
      const verifyResponse = await fetch("/api/auth/solana-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signInData,
          signInOutput,
          name,
        }),
      });

      const result = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(result.error || "Authentication failed");
      }

      // 4. Store JWT token
      localStorage.setItem("pattpay_token", result.token);

      return result.user;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Authentication failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithSolana,
    loading,
    error,
    connected,
    publicKey,
  };
}
```

### **3. Authentication Component**

```typescript
// frontend/src/components/SolanaAuthButton.tsx
import { useSIWSAuth } from "../hooks/useSIWSAuth";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function SolanaAuthButton() {
  const { signInWithSolana, loading, error, connected } = useSIWSAuth();

  const handleSignIn = async () => {
    try {
      const user = await signInWithSolana();
      console.log("Authenticated user:", user);
      // Redirect to dashboard or update app state
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };

  if (!connected) {
    return <WalletMultiButton />;
  }

  return (
    <div>
      <button
        onClick={handleSignIn}
        disabled={loading}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? "Signing..." : "Sign in with Solana"}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
```

---

## 🔒 Security Best Practices

### **1. Nonce Management**

- Generate cryptographically secure nonces
- Store nonces with expiration (5 minutes recommended)
- One-time use only (delete after verification)
- Use Redis for distributed systems

### **2. Domain Validation**

- Always validate the domain in sign-in data
- Use environment variables for domain configuration
- Implement CORS properly

### **3. Rate Limiting**

```typescript
// Implement rate limiting for auth endpoints
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: "Too many authentication attempts",
});

app.use("/api/auth", authLimiter);
```

### **4. Error Handling**

- Don't expose internal errors to clients
- Log security events for monitoring
- Implement proper error responses

---

## 🧪 Testing

### **Unit Tests**

```typescript
// backend/src/tests/siws.test.ts
import { verifySignIn } from "@solana/wallet-standard-util";

describe("SIWS Verification", () => {
  it("should verify valid signature", () => {
    const signInData = {
      domain: "pattpay.com",
      statement: "Test message",
      version: "1",
      nonce: "test-nonce",
      chainId: "mainnet",
      issuedAt: new Date().toISOString(),
      resources: ["https://pattpay.com"],
    };

    const signInOutput = {
      account: { address: "test-address", publicKey: "test-key" },
      signature: "test-signature",
    };

    // Mock the verification
    expect(verifySignIn(signInData, signInOutput)).toBe(true);
  });
});
```

---

## 🚀 Next Steps

1. **Install Dependencies**: Add required packages to backend and frontend
2. **Implement Backend**: Create SIWS endpoints with proper verification
3. **Implement Frontend**: Add wallet connection and SIWS authentication
4. **Testing**: Write comprehensive tests for authentication flows
5. **Security Review**: Audit implementation for security best practices
