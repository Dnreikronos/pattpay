/*
  Warnings:

  - A unique constraint covering the columns `[wallet_address,name]` on the table `payers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."payers_wallet_address_key";

-- CreateIndex
CREATE UNIQUE INDEX "payers_wallet_address_name_key" ON "payers"("wallet_address", "name");
