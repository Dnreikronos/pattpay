import { prisma } from "./db.js";

const scheduleJobs = async () => {
  console.log("⏰ Starting scheduler...");

  try {
    const dueSubscriptions = await prisma.subscription.findMany({
      where: {
        nextDueAt: { lte: new Date() },
        status: "ACTIVE",
        relayerJobs: {
          none: { status: { in: ["PENDING", "PROCESSING"] } },
        },
      },
      include: {
        plan: {
          include: {
            planTokens: true,
          },
        },
        payer: true,
      },
    });

    console.log(`📊 ${dueSubscriptions.length} subscriptions found`);

    if (dueSubscriptions.length === 0) {
      console.log("✅ No subscriptions found");
      return;
    }

    const jobsToCreate = dueSubscriptions.map((subscription) => ({
      subscriptionId: subscription.id,
      idempotencyKey: `sub:${subscription.id}:due:${subscription.nextDueAt.getTime()}`,
      nextRetryAt: new Date(),
      status: "PENDING" as const,
    }));

    const result = await prisma.relayerJob.createMany({
      data: jobsToCreate,
      skipDuplicates: true,
    });

    console.log(`✅ ${result.count} jobs scheduled successfully`);

    for (const subscription of dueSubscriptions) {
      console.log(
        `📦 Job created for subscription ${subscription.id} (Payer: ${subscription.payer.walletAddress})`
      );
    }
  } catch (error) {
    console.error("❌ Error scheduling jobs:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  scheduleJobs()
    .then(() => {
      console.log("🎉 Scheduler executed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Error in scheduler:", error);
      process.exit(1);
    });
}

export { scheduleJobs };
