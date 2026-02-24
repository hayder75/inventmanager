/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `show_image_on_website` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `show_price_on_website` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `approved_at` on the `stock_adjustments` table. All the data in the column will be lost.
  - You are about to drop the column `approved_by` on the `stock_adjustments` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `stock_adjustments` table. All the data in the column will be lost.
  - Added the required column `payment_method` to the `expenses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "stock_adjustments" DROP CONSTRAINT "stock_adjustments_approved_by_fkey";

-- AlterTable
ALTER TABLE "companies" ALTER COLUMN "credit_limit" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "current_balance" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "paymentMethod",
ADD COLUMN     "bank_transfer_image_url" TEXT,
ADD COLUMN     "bank_type" TEXT,
ADD COLUMN     "custom_payment_note" TEXT,
ADD COLUMN     "payment_method" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "expense_date" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "payments_received" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "products" DROP COLUMN "show_image_on_website",
DROP COLUMN "show_price_on_website",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "is_new" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pieces_per_unit" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "show_on_website" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unit" TEXT,
ALTER COLUMN "cost_price" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "selling_price" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "sale_items" ADD COLUMN     "admin_cut_amount" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "admin_cut_percentage" DECIMAL(65,30),
ADD COLUMN     "remaining_surplus" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "sale_unit" TEXT DEFAULT 'pieces',
ADD COLUMN     "salesperson_commission_amount" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "salesperson_commission_percentage" DECIMAL(65,30),
ADD COLUMN     "salesperson_gets_commission" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "surplus_amount" DECIMAL(65,30) DEFAULT 0,
ALTER COLUMN "admin_price" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "overridden_price" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "final_price" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "bank_transfer_image_url" TEXT,
ADD COLUMN     "bank_type" TEXT,
ALTER COLUMN "total_amount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "total_paid" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "total_credit" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "commission_amount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "tot_amount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "vat_amount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "stock_adjustments" DROP COLUMN "approved_at",
DROP COLUMN "approved_by",
DROP COLUMN "status";

-- AlterTable
ALTER TABLE "stock_entries" ALTER COLUMN "cost_price" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "expiry_date" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "owed_amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "supplier_payments" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "total_commission" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- DropEnum
DROP TYPE "StockAdjustmentStatus";

-- CreateTable
CREATE TABLE "daily_opening_balances" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_opening_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "price" DECIMAL(65,30),
    "category" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "public_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "website_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_opening_balances_date_key" ON "daily_opening_balances"("date");

-- CreateIndex
CREATE UNIQUE INDEX "website_settings_key_key" ON "website_settings"("key");

-- AddForeignKey
ALTER TABLE "daily_opening_balances" ADD CONSTRAINT "daily_opening_balances_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
