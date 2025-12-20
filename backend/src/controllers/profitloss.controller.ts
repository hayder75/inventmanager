import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function getProfitLoss(req: AuthRequest, res: Response) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Start date and end date are required',
      });
    }

    const start = new Date(startDate as string);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate as string);
    end.setHours(23, 59, 59, 999);

    // Total Sales (revenue)
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    let totalSales = new Decimal(0);
    let totalCostOfGoodsSold = new Decimal(0);
    let totalSurplus = new Decimal(0);

    for (const sale of sales) {
      totalSales = totalSales.plus(sale.totalAmount);

      // Calculate COGS (Cost of Goods Sold)
      for (const item of sale.items) {
        const cost = item.product.costPrice.times(item.quantity);
        totalCostOfGoodsSold = totalCostOfGoodsSold.plus(cost);
        
        // Calculate surplus (remaining surplus after admin cut)
        if (item.remainingSurplus && item.remainingSurplus.gt(0)) {
          totalSurplus = totalSurplus.plus(item.remainingSurplus);
        }
      }
    }

    // Total Expenses
    const expenses = await prisma.expense.findMany({
      where: {
        expenseDate: {
          gte: start,
          lte: end,
        },
      },
    });

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum.plus(expense.amount),
      new Decimal(0)
    );

    // Calculate VAT and TOT liabilities (collected but not income)
    let totalVatCollected = new Decimal(0);
    let totalTotCollected = new Decimal(0);

    for (const sale of sales) {
      totalVatCollected = totalVatCollected.plus(sale.vatAmount || 0);
      totalTotCollected = totalTotCollected.plus(sale.totAmount || 0);
    }

    // Calculate profits
    // Revenue is subtotal (before taxes), not totalAmount (which includes VAT/TOT)
    let totalRevenue = new Decimal(0);
    for (const sale of sales) {
      totalRevenue = totalRevenue.plus(sale.subtotal || sale.totalAmount);
    }

    // Add surplus to revenue (surplus is additional revenue from price overrides)
    const totalRevenueWithSurplus = totalRevenue.plus(totalSurplus);

    const grossProfit = totalRevenueWithSurplus.minus(totalCostOfGoodsSold);
    const netProfit = grossProfit.minus(totalExpenses);

    // Expenses by type
    const expensesByType: Record<string, Decimal> = {};
    for (const expense of expenses) {
      const type = expense.expenseType;
      if (!expensesByType[type]) {
        expensesByType[type] = new Decimal(0);
      }
      expensesByType[type] = expensesByType[type].plus(expense.amount);
    }

    const expensesBreakdown = Object.entries(expensesByType).map(([type, amount]) => ({
      type,
      amount: amount.toString(),
    }));

    res.json({
      period: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      },
      revenue: {
        totalSales: totalRevenue.toString(),
        totalSalesWithTax: totalSales.toString(),
        surplus: totalSurplus.toString(),
        totalRevenueWithSurplus: totalRevenueWithSurplus.toString(),
      },
      costOfGoodsSold: {
        totalPurchases: totalCostOfGoodsSold.toString(),
      },
      grossProfit: grossProfit.toString(),
      expenses: {
        total: totalExpenses.toString(),
        breakdown: expensesBreakdown,
      },
      liabilities: {
        vatCollected: totalVatCollected.toString(),
        totCollected: totalTotCollected.toString(),
        totalLiabilities: totalVatCollected.plus(totalTotCollected).toString(),
      },
      netProfit: netProfit.toString(),
      summary: {
        totalSales: totalRevenue.toString(),
        totalSalesWithTax: totalSales.toString(),
        surplus: totalSurplus.toString(),
        totalPurchases: totalCostOfGoodsSold.toString(),
        grossProfit: grossProfit.toString(),
        totalExpenses: totalExpenses.toString(),
        vatCollected: totalVatCollected.toString(),
        totCollected: totalTotCollected.toString(),
        netProfit: netProfit.toString(),
      },
    });
  } catch (error: any) {
    console.error('Get profit loss error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

