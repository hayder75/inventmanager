import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function getDashboardStats(req: AuthRequest, res: Response) {
  try {
    // Determine 'Today' in East Africa Time (UTC+3)
    const now = new Date();
    const eatOffset = 3 * 60 * 60 * 1000; // +3 hours
    const eatTime = new Date(now.getTime() + eatOffset);
    const todayStr = eatTime.toISOString().split('T')[0];

    // For created_at (which holds exact UTC timestamps mapped to real-time events)
    // We want the start and end of the EAT day, translated back to UTC.
    const todayTargetStart = new Date(todayStr + 'T00:00:00.000Z');
    const startOfDayUTC = new Date(todayTargetStart.getTime() - eatOffset);
    const endOfDayUTC = new Date(startOfDayUTC.getTime() + 24 * 60 * 60 * 1000);

    // For expenseDate (which is intentionally stored without time as YYYY-MM-DD T00:00:00.000Z)
    const expenseTargetStart = new Date(todayStr + 'T00:00:00.000Z');
    const expenseTargetEnd = new Date(expenseTargetStart.getTime() + 24 * 60 * 60 * 1000);

    // Check if user is SALES - only show their data
    const isSalesPerson = req.user?.role === 'SALES';
    const salespersonFilter = isSalesPerson ? { salespersonId: req.user!.id } : {};

    // Today's sales
    const todaySales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startOfDayUTC,
          lt: endOfDayUTC,
        },
        ...salespersonFilter,
      },
    });

    // Total Sales = actual money received (including overprice)
    const totalSales = todaySales.reduce(
      (sum, sale) => sum.plus(sale.totalPaid),
      new Decimal(0)
    );

    // Today's Payments Received (credit collections)
    const todayPayments = await prisma.paymentReceived.findMany({
      where: {
        createdAt: {
          gte: startOfDayUTC,
          lt: endOfDayUTC,
        },
        ...salespersonFilter, /* Apply salesperson filter if sales user */
      },
    });

    // Cash Collected = actual cash received from sales (where bankType is NULL) + CASH payments
    const cashSalesTotal = todaySales
      .filter(sale => !sale.bankType) // No bank type = cash payment
      .reduce((sum, sale) => sum.plus(sale.totalPaid), new Decimal(0));
    const cashPaymentsTotal = todayPayments
      .filter(payment => payment.method === 'CASH')
      .reduce((sum, payment) => sum.plus(payment.amount), new Decimal(0));

    const cashCollected = cashSalesTotal.plus(cashPaymentsTotal);

    // Bank Collected = actual bank transfers from sales (where bankType is NOT NULL) + BANK_TRANSFER payments
    const bankSalesTotal = todaySales
      .filter(sale => sale.bankType) // Has bank type = bank transfer
      .reduce((sum, sale) => sum.plus(sale.totalPaid), new Decimal(0));
    const bankPaymentsTotal = todayPayments
      .filter(payment => payment.method === 'BANK_TRANSFER')
      .reduce((sum, payment) => sum.plus(payment.amount), new Decimal(0));

    const bankCollected = bankSalesTotal.plus(bankPaymentsTotal);

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

    // Today's expenses
    const expenseWhere: any = {
      expenseDate: {
        gte: expenseTargetStart,
        lt: expenseTargetEnd,
      },
    };
    // For sales users, show only expenses linked to them (by salespersonId or createdBy)
    if (isSalesPerson) {
      expenseWhere.OR = [
        { salespersonId: req.user!.id },
        { createdBy: req.user!.id, salespersonId: null },
      ];
      delete expenseWhere.expenseDate; // Need to restructure for Prisma AND+OR
      expenseWhere.AND = [
        {
          expenseDate: {
            gte: expenseTargetStart,
            lt: expenseTargetEnd,
          },
        },
      ];
    }
    const todayExpenses = await prisma.expense.findMany({
      where: expenseWhere,
    });
    const totalExpenses = todayExpenses.reduce(
      (sum, expense) => sum.plus(expense.amount),
      new Decimal(0)
    );

    // Net amount = cash + bank + payments received - expenses
    const netAmount = cashCollected.plus(bankCollected).minus(totalExpenses);

    // Total products count
    const totalProducts = await prisma.product.count();

    // Total sales count today
    const totalBills = todaySales.length;

    // Recent sales (last 10, today only) with item details
    const recentSales = await prisma.sale.findMany({
      take: 10,
      where: {
        createdAt: {
          gte: startOfDayUTC,
          lt: endOfDayUTC,
        },
        ...salespersonFilter,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        salesperson: {
          select: {
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Total customers/contacts
    const totalContacts = await prisma.contact.count();

    // Pending credit (total credit not yet paid)
    const allSalesWithCredit = await prisma.sale.findMany({
      where: {
        totalCredit: {
          gt: 0,
        },
      },
    });
    const totalPendingCredit = allSalesWithCredit.reduce(
      (sum, sale) => {
        const remainingCredit = sale.totalCredit.minus(sale.totalPaid);
        return remainingCredit.gt(0) ? sum.plus(remainingCredit) : sum;
      },
      new Decimal(0)
    );

    res.json({
      today: {
        totalSales: totalSales.toString(),
        cashCollected: cashCollected.toString(),
        bankCollected: bankCollected.toString(),
        creditSales: creditSales.toString(),
        profit: profit.toString(),
        expenses: totalExpenses.toString(),
        netAmount: netAmount.toString(),
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
        totalPaid: sale.totalPaid.toString(),
        bankType: sale.bankType,
        createdAt: sale.createdAt.toISOString(),
        salespersonName: sale.salesperson.name,
        items: sale.items.map(item => ({
          productName: item.product.name,
          quantity: item.quantity,
          saleUnit: item.saleUnit || 'pieces',
          adminPrice: item.adminPrice.toString(),
          finalPrice: item.finalPrice.toString(),
          overriddenPrice: item.overriddenPrice?.toString() || null,
          subtotal: item.subtotal.toString(),
          surplusAmount: item.surplusAmount?.toString() || '0',
        })),
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


