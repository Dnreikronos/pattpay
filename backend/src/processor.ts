import { prisma } from "./db.js";

const MAX_RETRY_ATTEMPTS = 5;
const BASE_RETRY_DELAY_MS = 60000; // 1 minute

/**
 * Calculate next retry time with exponential backoff
 * Retry 1: 1 minute
 * Retry 2: 2 minutes
 * Retry 3: 4 minutes
 * Retry 4: 8 minutes
 * Retry 5: 16 minutes
 */
const calculateNextRetry = (retryCount: number): Date => {
  const delayMs = BASE_RETRY_DELAY_MS * Math.pow(2, retryCount);
  return new Date(Date.now() + delayMs);
};

const processWorker = async () => {
  console.log("🔄 Processor started - processing all pending jobs...");

  let processedCount = 0;
  let successCount = 0;
  let failedCount = 0;
  let retryCount = 0;

  try {
    // Get all pending jobs
    const pendingJobs = await prisma.relayerJob.findMany({
      where: {
        status: "PENDING",
        nextRetryAt: { lte: new Date() },
      },
      include: {
        subscription: {
          include: {
            plan: {
              include: {
                planTokens: true,
              },
            },
            payer: true,
          },
        },
      },
    });

    if (pendingJobs.length === 0) {
      console.log("✅ No pending jobs found");
      return;
    }

    console.log(`📊 Found ${pendingJobs.length} pending jobs to process`);

    // Process each job
    for (const job of pendingJobs) {
      console.log(
        `📦 Processing job ${job.id} for subscription ${
          job.subscription.id
        } (attempt ${job.retryCount + 1}/${MAX_RETRY_ATTEMPTS})`
      );

      try {
        // TODO: Implement executePayment() when Anchor program is ready
        // get everything needed to execute the payment (recurring or one-time)
        // await executePayment(job);

        // Mark job as successful
        await prisma.relayerJob.update({
          where: { id: job.id },
          data: {
            status: "SUCCESS",
            executedAt: new Date(),
          },
        });

        successCount++;
        console.log(`✅ Job ${job.id} completed successfully`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`❌ Job ${job.id} failed:`, errorMessage);

        const currentRetryCount = job.retryCount + 1;

        // Check if we should retry or mark as failed
        if (currentRetryCount < MAX_RETRY_ATTEMPTS) {
          const nextRetry = calculateNextRetry(currentRetryCount);
          await prisma.relayerJob.update({
            where: { id: job.id },
            data: {
              retryCount: currentRetryCount,
              nextRetryAt: nextRetry,
              errorMessage: errorMessage,
            },
          });

          retryCount++;
          console.log(
            `🔄 Job ${
              job.id
            } scheduled for retry ${currentRetryCount}/${MAX_RETRY_ATTEMPTS} at ${nextRetry.toISOString()}`
          );
        } else {
          // Max retries reached, mark as failed
          await prisma.relayerJob.update({
            where: { id: job.id },
            data: {
              status: "FAILED",
              executedAt: new Date(),
              errorMessage: errorMessage,
            },
          });

          failedCount++;
          console.log(
            `💀 Job ${job.id} permanently failed after ${MAX_RETRY_ATTEMPTS} attempts`
          );
        }
      }

      processedCount++;
    }

    console.log(
      `📊 Processor completed - Processed: ${processedCount} | Success: ${successCount} | Retry: ${retryCount} | Failed: ${failedCount}`
    );
  } catch (error) {
    console.error("💥 Fatal error in processor:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`🛑 Processor received ${signal}, shutting down...`);
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  processWorker().catch((error) => {
    console.error("💥 Fatal error in processor:", error);
    process.exit(1);
  });
}

export { processWorker };
