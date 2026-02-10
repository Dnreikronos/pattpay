# 🔐 PattPay Smart Contracts

Solana smart contracts (programs) for PattPay's recurring payment system, built with the Anchor framework. Enables non-custodial subscriptions via delegate authority and automated billing.

![Anchor](https://img.shields.io/badge/Anchor-0.32-purple?logo=solana)
![Solana](https://img.shields.io/badge/Solana-1.18-9945FF?logo=solana)
![Rust](https://img.shields.io/badge/Rust-1.75-orange?logo=rust)

## 🚀 Quick Start

### Prerequisites

- **Rust** 1.75+
- **Solana CLI** 1.18+
- **Anchor CLI** 0.32+
- **Node.js** 18+ (for tests)

### Installation

```bash
# Install Rust (if not installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.32.1
avm use 0.32.1

# Install dependencies
npm install
```

### Build & Deploy

```bash
# Build programs
anchor build

# Run tests
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Deploy to mainnet (CAUTION)
anchor deploy --provider.cluster mainnet
```

## 📦 Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Anchor** | Solana smart contract framework | 0.32.1 |
| **Rust** | Programming language | 1.75+ |
| **Solana** | Blockchain platform | 1.18+ |
| **SPL Token** | Token program integration | 0.4.14 |
| **TypeScript** | Testing & client generation | 4.3.5 |

## 📁 Project Structure

```
crypto/
├── programs/                    # Anchor programs (Rust)
│   └── pattpay/
│       ├── src/
│       │   ├── lib.rs          # Program entry point
│       │   ├── instructions/   # Instruction handlers
│       │   │   ├── mod.rs
│       │   │   ├── initialize.rs
│       │   │   ├── create_subscription.rs
│       │   │   ├── delegate_payment.rs
│       │   │   ├── execute_payment.rs
│       │   │   └── cancel_subscription.rs
│       │   ├── state/          # Program state/accounts
│       │   │   ├── mod.rs
│       │   │   ├── subscription.rs
│       │   │   └── payment_record.rs
│       │   └── errors.rs       # Custom errors
│       └── Cargo.toml
│
├── tests/                       # TypeScript tests
│   └── pattpay.ts
│
├── migrations/                  # Deployment scripts
│   └── deploy.ts
│
├── target/                      # Build outputs
│   ├── deploy/
│   │   └── pattpay.so          # Compiled program
│   └── idl/
│       └── pattpay.json        # Interface Definition Language
│
├── Anchor.toml                 # Anchor configuration
├── Cargo.toml                  # Rust workspace config
└── package.json                # TypeScript dependencies
```

## 🏗️ Architecture

### Core Concepts

#### 1. Delegate Authority (PDA)

Instead of requiring users to sign every payment transaction, PattPay uses **Program Derived Addresses (PDAs)** to delegate payment authority to a relayer:

```rust
// User approves delegate authority for subscription payments
pub fn delegate_payment(
    ctx: Context<DelegatePayment>,
    amount: u64,
    duration_months: u8
) -> Result<()> {
    // Creates PDA with delegate authority over user's token account
    // Allows relayer to execute recurring payments automatically
}
```

#### 2. Subscription State

```rust
#[account]
pub struct Subscription {
    pub authority: Pubkey,        // User's wallet
    pub receiver: Pubkey,         // Merchant's wallet
    pub token_mint: Pubkey,       // SPL token (USDC, USDT, etc.)
    pub delegate_authority: Pubkey, // PDA for automated payments
    pub amount_per_period: u64,   // Payment amount
    pub period_seconds: i64,      // Time between payments
    pub next_payment_due: i64,    // Unix timestamp
    pub payments_made: u32,       // Counter
    pub total_approved_amount: u64, // Max amount authorized
    pub is_active: bool,          // Subscription status
    pub created_at: i64,
}
```

#### 3. Payment Execution

```rust
// Relayer calls this to execute recurring payment
pub fn execute_payment(
    ctx: Context<ExecutePayment>
) -> Result<()> {
    // Validates subscription is active and due
    // Transfers tokens using delegate authority
    // Updates next_payment_due timestamp
    // Records payment in PaymentRecord
}
```

## 📋 Instructions (Smart Contract Methods)

### User Instructions

#### `initialize_subscription`

Creates a new subscription with delegate authority.

**Accounts:**
- `subscription` - PDA (created by program)
- `authority` - User's wallet (signer)
- `receiver` - Merchant's wallet
- `token_account` - User's token account
- `delegate_authority` - PDA for automated payments

**Parameters:**
- `amount_per_period: u64` - Amount to charge per period
- `period_seconds: i64` - Seconds between payments (e.g., 2592000 for monthly)
- `duration_months: u8` - Total subscription duration
- `token_mint: Pubkey` - SPL token mint address

**Example:**
```typescript
await program.methods
  .initializeSubscription(
    new BN(10_000_000), // 10 USDC (6 decimals)
    2592000,           // 30 days
    12,                // 12 months
    USDC_MINT
  )
  .accounts({
    subscription: subscriptionPDA,
    authority: wallet.publicKey,
    receiver: merchantWallet,
    tokenAccount: userTokenAccount,
    delegateAuthority: delegatePDA,
  })
  .rpc();
```

#### `cancel_subscription`

User cancels their active subscription.

**Accounts:**
- `subscription` - Subscription PDA
- `authority` - User's wallet (signer)

**Example:**
```typescript
await program.methods
  .cancelSubscription()
  .accounts({
    subscription: subscriptionPDA,
    authority: wallet.publicKey,
  })
  .rpc();
```

### Relayer Instructions

#### `execute_payment`

Relayer executes due payment using delegate authority.

**Accounts:**
- `subscription` - Subscription PDA
- `payer_token_account` - User's token account
- `receiver_token_account` - Merchant's token account
- `delegate_authority` - PDA with delegate permission
- `token_program` - SPL Token program

**Validations:**
- Subscription must be active
- Payment must be due (`now >= next_payment_due`)
- Sufficient approved amount remaining
- Valid delegate authority signature

**Example:**
```typescript
await program.methods
  .executePayment()
  .accounts({
    subscription: subscriptionPDA,
    payerTokenAccount: userTokenAccount,
    receiverTokenAccount: merchantTokenAccount,
    delegateAuthority: delegatePDA,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .rpc();
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests (builds + deploys to local validator)
anchor test

# Run tests with detailed logs
anchor test -- --nocapture

# Test specific file
anchor test -- tests/pattpay.ts
```

### Test Structure

```typescript
// tests/pattpay.ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Pattpay } from "../target/types/pattpay";

describe("pattpay", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Pattpay as Program<Pattpay>;

  it("Creates a subscription", async () => {
    const [subscriptionPDA] = await PublicKey.findProgramAddress(
      [Buffer.from("subscription"), wallet.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .initializeSubscription(/* params */)
      .accounts({ /* accounts */ })
      .rpc();

    const subscription = await program.account.subscription.fetch(subscriptionPDA);
    expect(subscription.isActive).to.be.true;
  });

  it("Executes recurring payment", async () => {
    // Fast-forward time to next payment due
    // Execute payment via relayer
    // Verify balance changes
  });

  it("Cancels subscription", async () => {
    // User cancels subscription
    // Verify subscription is inactive
  });
});
```

## 🔑 PDAs (Program Derived Addresses)

### Subscription PDA

```rust
// Seed: "subscription" + authority + receiver + token_mint
let (subscription_pda, bump) = Pubkey::find_program_address(
    &[
        b"subscription",
        authority.key().as_ref(),
        receiver.key().as_ref(),
        token_mint.key().as_ref(),
    ],
    program_id,
);
```

### Delegate Authority PDA

```rust
// Seed: "delegate" + subscription_pda
let (delegate_pda, bump) = Pubkey::find_program_address(
    &[
        b"delegate",
        subscription_pda.as_ref(),
    ],
    program_id,
);
```

## 🔐 Security Considerations

### Validations

```rust
// ✅ GOOD - Proper validations
pub fn execute_payment(ctx: Context<ExecutePayment>) -> Result<()> {
    let subscription = &mut ctx.accounts.subscription;

    // Validate subscription is active
    require!(subscription.is_active, ErrorCode::SubscriptionInactive);

    // Validate payment is due
    let now = Clock::get()?.unix_timestamp;
    require!(now >= subscription.next_payment_due, ErrorCode::PaymentNotDue);

    // Validate sufficient approved amount
    require!(
        subscription.amount_per_period <= subscription.total_approved_amount,
        ErrorCode::InsufficientApprovedAmount
    );

    // Execute transfer with delegate authority
    // ...
}
```

### Common Vulnerabilities

**❌ Missing Signer Checks**
```rust
// BAD - No verification that authority actually signed
pub authority: AccountInfo<'info>,

// ✅ GOOD - Requires signature
pub authority: Signer<'info>,
```

**❌ Missing Owner Checks**
```rust
// BAD - Attacker could pass malicious account
#[account(mut)]
pub subscription: Account<'info, Subscription>,

// ✅ GOOD - Anchor validates account owner
#[account(
    mut,
    seeds = [b"subscription", authority.key().as_ref()],
    bump,
    has_one = authority, // Validates subscription belongs to signer
)]
pub subscription: Account<'info, Subscription>,
```

## 🌐 Networks

### Devnet (Testing)

```bash
# Set Solana CLI to devnet
solana config set --url devnet

# Airdrop SOL for testing
solana airdrop 2

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

### Mainnet (Production)

```bash
# Set Solana CLI to mainnet
solana config set --url mainnet-beta

# Check balance (ensure sufficient SOL for deployment)
solana balance

# Deploy to mainnet (CAUTION)
anchor deploy --provider.cluster mainnet

# Verify deployment
solana program show <PROGRAM_ID>
```

**Mainnet Checklist:**
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Sufficient SOL for deployment (~5 SOL)
- [ ] Backup keypair securely
- [ ] Test on devnet first
- [ ] Monitor program logs after deployment

## 🛠️ Development

### Build Program

```bash
# Clean build
anchor clean

# Build program
anchor build

# Get program ID
solana address -k target/deploy/pattpay-keypair.json
```

### Update Program ID

After building for the first time:

1. Copy program ID from build output
2. Update `Anchor.toml`:
   ```toml
   [programs.localnet]
   pattpay = "YOUR_PROGRAM_ID"
   ```
3. Update `lib.rs`:
   ```rust
   declare_id!("YOUR_PROGRAM_ID");
   ```
4. Rebuild:
   ```bash
   anchor build
   ```

### Generate IDL (Interface Definition Language)

```bash
# IDL is auto-generated during build
# Located at: target/idl/pattpay.json

# Copy to frontend for client integration
cp target/idl/pattpay.json ../frontend/lib/idl/
```

## 🔗 Frontend Integration

### Install Anchor in Frontend

```bash
cd ../frontend
npm install @coral-xyz/anchor @solana/web3.js
```

### Use Generated IDL

```typescript
// frontend/lib/solana/pattpay-client.ts
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import IDL from "../idl/pattpay.json";

export const getPattpayProgram = (wallet: WalletAdapter) => {
  const connection = new Connection("https://api.devnet.solana.com");
  const provider = new AnchorProvider(connection, wallet, {});

  return new Program(IDL, new PublicKey(IDL.metadata.address), provider);
};

// Usage in components
const program = getPattpayProgram(wallet);

// Create subscription
await program.methods
  .initializeSubscription(amount, period, duration, tokenMint)
  .accounts({ /* ... */ })
  .rpc();
```

## 📊 Program Costs

Approximate costs on Solana mainnet:

| Operation | Rent Exemption | Transaction Fee | Total |
|-----------|----------------|-----------------|-------|
| Deploy Program | ~5 SOL | 0.00001 SOL | ~5 SOL |
| Create Subscription | 0.002 SOL | 0.00001 SOL | ~0.002 SOL |
| Execute Payment | 0 SOL | 0.00001 SOL | ~0.00001 SOL |
| Cancel Subscription | 0 SOL (rent returned) | 0.00001 SOL | ~0.00001 SOL |

**Notes:**
- Rent is refundable when accounts are closed
- Transaction fees are extremely low (~$0.0001)
- Costs may vary based on network congestion

## 🔍 Monitoring & Debugging

### View Program Logs

```bash
# Local validator logs
solana logs

# Devnet logs (filter by program ID)
solana logs --url devnet | grep <PROGRAM_ID>
```

### Query On-Chain State

```bash
# Get subscription account data
solana account <SUBSCRIPTION_PDA>

# Decode with Anchor
anchor account subscription <SUBSCRIPTION_PDA>
```

### Solana Explorer

View transactions and accounts:
- **Devnet**: https://explorer.solana.com/?cluster=devnet
- **Mainnet**: https://explorer.solana.com/

## 📚 Resources

### Anchor Documentation
- **Official Docs**: https://www.anchor-lang.com/
- **GitHub**: https://github.com/coral-xyz/anchor
- **Book**: https://book.anchor-lang.com/

### Solana Documentation
- **Developer Docs**: https://docs.solana.com/
- **Cookbook**: https://solanacookbook.com/
- **SPL Token**: https://spl.solana.com/token

### Learning Resources
- **Solana Bootcamp**: https://www.youtube.com/@SolanaBootcamp
- **Anchor Examples**: https://github.com/coral-xyz/anchor/tree/master/examples
- **PaulX Tutorials**: https://paulx.dev/blog/

## 🐛 Troubleshooting

### Build Errors

```bash
# Clean and rebuild
anchor clean
cargo clean
anchor build
```

### Program Deploy Failed

```bash
# Check balance
solana balance

# Increase compute budget (if needed)
solana program deploy --max-len 200000 target/deploy/pattpay.so
```

### IDL Generation Issues

```bash
# Manually generate IDL
anchor idl init -f target/idl/pattpay.json <PROGRAM_ID>

# Update existing IDL
anchor idl upgrade -f target/idl/pattpay.json <PROGRAM_ID>
```

### Test Failures

```bash
# Restart local validator
pkill solana-test-validator
anchor test

# Run with detailed output
anchor test -- --nocapture
```

## 🤝 Contributing

When working on smart contracts:
1. Follow Anchor best practices
2. Add comprehensive tests for new instructions
3. Document all public functions
4. Run `anchor test` before committing
5. Update IDL in frontend after changes
6. Never commit private keys
7. Use proper PDA seeds for deterministic addresses

## 📄 License

ISC License

## 📖 Related Documentation

- [Main README](../README.md) - Project overview
- [Backend README](../backend/README.md) - API integration
- [Frontend README](../frontend/README.md) - Client integration
- [PAYMENT_FLOWS.md](../PAYMENT_FLOWS.md) - Payment implementation
- [CORE_WORKFLOW.md](../CORE_WORKFLOW.md) - User journeys

---

**Built with Anchor + Rust on Solana**
