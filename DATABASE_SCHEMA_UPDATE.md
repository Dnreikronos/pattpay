# Database Schema Update - Dual Authentication System

**Version:** 2.0  
**Last Update:** 2025-01-18  
**Status:** 🟡 Schema Update Required

---

## 📋 Overview

This document outlines the database schema changes required to support dual authentication in PattPay:

- **Traditional**: Email/Password authentication
- **Web3**: Solana wallet authentication

---

## 🔄 Schema Changes

### **New Enum Type**

```sql
CREATE TYPE "AuthMethod" AS ENUM ('EMAIL_PASSWORD', 'SOLANA_WALLET');
```

### **Payer Model (No Authentication Required)**

```prisma
model Payer {
  id            String   @id @default(uuid()) @db.Uuid
  walletAddress String   @unique @map("wallet_address")
  name          String
  email         String?
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  subscriptions Subscription[]

  @@map("payers")
}
```

**Note**: Payers (customers) don't need authentication as they only interact with payment links and don't access the PattPay dashboard.

### **Updated Receiver Model**

```prisma
model Receiver {
  id               String     @id @default(uuid()) @db.Uuid
  name             String     @map("name")
  authMethod       AuthMethod @map("auth_method")
  email            String?    @unique
  passwordHash     String?    @map("password_hash")
  walletAddress    String     @unique @map("wallet_address")
  description      String?    @map("description")
  tokenAccountUSDT String     @map("token_account_usdt")
  tokenAccountUSDC String     @map("token_account_usdc")
  createdAt        DateTime   @default(now()) @map("created_at")
  updatedAt        DateTime   @updatedAt @map("updated_at")

  plans Plan[]

  @@map("receivers")
}
```

**Note**: `walletAddress` and token accounts are required for all receivers as they are essential for receiving payments.

---

## 🔒 Data Integrity Constraints

### **Authentication Method Validation**

#### **For EMAIL_PASSWORD Users:**

- `email` must be NOT NULL and unique
- `password_hash` must be NOT NULL
- `wallet_address` must be NOT NULL (required for receiving payments)

#### **For SOLANA_WALLET Users:**

- `wallet_address` must be NOT NULL and unique (required for receiving payments)
- `email` must be NULL
- `password_hash` must be NULL

### **Check Constraints**

```sql
-- Receivers table constraint only (payers don't need authentication)
ALTER TABLE "receivers" ADD CONSTRAINT "receivers_auth_method_check"
CHECK (
  (auth_method = 'EMAIL_PASSWORD' AND email IS NOT NULL AND password_hash IS NOT NULL) OR
  (auth_method = 'SOLANA_WALLET' AND email IS NULL AND password_hash IS NULL)
);
```

---

## 📊 Indexes for Performance

```sql
-- Email indexes (for EMAIL_PASSWORD receivers only)
CREATE INDEX "receivers_email_idx" ON "receivers" ("email") WHERE "email" IS NOT NULL;

-- Wallet address indexes (for SOLANA_WALLET receivers only)
CREATE INDEX "receivers_wallet_address_idx" ON "receivers" ("wallet_address") WHERE "wallet_address" IS NOT NULL;
```

---

## 🔄 Migration Steps

### **1. Run Prisma Migration**

```bash
cd backend
npx prisma migrate dev --name dual_authentication
```

### **2. Update Existing Data**

```sql
-- For existing receivers, set default auth method
UPDATE "receivers" SET "auth_method" = 'SOLANA_WALLET' WHERE "wallet_address" IS NOT NULL;
```

### **3. Generate Prisma Client**

```bash
npx prisma generate
```

---

## 🎯 Authentication Flow Examples

### **Email/Password Registration (Receivers Only)**

```typescript
const receiver = await prisma.receiver.create({
  data: {
    name: "Alice",
    authMethod: "EMAIL_PASSWORD",
    email: "alice@example.com",
    passwordHash: await bcrypt.hash("password123", 10),
    walletAddress: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM", // Required for receiving payments
    tokenAccountUSDT: "USDT_TOKEN_ACCOUNT_ADDRESS",
    tokenAccountUSDC: "USDC_TOKEN_ACCOUNT_ADDRESS",
  },
});
```

### **Solana Wallet Registration (Receivers Only)**

```typescript
const receiver = await prisma.receiver.create({
  data: {
    name: "Alice",
    authMethod: "SOLANA_WALLET",
    email: null,
    passwordHash: null,
    walletAddress: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM", // Required for receiving payments
    tokenAccountUSDT: "USDT_TOKEN_ACCOUNT_ADDRESS",
    tokenAccountUSDC: "USDC_TOKEN_ACCOUNT_ADDRESS",
  },
});
```

### **Payer Creation (No Authentication)**

```typescript
const payer = await prisma.payer.create({
  data: {
    name: "Bob",
    walletAddress: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    email: "bob@example.com", // Optional
  },
});
```

### **Authentication Check (Receivers Only)**

```typescript
// Check if receiver exists with correct auth method
const receiver = await prisma.receiver.findFirst({
  where: {
    OR: [
      { email: email, authMethod: "EMAIL_PASSWORD" },
      { walletAddress: walletAddress, authMethod: "SOLANA_WALLET" },
    ],
  },
});

if (!receiver) {
  throw new Error("Receiver not found or authentication method mismatch");
}
```

---

## 🔒 Security Considerations

### **Password Security**

- Use bcrypt with salt rounds (minimum 10)
- Never store plain text passwords
- Implement password strength requirements

### **Wallet Security**

- Verify Solana signatures cryptographically
- Use nonce-based authentication
- Implement rate limiting on auth endpoints

### **Data Validation**

- Enforce authentication method consistency
- Validate email format for EMAIL_PASSWORD users
- Validate Solana address format for SOLANA_WALLET users

---

## 📝 API Integration

### **Registration Endpoints**

```typescript
// Email/Password registration
POST /api/auth/register
{
  "authMethod": "email_password",
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}

// Solana wallet registration
POST /api/auth/solana-verify
{
  "walletAddress": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "signature": "base64_encoded_signature",
  "message": "Sign in to PattPay\nNonce: random_nonce_string",
  "name": "John Doe"
}
```

### **Login Endpoints**

```typescript
// Email/Password login
POST /api/auth/login
{
  "authMethod": "email_password",
  "email": "user@example.com",
  "password": "securePassword123"
}

// Solana wallet login
POST /api/auth/solana-verify
{
  "walletAddress": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "signature": "base64_encoded_signature",
  "message": "Sign in to PattPay\nNonce: random_nonce_string"
}
```

---

## 🚀 Next Steps

1. **Run Migration**: Execute the database migration
2. **Update Backend**: Implement dual authentication logic
3. **Update Frontend**: Add authentication method selection
4. **Test Both Flows**: Ensure both auth methods work correctly
5. **Security Audit**: Review authentication security measures

---

## 📚 References

- [Prisma Schema Documentation](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
- [bcrypt Password Hashing](https://www.npmjs.com/package/bcrypt)
- [JWT Token Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
