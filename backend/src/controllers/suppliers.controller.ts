import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function getSuppliersOwed(req: AuthRequest, res: Response) {
  try {
    const { supplierName } = req.query;

    const where: any = {
      OR: [
        { status: 'ON_CREDIT' },
        { status: 'PARTIALLY_PAID' },
      ],
    };

    if (supplierName) {
      where.supplierName = { contains: supplierName as string, mode: 'insensitive' };
    }

    const entries = await prisma.stockEntry.findMany({
      where,
      include: {
        product: true,
        supplierPayments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate remaining owed amount for each entry
    const suppliersOwed = entries.map(entry => {
      const totalPaid = entry.supplierPayments.reduce(
        (sum, payment) => sum.plus(payment.amount),
        new Decimal(0)
      );
      const remainingOwed = entry.owedAmount.minus(totalPaid);

      return {
        ...entry,
        totalPaid: totalPaid.toString(),
        remainingOwed: remainingOwed.toString(),
      };
    }).filter(entry => parseFloat(entry.remainingOwed) > 0);

    res.json(suppliersOwed);
  } catch (error: any) {
    console.error('Get suppliers owed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function recordSupplierPayment(req: AuthRequest, res: Response) {
  try {
    const { stockEntryIds, amount, method, supplierName, notes } = req.body;

    if (!stockEntryIds || !Array.isArray(stockEntryIds) || stockEntryIds.length === 0) {
      return res.status(400).json({ error: 'Stock entry IDs are required' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }

    if (!method || !['CASH', 'BANK_TRANSFER'].includes(method)) {
      return res.status(400).json({ error: 'Payment method must be CASH or BANK_TRANSFER' });
    }

    // Validate stock entries
    const entries = await prisma.stockEntry.findMany({
      where: {
        id: { in: stockEntryIds },
      },
      include: {
        supplierPayments: true,
      },
    });

    if (entries.length !== stockEntryIds.length) {
      return res.status(404).json({ error: 'One or more stock entries not found' });
    }

    // Calculate total owed for these entries
    let totalOwed = new Decimal(0);
    entries.forEach(entry => {
      const totalPaid = entry.supplierPayments.reduce(
        (sum, payment) => sum.plus(payment.amount),
        new Decimal(0)
      );
      const remaining = entry.owedAmount.minus(totalPaid);
      totalOwed = totalOwed.plus(remaining);
    });

    if (new Decimal(amount).gt(totalOwed)) {
      return res.status(400).json({
        error: `Payment amount (${amount}) exceeds total owed (${totalOwed})`
      });
    }

    // Create payment record
    const payment = await prisma.supplierPayment.create({
      data: {
        stockEntryIds,
        amount: new Decimal(amount),
        method,
        supplierName: supplierName || entries[0].supplierName,
        notes: notes || null,
        stockEntries: {
          connect: stockEntryIds.map((id: string) => ({ id })),
        },
      },
    });


    res.status(201).json(payment);
  } catch (error: any) {
    console.error('Record supplier payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getSupplierPayments(req: AuthRequest, res: Response) {
  try {
    const { supplierName, startDate, endDate } = req.query;

    const where: any = {};

    if (supplierName) {
      where.supplierName = { contains: supplierName as string, mode: 'insensitive' };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const payments = await prisma.supplierPayment.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(payments);
  } catch (error: any) {
    console.error('Get supplier payments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


