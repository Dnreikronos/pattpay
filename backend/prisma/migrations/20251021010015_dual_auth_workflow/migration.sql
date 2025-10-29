/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `receivers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `auth_method` to the `receivers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuthMethod" AS ENUM ('EMAIL_PASSWORD', 'SOLANA_WALLET');

-- AlterTable
ALTER TABLE "receivers" ADD COLUMN     "auth_method" "AuthMethod" NOT NULL,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "password_hash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "receivers_email_key" ON "receivers"("email");
