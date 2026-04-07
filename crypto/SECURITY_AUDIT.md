# Security Audit: crypto + backend

**Date**: 2026-04-06
**Scope**: On-chain Solana/Anchor program (`crypto/programs/crypto/`) and backend relayer (`backend/`)

---

## What the backend already mitigates

Before listing remaining issues, credit where it's due. The backend handles several things well:

- **Cumulative charge tracking** (`processor.ts:104-133`): Aggregates successful payments against `totalApprovedAmount` before calling on-chain, providing defense-in-depth on top of the on-chain `spent_amount`.
- **Revoke verification** (`solana.service.ts:310-323`): Checks the delegate PDA is actually closed on-chain before marking a subscription cancelled.
- **Idempotency**: Jobs use unique idempotency keys (`sub:{id}:due:{timestamp}`), atomic claiming, and duplicate payment checks.
- **Atomic commit** (`processor.ts:161-188`): Payment recording, subscription state update, and job completion happen in a single Prisma transaction.

---

## CRITICAL: Issues that still need fixing

### 1. `revoke_delegate` does NOT revoke the SPL token delegate

**On-chain**: `revoke_delegate.rs:5-9` closes the PDA account but never calls `token_interface::revoke()`.

**Backend**: `solana.service.ts:310-323` confirms the PDA is closed, which is good. But the SPL-level delegate authority on the user's token account remains active.

**Why this matters**: The delegate PDA still has spending permission on the user's tokens at the SPL protocol level. Since Anchor programs are upgradeable by default, a malicious or compromised upgrade authority could deploy a new instruction that uses the same PDA to drain tokens, completely bypassing the deleted `DelegateApproval` account. Users believe they've fully revoked access when they haven't.

**Fix**: Add `token_interface::revoke()` to the on-chain `revoke_delegate_handler` and include `payer_token_account` + `token_program` in the accounts struct.

---

### 2. Hardcoded backend key with no rotation path

**On-chain**: `constants.rs:3` hardcodes `AUTHORIZED_BACKEND`.
**Backend**: `solana.service.ts:18-19` loads the private key from env, which is fine for the backend side.

The problem is purely on-chain: if the key is compromised, you can't rotate it without redeploying the program (new program ID), which orphans all existing PDAs, subscriptions, and delegate approvals.

**Fix**: Replace the hardcoded constant with a program-owned `ProgramConfig` PDA that stores the authorized backend pubkey and an admin who can update it.

---

### 3. ~~Weak delegation verification~~ (FIXED)

**Location**: `solana.service.ts:228-268`

`verifyDelegationTransaction` only checks two things:
1. The transaction invoked the PattPay program
2. The expected payer signed it

It does not verify:
- Which instruction was called (could be `revoke_delegate` or `charge_subscription`, not `approve_delegate`)
- The subscription_id or approved amount
- That the receiver matches the plan's receiver

A user could submit a `revoke_delegate` transaction signature and it would pass delegation verification, creating a subscription backed by a closed PDA. The relayer would then fail on the first charge attempt.

**Fix**: Parse the transaction's instruction data to confirm it's specifically an `approve_delegate` call, or at minimum verify the `DelegateApproval` PDA exists on-chain after the transaction.

**Resolution**: `verifyDelegationTransaction` now checks the Anchor instruction discriminator to confirm it's specifically an `approve_delegate` call, and verifies the `DelegateApproval` PDA exists on-chain. A new `subscriptionId` parameter (the UUID used as the on-chain PDA seed) was added to both backend schemas and the frontend request type.

---

## HIGH: Issues to fix before mainnet

### 4. No subscription expiration on-chain

The on-chain `DelegateApproval` stores `created_at` but never checks it. The backend manages expiration via `nextDueAt` and EXPIRED status, but the on-chain program has no time boundary.

If the backend key is compromised, an attacker could charge subscriptions that the backend considers expired. The on-chain program would happily process charges as long as `spent_amount < approved_amount`.

**Fix**: Add `expires_at: i64` to `DelegateApproval` and validate it in `charge_subscription_handler`.

---

### 5. `BACKEND_PRIVATE_KEY` not in env validation

**Location**: `config.ts:6-17`

The Zod env schema validates `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, etc., but `BACKEND_PRIVATE_KEY` and `SOLANA_RPC_URL` are loaded directly from `process.env` in `solana.service.ts:16-19` without validation. If `BACKEND_PRIVATE_KEY` is missing or malformed, the app crashes with an unhelpful `JSON.parse` error at startup.

**Fix**: Add both to the Zod schema in `config.ts`.

---

### 6. SPL delegate allowance collision across subscriptions

SPL Token supports only one delegate per token account. If a user creates two subscriptions with the same payer token account, the second `approve` CPI overwrites the first at the SPL level. The on-chain `DelegateApproval` accounts would show different `approved_amount` values, but only the last one's SPL allowance is real.

The backend doesn't guard against this either: there's no unique constraint on `(payerId, tokenMint, status=ACTIVE)` in the schema.

**Fix**: Either enforce one active subscription per token account (add a unique constraint), or sum all active approvals when setting the SPL delegate amount.

---

## MEDIUM: Good to fix

### 7. No zero-amount validation

Neither instruction validates `amount > 0`. A zero-amount approval wastes rent SOL. A zero-amount charge is a no-op that creates a SUCCESS payment record.

### 8. No event emission

No Anchor events are emitted for approve/charge/revoke. This limits off-chain monitoring, alerting, and audit trail capabilities.

### 9. Test suite doesn't test real authorization

`tests/crypto.ts:30` generates a random `backend` keypair. The charge test uses this random key, which won't match the hardcoded `AUTHORIZED_BACKEND`. The authorization path isn't actually tested end-to-end.

---

## Vulnerability Scanner Checklist

| Check | Status | Notes |
|---|---|---|
| Arbitrary CPI | PASS | Uses `Interface<'info, TokenInterface>` for token program |
| PDA Validation | PASS | All PDAs use `seeds` + `bump` constraints |
| Ownership Check | PASS | Anchor `Account<'info, T>` handles this |
| Signer Check | PASS | `payer: Signer`, `backend: Signer` |
| Sysvar Security | N/A | No sysvar usage |
| Instruction Introspection | N/A | Not used |

---

## OpenZeppelin and Solana

OpenZeppelin is EVM-only. Their contracts library, Defender, and Governor products target Solidity/Ethereum. There's no equivalent for Solana.

For this stack, the right security improvements are:

| Need | Solana Equivalent |
|---|---|
| Access control (OZ Ownable/AccessControl) | Program-owned config PDA with admin authority (fix #2 above) |
| Multisig (OZ Governor) | Squads Protocol for program upgrade authority and admin operations |
| Pausable (OZ Pausable) | Add a `paused: bool` flag to the config PDA, check it in each instruction |
| ReentrancyGuard | Not needed on Solana (single-threaded execution model) |
| Formal audit | OtterSec, Neodyme, Halborn, or Trail of Bits (Solana specialists) |
| Static analysis | Trail of Bits Solana Lints for Cargo |

---

## Recommended priority

1. Fix `revoke_delegate` to actually revoke SPL delegate authority (critical, exploitable gap)
2. Replace hardcoded backend with a config PDA (critical for operational security)
3. Strengthen delegation verification in backend (critical, can create broken subscriptions)
4. Add subscription expiration on-chain (high, defense-in-depth)
5. Add `BACKEND_PRIVATE_KEY` to env validation (high, operational reliability)
6. Prevent SPL delegate collisions (high, multi-subscription correctness)
7. Add zero-amount validation (medium)
8. Add event emission (medium, observability)
9. Fix test suite authorization (medium, test correctness)
