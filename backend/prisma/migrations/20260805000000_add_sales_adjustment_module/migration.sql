-- CreateEnum
CREATE TYPE "SalesAdjustmentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'MORE_INFO');

-- CreateEnum
CREATE TYPE "SalesAdjustmentAction" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED', 'MORE_INFO_REQUESTED');

-- CreateTable
CREATE TABLE "sales_adjustment_requests" (
    "id" TEXT NOT NULL,
    "request_number" TEXT NOT NULL,
    "requested_by_id" TEXT NOT NULL,
    "sale_id" TEXT,
    "invoice_number" TEXT,
    "voucher_number" TEXT,
    "reference_number" TEXT,
    "product_id" TEXT,
    "product_name" TEXT NOT NULL,
    "original_quantity" INTEGER NOT NULL,
    "correct_quantity" INTEGER NOT NULL,
    "adjustment_difference" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "supporting_notes" TEXT,
    "status" "SalesAdjustmentStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by_id" TEXT,
    "approval_date" TIMESTAMP(3),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_adjustment_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_adjustment_audits" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "action" "SalesAdjustmentAction" NOT NULL,
    "actor_id" TEXT,
    "actor_name" TEXT,
    "original_values" JSONB,
    "updated_values" JSONB,
    "decision" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_adjustment_audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sales_adjustment_requests_request_number_key" ON "sales_adjustment_requests"("request_number");

-- AddForeignKey
ALTER TABLE "sales_adjustment_requests" ADD CONSTRAINT "sales_adjustment_requests_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_adjustment_requests" ADD CONSTRAINT "sales_adjustment_requests_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_adjustment_requests" ADD CONSTRAINT "sales_adjustment_requests_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_adjustment_requests" ADD CONSTRAINT "sales_adjustment_requests_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_adjustment_audits" ADD CONSTRAINT "sales_adjustment_audits_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "sales_adjustment_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_adjustment_audits" ADD CONSTRAINT "sales_adjustment_audits_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;