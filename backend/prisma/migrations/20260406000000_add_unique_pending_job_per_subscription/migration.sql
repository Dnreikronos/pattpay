-- CreateIndex
CREATE UNIQUE INDEX "relayer_jobs_subscription_id_pending_unique"
ON "relayer_jobs" ("subscription_id")
WHERE "status" = 'PENDING';
