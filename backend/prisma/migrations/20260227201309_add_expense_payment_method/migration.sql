/*
  Warnings:

  - You are about to drop the column `bank_transfer_image_url` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `bank_type` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `custom_payment_note` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `payment_method` on the `expenses` table. All the data in the column will be lost.
  - Added the required column `paymentMethod` to the `expenses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "bank_transfer_image_url",
DROP COLUMN "bank_type",
DROP COLUMN "custom_payment_note",
DROP COLUMN "payment_method",
ADD COLUMN     "bankTransferImageUrl" TEXT,
ADD COLUMN     "bankType" TEXT,
ADD COLUMN     "customPaymentNote" TEXT,
ADD COLUMN     "paymentMethod" TEXT NOT NULL;
