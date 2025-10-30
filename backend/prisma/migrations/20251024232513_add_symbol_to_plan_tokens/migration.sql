/*
  Warnings:

  - Added the required column `symbol` to the `plan_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "plan_tokens" ADD COLUMN     "symbol" TEXT NOT NULL;
