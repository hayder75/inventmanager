import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function getDashboardStats(req: AuthRequest, res: Response) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Build where clause for sales - filter by salesperson if SALES role
    const salesWhere: any = {
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    };
    if (req.user?.role === 'SALES') {
      salesWhere.salespersonId = req.user.id;
    }

    // Today's sales
    const todaySales = await prisma.sale.findMany({
      where: salesWhere,
    });

    const totalSales = todaySales.reduce(
      (sum, sale) => sum.plus(sale.totalAmount),
      new Decimal(0)
    );
    const cashCollected = todaySales.reduce(
      (sum, sale) => sum.plus(sale.totalPaid),
      new Decimal(0)
    );
    const creditSales = todaySales.reduce(
      (sum, sale) => sum.plus(sale.totalCredit),
      new Decimal(0)
    );

    // Calculate profit (using admin prices)
    let profit = new Decimal(0);
    for (const sale of todaySales) {
      const items = await prisma.saleItem.findMany({
        where: { saleId: sale.id },
        include: { product: true },
      });

      for (const item of items) {
        const cost = item.product.costPrice.times(item.quantity);
        const revenue = item.adminPrice.times(item.quantity);
        profit = profit.plus(revenue.minus(cost));
      }
    }

    // Low stock alerts
    const products = await prisma.product.findMany();
    const lowStockProducts = products.filter(
      p => p.stockQty <= p.lowStockAlert
    );

    // Build where clause for payments - filter by salesperson if SALES role
    const paymentsWhere: any = {
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    };
    if (req.user?.role === 'SALES') {
      paymentsWhere.salespersonId = req.user.id;
    }

    // Bank collected (from PaymentReceived)
    const todayBankPayments = await prisma.paymentReceived.findMany({
      where: {
        ...paymentsWhere,
        method: 'BANK_TRANSFER',
      },
    });
    const bankCollectedFromPayments = todayBankPayments.reduce(
      (sum, payment) => sum.plus(payment.amount),
      new Decimal(0)
    );

    // Also include bank transfers from sales (walk-in bank transfers)
    const bankCollectedFromSales = todaySales
      .filter(sale => sale.bankType && sale.totalPaid.gt(0))
      .reduce((sum, sale) => sum.plus(sale.totalPaid), new Decimal(0));

    const bankCollected = bankCollectedFromPayments.plus(bankCollectedFromSales);

    // Cash collected from PaymentReceived (credit customer payments)
    const todayCashPayments = await prisma.paymentReceived.findMany({
      where: {
        ...paymentsWhere,
        method: 'CASH',
      },
    });
    const cashCollectedFromPayments = todayCashPayments.reduce(
      (sum, payment) => sum.plus(payment.amount),
      new Decimal(0)
    );

    // Total cash collected = cash from sales + cash from payments
    const totalCashCollected = cashCollected.plus(cashCollectedFromPayments);

    // Today's expenses
    const todayExpenses = await prisma.expense.findMany({
      where: {
        expenseDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
    const totalExpenses = todayExpenses.reduce(
      (sum, expense) => sum.plus(expense.amount),
      new Decimal(0)
    );

    // Total products count
    const totalProducts = await prisma.product.count();

    // Total sales count today
    const totalBills = todaySales.length;

    // Recent sales (last 5) - filter by role
    const recentSalesWhere: any = {};
    if (req.user?.role === 'SALES') {
      recentSalesWhere.salespersonId = req.user.id;
    }
    const recentSales = await prisma.sale.findMany({
      where: recentSalesWhere,
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        salesperson: {
          select: {
            name: true,
          },
        },
      },
    });

    // Total customers/contacts
    const totalContacts = await prisma.contact.count();

    // Pending credit (total credit not yet paid)
    // Get all sales with credit and calculate remaining credit
    const allSalesWithCredit = await prisma.sale.findMany({
      where: {
        totalCredit: {
          gt: 0,
        },
      },
    });
    const totalPendingCredit = allSalesWithCredit.reduce(
      (sum, sale) => {
        // Remaining credit = total credit - total paid
        const remainingCredit = sale.totalCredit.minus(sale.totalPaid);
        return remainingCredit.gt(0) ? sum.plus(remainingCredit) : sum;
      },
      new Decimal(0)
    );

    res.json({
      today: {
        totalSales: totalSales.toString(),
        cashCollected: totalCashCollected.toString(),
        bankCollected: bankCollected.toString(),
        creditSales: creditSales.toString(),
        profit: profit.toString(),
        expenses: totalExpenses.toString(),
        bills: totalBills,
      },
      overview: {
        totalProducts: totalProducts,
        totalContacts: totalContacts,
        pendingCredit: totalPendingCredit.toString(),
      },
      lowStockAlerts: lowStockProducts.length,
      lowStockProducts: lowStockProducts.map(p => ({
        id: p.id,
        name: p.name,
        stockQty: p.stockQty,
        lowStockAlert: p.lowStockAlert,
      })),
      recentSales: recentSales.map(sale => ({
        id: sale.id,
        totalAmount: sale.totalAmount.toString(),
        createdAt: sale.createdAt.toISOString(),
        salespersonName: sale.salesperson.name,
      })),
    });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getSalesPerformance(req: AuthRequest, res: Response) {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        salesperson: {
          select: {
            id: true,
            name: true,
          },
        },
        payments: true,
      },
    });

    // Group by salesperson
    const performanceMap = new Map<string, any>();

    for (const sale of sales) {
      const salespersonId = sale.salespersonId;
      const salespersonName = sale.salesperson.name;

      if (!performanceMap.has(salespersonId)) {
        performanceMap.set(salespersonId, {
          salespersonId,
          salespersonName,
          bills: 0,
          cash: new Decimal(0),
          bank: new Decimal(0),
          creditGiven: new Decimal(0),
          totalSold: new Decimal(0),
          extraFromOverride: new Decimal(0),
          profitContributed: new Decimal(0),
        });
      }

      const perf = performanceMap.get(salespersonId)!;
      perf.bills += 1;

      // Calculate payment breakdown
      const cashPayments = sale.payments.filter(p => p.method === 'CASH');
      const bankPayments = sale.payments.filter(p => p.method === 'BANK_TRANSFER');

      perf.cash = perf.cash.plus(
        cashPayments.reduce((sum, p) => sum.plus(p.amount), new Decimal(0))
      );
      perf.bank = perf.bank.plus(
        bankPayments.reduce((sum, p) => sum.plus(p.amount), new Decimal(0))
      );
      perf.creditGiven = perf.creditGiven.plus(sale.totalCredit);
      perf.totalSold = perf.totalSold.plus(sale.totalPaid);

      // Calculate extra from price overrides
      for (const item of sale.items) {
        if (item.overriddenPrice && item.overriddenPrice.gt(item.adminPrice)) {
          const extra = item.overriddenPrice
            .minus(item.adminPrice)
            .times(item.quantity);
          perf.extraFromOverride = perf.extraFromOverride.plus(extra);
        }

        // Calculate profit (revenue - cost)
        const revenue = item.adminPrice.times(item.quantity);
        const cost = item.product.costPrice.times(item.quantity);
        perf.profitContributed = perf.profitContributed.plus(revenue.minus(cost));
      }
    }

    // Get commission data from users
    const salespersonIds = Array.from(performanceMap.keys());
    const users = await prisma.user.findMany({
      where: {
        id: { in: salespersonIds },
        role: 'SALES',
      },
      select: {
        id: true,
        totalCommission: true,
      },
    });

    const commissionMap = new Map<string, Decimal>();
    users.forEach(user => {
      commissionMap.set(user.id, user.totalCommission);
    });

    const performance = Array.from(performanceMap.values()).map(perf => ({
      salespersonId: perf.salespersonId,
      salespersonName: perf.salespersonName,
      bills: perf.bills,
      cash: perf.cash.toString(),
      bank: perf.bank.toString(),
      creditGiven: perf.creditGiven.toString(),
      totalSold: perf.totalSold.toString(),
      extraFromOverride: perf.extraFromOverride.toString(),
      profitContributed: perf.profitContributed.toString(),
      commission: commissionMap.get(perf.salespersonId)?.toString() || '0',
    }));

    res.json(performance);
  } catch (error: any) {
    console.error('Get sales performance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


