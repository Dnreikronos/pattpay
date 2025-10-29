/*
  Warnings:

  - You are about to drop the column `max_uses` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `total_payments` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `views` on the `plans` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "plans" DROP COLUMN "max_uses",
DROP COLUMN "total_payments",
DROP COLUMN "views";
