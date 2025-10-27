-- CreateEnum
CREATE TYPE "LinkStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "payment_executions" ADD COLUMN     "plan_id" UUID,
ALTER COLUMN "subscription_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "expires_at" TIMESTAMP(3),
ADD COLUMN     "is_recurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "max_uses" INTEGER,
ADD COLUMN     "redirect_url" TEXT,
ADD COLUMN     "status" "LinkStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "total_payments" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "duration_months" DROP NOT NULL,
ALTER COLUMN "period_seconds" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "payment_executions_plan_id_idx" ON "payment_executions"("plan_id");

-- AddForeignKey
ALTER TABLE "payment_executions" ADD CONSTRAINT "payment_executions_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_executions" ADD CONSTRAINT "payment_executions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
