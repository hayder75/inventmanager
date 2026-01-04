-- CreateEnum
CREATE TYPE "StockAdjustmentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "stock_adjustments" ADD COLUMN "status" "StockAdjustmentStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "stock_adjustments" ADD COLUMN "approved_by" TEXT;
ALTER TABLE "stock_adjustments" ADD COLUMN "approved_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "products" ADD COLUMN "show_image_on_website" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "products" ADD COLUMN "show_price_on_website" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
