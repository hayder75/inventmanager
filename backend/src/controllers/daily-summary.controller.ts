import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function getDailySummary(req: AuthRequest, res: Response) {
  try {
    const { date } = req.query;

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parse date in UTC but map to East Africa Time (UTC+3) logic for boundaries
    const dateStr = (date as string) || (() => {
      const eatOffset = 3 * 60 * 60 * 1000;
      const eatTime = new Date(Date.now() + eatOffset);
      return eatTime.toISOString().split('T')[0];
    })();

    // For created_at (which holds exact UTC timestamps mapped to real-time events)
    // We want the start and end of the chosen day in EAT, translated to UTC.
    const eatOffset = 3 * 60 * 60 * 1000;
    const targetDateStart = new Date(dateStr + 'T00:00:00.000Z');
    const startOfDayUTC = new Date(targetDateStart.getTime() - eatOffset);
    const endOfDayUTC = new Date(startOfDayUTC.getTime() + 24 * 60 * 60 * 1000);

    // For expenseDate (which is stored identically to dateStr midnight UTC)
    const expenseTargetDate = new Date(dateStr + 'T00:00:00.000Z');
    const expenseNextDay = new Date(expenseTargetDate.getTime() + 24 * 60 * 60 * 1000);

    // Check if user is SALES - only show their data
    const isSalesPerson = req.user.role === 'SALES';

    // Get sales users - if sales person, only themselves
    let salesUsers;
    if (isSalesPerson) {
      salesUsers = [{
        id: req.user.id,
        name: req.user.name || req.user.email,
        email: req.user.email,
      }];
    } else {
      salesUsers = await prisma.user.findMany({
        where: { role: 'SALES', isActive: true },
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' },
      });
    }

    const summaryData = [];

    for (const user of salesUsers) {
      // Get cash sales for this salesperson on this date
      // Cash = walk-in (no company), no bank type, with payment
      const cashSales = await prisma.sale.findMany({
        where: {
          salespersonId: user.id,
          createdAt: { gte: startOfDayUTC, lt: endOfDayUTC },
          bankType: null, // No bank type = cash payment
          totalPaid: { gt: 0 },
        },
      });

      const cashSalesTotal = cashSales.reduce(
        (sum, sale) => sum.plus(sale.totalPaid),
        new Decimal(0)
      );

      // Get bank transfer sales for this salesperson
      const bankSales = await prisma.sale.findMany({
        where: {
          salespersonId: user.id,
          createdAt: { gte: startOfDayUTC, lt: endOfDayUTC },
          bankType: { not: null },
          totalPaid: { gt: 0 },
        },
      });

      const bankSalesTotal = bankSales.reduce(
        (sum, sale) => sum.plus(sale.totalPaid),
        new Decimal(0)
      );

      // Get credit sales (sales where totalCredit > 0)
      const creditSales = await prisma.sale.findMany({
        where: {
          salespersonId: user.id,
          createdAt: { gte: startOfDayUTC, lt: endOfDayUTC },
          totalCredit: { gt: 0 },
        },
      });

      const creditSalesTotal = creditSales.reduce(
        (sum, sale) => sum.plus(sale.totalCredit),
        new Decimal(0)
      );

      // Get payments received from companies (credit collections)
      const paymentsReceived = await prisma.paymentReceived.findMany({
        where: {
          salespersonId: user.id,
          createdAt: { gte: startOfDayUTC, lt: endOfDayUTC },
        },
      });

      const paymentsReceivedTotal = paymentsReceived.reduce(
        (sum, payment) => sum.plus(payment.amount),
        new Decimal(0)
      );

      // Get expenses linked to this salesperson
      // Match by salespersonId OR by createdBy (since many expenses don't have salespersonId set)
      const salespersonExpenses = await prisma.expense.findMany({
        where: {
          OR: [
            { salespersonId: user.id },
            { createdBy: user.id, salespersonId: null },
          ],
          expenseDate: {
            gte: expenseTargetDate,
            lt: expenseNextDay,
          },
        },
      });

      const salespersonExpensesTotal = salespersonExpenses.reduce(
        (sum, expense) => sum.plus(expense.amount),
        new Decimal(0)
      );

      // Calculate totals
      // totalReceived = cash + bank + payments received (credit sales are not cash in hand)
      const totalReceived = cashSalesTotal.plus(bankSalesTotal).plus(paymentsReceivedTotal);
      const netAmount = totalReceived.minus(salespersonExpensesTotal);

      summaryData.push({
        salesperson: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        sales: {
          cashSales: cashSalesTotal.toString(),
          cashCount: cashSales.length,
          bankSales: bankSalesTotal.toString(),
          bankCount: bankSales.length,
          creditSales: creditSalesTotal.toString(),
          creditCount: creditSales.length,
        },
        payments: {
          received: paymentsReceivedTotal.toString(),
          receivedCount: paymentsReceived.length,
        },
        expenses: {
          total: salespersonExpensesTotal.toString(),
          count: salespersonExpenses.length,
          details: salespersonExpenses.map(e => ({
            id: e.id,
            type: e.expenseType,
            description: e.description,
            amount: e.amount.toString(),
            paymentMethod: e.paymentMethod,
          })),
        },
        totals: {
          totalReceived: totalReceived.toString(),
          totalExpenses: salespersonExpensesTotal.toString(),
          netAmount: netAmount.toString(),
        },
      });
    }

    // Also get overall totals
    const overallCashSales = summaryData.reduce(
      (sum, d) => sum.plus(d.sales.cashSales),
      new Decimal(0)
    );
    const overallBankSales = summaryData.reduce(
      (sum, d) => sum.plus(d.sales.bankSales),
      new Decimal(0)
    );
    const overallCreditSales = summaryData.reduce(
      (sum, d) => sum.plus(d.sales.creditSales),
      new Decimal(0)
    );
    const overallPayments = summaryData.reduce(
      (sum, d) => sum.plus(d.payments.received),
      new Decimal(0)
    );
    const overallExpenses = summaryData.reduce(
      (sum, d) => sum.plus(d.expenses.total),
      new Decimal(0)
    );
    const overallNet = overallCashSales
      .plus(overallBankSales)
      .plus(overallPayments)
      .minus(overallExpenses);

    res.json({
      date: dateStr,
      salespersons: summaryData,
      overall: {
        totalCashSales: overallCashSales.toString(),
        totalBankSales: overallBankSales.toString(),
        totalCreditSales: overallCreditSales.toString(),
        totalPaymentsReceived: overallPayments.toString(),
        totalExpenses: overallExpenses.toString(),
        netAmount: overallNet.toString(),
      },
    });
  } catch (error: any) {
    console.error('Get daily summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
