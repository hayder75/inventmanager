/*
  Warnings:

  - You are about to drop the column `category` on the `expenses` table. All the data in the column will be lost.
  - Added the required column `expense_date` to the `expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expense_type` to the `expenses` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('RENT', 'UTILITIES', 'SALARIES', 'COMMISSION', 'SUPPLIES', 'MARKETING', 'TRANSPORTATION', 'MAINTENANCE', 'INSURANCE', 'TAXES', 'OTHER');

-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "category",
ADD COLUMN     "expense_date" DATE NOT NULL,
ADD COLUMN     "expense_type" "ExpenseType" NOT NULL;

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");
