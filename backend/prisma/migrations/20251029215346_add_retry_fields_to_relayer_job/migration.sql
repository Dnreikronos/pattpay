-- AlterTable
ALTER TABLE "relayer_jobs" ADD COLUMN     "error_message" TEXT,
ADD COLUMN     "retry_count" INTEGER NOT NULL DEFAULT 0;
