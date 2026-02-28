import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function createExpense(req: AuthRequest, res: Response) {
  try {
    const { expenseType, expenseDate, description, amount, paymentMethod, bankType, bankTransferImageUrl, customPaymentNote, salespersonId } = req.body;

    if (!expenseType || !expenseDate || !description || !amount || !paymentMethod) {
      return res.status(400).json({
        error: 'Expense type, date, description, amount, and payment method are required',
      });
    }

    if (!['CASH', 'BANK_TRANSFER', 'OTHER', 'SALES'].includes(paymentMethod)) {
      return res.status(400).json({
        error: 'Payment method must be CASH, BANK_TRANSFER, OTHER, or SALES',
      });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // If salespersonId is provided, verify it exists and is a SALES user
    // If not provided and current user is SALES, auto-assign to themselves
    let validatedSalespersonId = null;
    if (salespersonId) {
      const salesperson = await prisma.user.findFirst({
        where: { id: salespersonId, role: 'SALES' },
      });
      if (!salesperson) {
        return res.status(400).json({
          error: 'Invalid salesperson ID. Must be a user with SALES role.',
        });
      }
      validatedSalespersonId = salespersonId;
    } else if (req.user.role === 'SALES') {
      // Auto-assign to the sales user who created it
      validatedSalespersonId = req.user.id;
    }

    // Store expenseDate as UTC midnight to match daily summary UTC date ranges
    const parsedExpenseDate = new Date(expenseDate + 'T00:00:00.000Z');

    const expense = await prisma.expense.create({
      data: {
        expenseType,
        expenseDate: parsedExpenseDate,
        description,
        amount: new Decimal(amount),
        paymentMethod,
        bankType: paymentMethod === 'BANK_TRANSFER' ? (bankType || null) : null,
        bankTransferImageUrl: paymentMethod === 'BANK_TRANSFER' ? (bankTransferImageUrl || null) : null,
        customPaymentNote: ['OTHER', 'SALES'].includes(paymentMethod) ? (customPaymentNote || null) : null,
        salespersonId: validatedSalespersonId,
        createdBy: req.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        salesperson: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json(expense);
  } catch (error: any) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getExpenses(req: AuthRequest, res: Response) {
  try {
    const { startDate, endDate, expenseType, paymentMethod } = req.query;

    const where: any = {};

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) {
        const start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);
        where.expenseDate.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.expenseDate.lte = end;
      }
    }

    if (expenseType) {
      where.expenseType = expenseType as string;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod as string;
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        salesperson: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        expenseDate: 'desc',
      },
    });

    res.json(expenses);
  } catch (error: any) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getExpenseReports(req: AuthRequest, res: Response) {
  try {
    const { reportType, date } = req.query;

    if (!reportType || !date) {
      return res.status(400).json({
        error: 'Report type and date are required',
      });
    }

    let startDate: Date;
    let endDate: Date;
    const targetDate = new Date(date as string);

    if (reportType === 'daily') {
      startDate = new Date(targetDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (reportType === 'weekly') {
      // Get start of week (Monday)
      const day = targetDate.getDay();
      const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(targetDate.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (reportType === 'monthly') {
      startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      return res.status(400).json({ error: 'Invalid report type' });
    }

    const expenses = await prisma.expense.findMany({
      where: {
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        expenseDate: 'desc',
      },
    });

    // Group by expense type
    const byType: Record<string, { count: number; total: Decimal }> = {};
    let totalAmount = new Decimal(0);

    for (const expense of expenses) {
      const type = expense.expenseType;
      if (!byType[type]) {
        byType[type] = { count: 0, total: new Decimal(0) };
      }
      byType[type].count += 1;
      byType[type].total = byType[type].total.plus(expense.amount);
      totalAmount = totalAmount.plus(expense.amount);
    }

    res.json({
      reportType,
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      summary: {
        totalExpenses: totalAmount.toString(),
        totalCount: expenses.length,
        byType: Object.entries(byType).map(([type, data]) => ({
          type,
          count: data.count,
          total: data.total.toString(),
        })),
      },
      expenses,
    });
  } catch (error: any) {
    console.error('Get expense reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getExpenseById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(expense);
  } catch (error: any) {
    console.error('Get expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateExpense(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { expenseType, expenseDate, description, amount, paymentMethod, bankType, bankTransferImageUrl, customPaymentNote } = req.body;

    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const updateData: any = {};
    if (expenseType) updateData.expenseType = expenseType;
    if (expenseDate) updateData.expenseDate = new Date(expenseDate);
    if (description) updateData.description = description;
    if (amount) updateData.amount = new Decimal(amount);
    if (paymentMethod) {
      if (!['CASH', 'BANK_TRANSFER', 'OTHER', 'SALES'].includes(paymentMethod)) {
        return res.status(400).json({
          error: 'Payment method must be CASH, BANK_TRANSFER, OTHER, or SALES',
        });
      }
      updateData.paymentMethod = paymentMethod;
      // Update related fields based on payment method
      if (paymentMethod === 'BANK_TRANSFER') {
        updateData.bankType = bankType || null;
        updateData.bankTransferImageUrl = bankTransferImageUrl || null;
        updateData.customPaymentNote = null;
      } else if (['OTHER', 'SALES'].includes(paymentMethod)) {
        updateData.bankType = null;
        updateData.bankTransferImageUrl = null;
        updateData.customPaymentNote = customPaymentNote || null;
      } else {
        updateData.bankType = null;
        updateData.bankTransferImageUrl = null;
        updateData.customPaymentNote = null;
      }
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteExpense(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await prisma.expense.delete({
      where: { id },
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error: any) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
