import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function receivePayment(req: AuthRequest, res: Response) {
  try {
    const { companyId, saleId, amount, method, notes } = req.body;

    if (!companyId || !amount || !method) {
      return res.status(400).json({ 
        error: 'Company ID, amount, and payment method are required' 
      });
    }

    if (!['CASH', 'BANK_TRANSFER'].includes(method)) {
      return res.status(400).json({ 
        error: 'Payment method must be CASH or BANK_TRANSFER' 
      });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    if (new Decimal(amount).gt(company.currentBalance)) {
      return res.status(400).json({ 
        error: `Payment amount (${amount}) exceeds company balance (${company.currentBalance})` 
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create payment record
      const payment = await tx.paymentReceived.create({
        data: {
          companyId,
          saleId: saleId || null,
          amount: new Decimal(amount),
          method,
          salespersonId: req.user!.id,
          notes: notes || null,
        },
      });

      // Update company balance
      await tx.company.update({
        where: { id: companyId },
        data: {
          currentBalance: {
            decrement: new Decimal(amount),
          },
        },
      });

      return payment;
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Receive payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPayments(req: AuthRequest, res: Response) {
  try {
    const { companyId, startDate, endDate, salespersonId } = req.query;

    const where: any = {};

    if (companyId) where.companyId = companyId as string;
    if (salespersonId) where.salespersonId = salespersonId as string;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    // SALES can only see their own payments
    if (req.user?.role === 'SALES') {
      where.salespersonId = req.user.id;
    }

    const payments = await prisma.paymentReceived.findMany({
      where,
      include: {
        company: true,
        salesperson: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(payments);
  } catch (error: any) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getCompaniesWithBalance(req: AuthRequest, res: Response) {
  try {
    const companies = await prisma.company.findMany({
      where: {
        currentBalance: {
          gt: 0,
        },
      },
      include: {
        sales: {
          where: {
            totalCredit: {
              gt: 0,
            },
          },
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
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
      orderBy: {
        currentBalance: 'desc',
      },
    });

    res.json(companies);
  } catch (error: any) {
    console.error('Get companies with balance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


