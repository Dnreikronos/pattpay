# Scheduler & Processor Architecture

This document explains the automated payment processing system implemented using a scheduler and processor pattern for recurring subscription payments.

## Table of Contents

- [Overview](#overview)
- [Architecture Components](#architecture-components)
- [Execution Schedule](#execution-schedule)
- [Data Flow](#data-flow)
- [Retry Mechanism](#retry-mechanism)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Monitoring & Debugging](#monitoring--debugging)
- [Local Development](#local-development)

---

## Overview

The payment processing system is split into two independent services:

1. **Scheduler** - Identifies due subscriptions and creates processing jobs
2. **Processor** - Executes the actual payment transactions and handles retries

This separation provides:

- ✅ **Scalability** - Services can scale independently
- ✅ **Reliability** - Failure in one service doesn't affect the other
- ✅ **Maintainability** - Clear separation of concerns
- ✅ **Observability** - Independent logs and metrics per service

---

## Architecture Components

### 1. Scheduler Service

**Location:** `backend/src/scheduler.ts`

**Purpose:** Scans for subscriptions that are due for payment and creates pending jobs.

**Responsibilities:**

- Query `subscriptions` table for active subscriptions with `nextDueAt <= current_time`
- Create `RelayerJob` records with status `PENDING`
- Skip duplicates (via `skipDuplicates: true`)
- Log summary of jobs created

**Execution:** Runs as a scheduled cron job

**Script:** `npm run scheduler`

---

### 2. Processor Service

**Location:** `backend/src/processor.ts`

**Purpose:** Processes pending jobs, executes payments, and handles failures with automatic retries.

**Responsibilities:**

- Fetch all `PENDING` jobs where `nextRetryAt <= current_time`
- Execute payment transaction for each job
- Mark jobs as `SUCCESS` or schedule for retry
- Implement exponential backoff for failed jobs
- Mark as `FAILED` after max retry attempts
- Log detailed processing statistics

**Execution:** Runs as a scheduled cron job (multiple times per day)

**Script:** `npm run processor`

---

## Execution Schedule

### Scheduler Schedule

```cron
0 0 * * *
```

**Translation:** Runs **once daily at midnight (00:00 UTC)**

**Frequency:** 1 time per day

**Purpose:** Check for subscriptions due today and create jobs

---

### Processor Schedule

```cron
15 0,6,12,18 * * *
```

**Translation:** Runs **4 times daily at:**

- **00:15** (15 minutes after scheduler)
- **06:15**
- **12:15**
- **18:15**

**Frequency:** 4 times per day

**Purpose:**

- Process newly created jobs from scheduler
- Process retry jobs with scheduled retry times
- Handle failed jobs with exponential backoff

---

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: SCHEDULER (00:00 UTC)                           │
├─────────────────────────────────────────────────────────┤
│ 1. Query subscriptions WHERE:                           │
│    - nextDueAt <= NOW()                                 │
│    - status = 'ACTIVE'                                  │
│                                                          │
│ 2. Create RelayerJob for each:                          │
│    {                                                     │
│      subscriptionId: uuid,                              │
│      status: "PENDING",                                 │
│      nextRetryAt: NOW(),                                │
│      retryCount: 0                                      │
│    }                                                     │
│                                                          │
│ 3. Log: "✅ X jobs scheduled successfully"             │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 2: PROCESSOR (00:15, 06:15, 12:15, 18:15 UTC)     │
├─────────────────────────────────────────────────────────┤
│ 1. Query RelayerJob WHERE:                              │
│    - status = 'PENDING'                                 │
│    - nextRetryAt <= NOW()                               │
│                                                          │
│ 2. For each job:                                        │
│    Try:                                                 │
│      ├─ Execute payment (TODO: Anchor integration)     │
│      ├─ Update job: status = 'SUCCESS'                 │
│      └─ Log: "✅ Job completed successfully"           │
│                                                          │
│    Catch (error):                                       │
│      ├─ If retryCount < 5:                             │
│      │   ├─ Increment retryCount                       │
│      │   ├─ Calculate nextRetryAt (exponential)        │
│      │   └─ Log: "🔄 Scheduled for retry X/5"         │
│      │                                                  │
│      └─ Else (max retries reached):                    │
│          ├─ Update job: status = 'FAILED'              │
│          └─ Log: "💀 Permanently failed"               │
│                                                          │
│ 3. Log summary: "📊 Processed: X | Success: Y | etc"   │
└─────────────────────────────────────────────────────────┘
```

---

## Retry Mechanism

### Configuration

```typescript
const MAX_RETRY_ATTEMPTS = 5;
const BASE_RETRY_DELAY_MS = 60000; // 1 minute
```

### Exponential Backoff Formula

```typescript
delayMs = (BASE_RETRY_DELAY_MS * 2) ^ retryCount;
nextRetryAt = NOW() + delayMs;
```

### Retry Schedule

| Attempt | Delay  | Cumulative Time |
| ------- | ------ | --------------- |
| 1       | 0 min  | 0 min           |
| 2       | 1 min  | 1 min           |
| 3       | 2 min  | 3 min           |
| 4       | 4 min  | 7 min           |
| 5       | 8 min  | 15 min          |
| 6 (max) | 16 min | 31 min          |

### Retry Flow

```
Job Created (retryCount: 0)
    ↓
Attempt 1 → FAIL → Schedule retry in 1 min (retryCount: 1)
    ↓
Attempt 2 → FAIL → Schedule retry in 2 min (retryCount: 2)
    ↓
Attempt 3 → FAIL → Schedule retry in 4 min (retryCount: 3)
    ↓
Attempt 4 → FAIL → Schedule retry in 8 min (retryCount: 4)
    ↓
Attempt 5 → FAIL → Schedule retry in 16 min (retryCount: 5)
    ↓
Attempt 6 → FAIL → Mark as FAILED (permanent)
```

### Why This Works

With the processor running **every 6 hours**, failed jobs with exponential backoff will be retried at the next processor execution. The `nextRetryAt` timestamp ensures jobs aren't processed until their retry time arrives.

---

## Database Schema

### RelayerJob Table

```prisma
model RelayerJob {
  id             String           @id @default(uuid())
  subscriptionId String           @map("subscription_id")
  nextRetryAt    DateTime         @map("next_retry_at")
  executedAt     DateTime?        @map("executed_at")
  status         RelayerJobStatus @default(PENDING)
  retryCount     Int              @default(0) @map("retry_count")
  errorMessage   String?          @map("error_message")

  subscription Subscription @relation(...)

  @@map("relayer_jobs")
}

enum RelayerJobStatus {
  PENDING  // Job is waiting to be processed
  SUCCESS  // Payment executed successfully
  FAILED   // Permanently failed after max retries
}
```

### Key Fields

- **`nextRetryAt`**: Controls when the job becomes eligible for processing
- **`retryCount`**: Tracks number of retry attempts (0 to 5)
- **`errorMessage`**: Stores last error for debugging
- **`executedAt`**: Timestamp of final execution (success or permanent failure)
- **`status`**: Current job state (PENDING, SUCCESS, FAILED)

---

## Deployment

### Services Deployed on Railway

| Service Name  | File           | Command             | Schedule          | Cron Expression      |
| ------------- | -------------- | ------------------- | ----------------- | -------------------- |
| **scheduler** | `scheduler.ts` | `npm run scheduler` | Daily at midnight | `0 0 * * *`          |
| **processor** | `processor.ts` | `npm run processor` | 4x daily          | `15 0,6,12,18 * * *` |
| **api**       | `index.ts`     | `npm run start`     | Always on         | N/A                  |

### Environment Variables

Both services require these environment variables:

```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your_jwt_secret_min_32_chars
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend.com
SOLANA_NETWORK=mainnet # or devnet
```

### GitHub Actions Workflows

Three separate workflows for automated deployment:

1. **`deploy-backend.yml`** - Deploys API service

   - Triggers on: Any backend changes except scheduler/processor files

2. **`deploy-scheduler.yml`** - Deploys scheduler service

   - Triggers on: Changes to `scheduler.ts`, `db.ts`, `config.ts`, prisma schema, or dependencies

3. **`deploy-processor.yml`** - Deploys processor service
   - Triggers on: Changes to `processor.ts`, `db.ts`, `config.ts`, prisma schema, or dependencies

### Manual Deployment

```bash
# Deploy scheduler
cd backend
railway up --service scheduler

# Deploy processor
cd backend
railway up --service processor
```

---

## Monitoring & Debugging

### View Logs

```bash
# Scheduler logs
railway logs --service scheduler

# Processor logs
railway logs --service processor
```

### Log Outputs

**Scheduler logs:**

```
⏰ Starting scheduler...
📊 5 subscriptions found
✅ 5 jobs scheduled successfully
📦 Job created for subscription abc-123 (Payer: wallet-address)
🎉 Scheduler executed successfully
```

**Processor logs:**

```
🔄 Worker started - processing all pending jobs...
📊 Found 5 pending jobs to process
📦 Processing job xyz-789 for subscription abc-123 (attempt 1/5)
✅ Job xyz-789 completed successfully
❌ Job xyz-456 failed: Connection timeout
🔄 Job xyz-456 scheduled for retry 1/5 at 2025-10-29T12:01:00.000Z
📊 Worker completed - Processed: 5 | Success: 4 | Retry: 1 | Failed: 0
```

### Monitoring Queries

```sql
-- Check pending jobs
SELECT * FROM relayer_jobs
WHERE status = 'PENDING'
ORDER BY next_retry_at;

-- Check failed jobs
SELECT * FROM relayer_jobs
WHERE status = 'FAILED'
ORDER BY executed_at DESC;

-- Jobs with retries
SELECT id, subscription_id, retry_count, error_message, next_retry_at
FROM relayer_jobs
WHERE retry_count > 0 AND status = 'PENDING';

-- Success rate
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM relayer_jobs
GROUP BY status;
```

---

## Local Development

### Running Locally

```bash
# Terminal 1: Start API
cd backend
npm run dev

# Terminal 2: Run scheduler manually
cd backend
npm run scheduler

# Terminal 3: Run processor manually
cd backend
npm run processor
```

### Testing the Flow

1. **Create test subscriptions** with `nextDueAt` in the past
2. **Run scheduler** to create jobs
3. **Run processor** to process jobs
4. **Check database** to verify job statuses

### Simulating Failures

In `processor.ts`, temporarily add:

```typescript
// Simulate failure for testing
if (job.retryCount < 2) {
  throw new Error("Simulated failure for testing");
}
```

This will force retries and let you observe the exponential backoff behavior.

---

## Future Improvements

### Short Term

- [ ] Implement actual Solana payment execution (Anchor integration)
- [ ] Add Slack/Discord notifications for failed jobs
- [ ] Create admin dashboard to view job status
- [ ] Add metrics/telemetry (Datadog, Sentry)

### Medium Term

- [ ] Implement dead letter queue for permanently failed jobs
- [ ] Add manual retry endpoint for failed jobs
- [ ] Implement job priority/ordering
- [ ] Add rate limiting for payment execution

### Long Term

- [ ] Move to event-driven architecture (PostgreSQL LISTEN/NOTIFY)
- [ ] Implement distributed job processing with multiple workers
- [ ] Add job execution time tracking and optimization
- [ ] Implement payment batching for efficiency

---

## Troubleshooting

### Jobs Not Being Created

**Check:**

1. Scheduler service is running on Railway
2. Cron schedule is set correctly (`0 0 * * *`)
3. Database has active subscriptions with `nextDueAt <= NOW()`
4. Check scheduler logs for errors

### Jobs Not Being Processed

**Check:**

1. Processor service is running on Railway
2. Cron schedule is set correctly (`15 0,6,12,18 * * *`)
3. Jobs exist with `status = 'PENDING'` and `nextRetryAt <= NOW()`
4. Check processor logs for errors

### Too Many Retries

**Issue:** Jobs failing repeatedly and consuming resources

**Solution:**

1. Check `error_message` field in database
2. Fix underlying issue (network, Solana RPC, etc.)
3. If needed, manually mark jobs as `FAILED`:
   ```sql
   UPDATE relayer_jobs
   SET status = 'FAILED', executed_at = NOW()
   WHERE id = 'problem-job-id';
   ```

### Jobs Stuck in PENDING

**Issue:** Jobs never get processed

**Check:**

1. `nextRetryAt` timestamp - might be in the future
2. Processor service is actually running
3. No blocking errors in processor logic

**Solution:** Manually reset `nextRetryAt`:

```sql
UPDATE relayer_jobs
SET next_retry_at = NOW()
WHERE status = 'PENDING' AND next_retry_at > NOW();
```

---

## Contact & Support

For questions or issues related to the scheduler/processor system:

1. Check this documentation first
2. Review Railway logs
3. Query the database for job status
4. Check GitHub Actions workflow runs
5. Contact the development team

---

**Last Updated:** October 29, 2025  
**Version:** 1.0.0  
**Maintained by:** PatPay Development Team
