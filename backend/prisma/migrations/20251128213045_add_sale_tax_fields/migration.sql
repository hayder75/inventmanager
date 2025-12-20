/*
  Warnings:

  - Added the required column `subtotal` to the `sales` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- First add columns with defaults
ALTER TABLE "sales" ADD COLUMN     "commission_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "tot_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "vat_amount" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- Add subtotal column as nullable first
ALTER TABLE "sales" ADD COLUMN     "subtotal" DECIMAL(12,2);

-- Update existing records: set subtotal = total_amount (for existing sales without tax breakdown)
UPDATE "sales" SET "subtotal" = "total_amount" WHERE "subtotal" IS NULL;

-- Now make subtotal NOT NULL
ALTER TABLE "sales" ALTER COLUMN "subtotal" SET NOT NULL;
