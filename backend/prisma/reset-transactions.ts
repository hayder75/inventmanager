import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting System Reset (Transactional Data Only) ---');

  // 1. Clear Sales Data
  console.log('Clearing sales and payments...');
  await prisma.saleItem.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.paymentReceived.deleteMany({});

  // 2. Clear Financial/History Data
  console.log('Clearing expenses, stock history, and adjustments...');
  await prisma.expense.deleteMany({});
  await prisma.stockAdjustment.deleteMany({});
  await prisma.supplierPayment.deleteMany({});
  await prisma.stockEntry.deleteMany({}); // Removing seed entries too for a pure blank start
  await prisma.dailyOpeningBalance.deleteMany({});

  // 3. Reset Company Balances
  console.log('Resetting company balances to zero...');
  await prisma.company.updateMany({
    data: {
      currentBalance: 0
    }
  });

  // 4. Reset User Commissions
  console.log('Resetting user commissions to zero...');
  await prisma.user.updateMany({
    data: {
      totalCommission: 0
    }
  });

  // 5. Restore "Initial Stock" entries for existing products
  // If we want a "new system" but want to keep the quantities we just imported,
  // we should probably keep those quantities in the history too for reporting.
  console.log('Re-creating initial stock entries for current inventory...');
  const products = await prisma.product.findMany();
  for (const product of products) {
    if (product.stockQty > 0) {
      await prisma.stockEntry.create({
        data: {
          productId: product.id,
          quantity: product.stockQty,
          costPrice: product.costPrice,
          supplierName: 'System Start Stock',
          status: 'FULLY_PAID'
        }
      });
    }
  }

  console.log('--- System Reset Completed Successfully ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
