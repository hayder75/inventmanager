import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import { Decimal } from '@prisma/client/runtime/library';

interface SaleItemInput {
  productId: string;
  quantity: number;
  saleUnit?: 'pieces' | 'pack'; // What unit is being sold in
  adminPrice: number;
  overriddenPrice?: number;
  finalPrice: number;
  // Surplus management
  surplusAmount?: number;
  adminCutType?: 'percentage' | 'amount';
  adminCutValue?: number;
  adminCutAmount?: number;
  remainingSurplus?: number;
  salespersonGetsCommission?: boolean;
  salespersonCommissionType?: 'percentage' | 'amount';
  salespersonCommissionValue?: number;
  salespersonCommissionAmount?: number;
}

interface CreateSaleInput {
  companyId?: string;
  walkinName?: string;
  walkinPhone?: string;
  items: SaleItemInput[];
  paymentMethods: Array<{ method: 'CASH' | 'BANK_TRANSFER' | 'CREDIT'; amount: number; bankType?: string }>;
  bankTransferImageUrl?: string;
}

export async function createSale(req: AuthRequest, res: Response) {
  try {
    const { companyId, walkinName, walkinPhone, items, paymentMethods, bankTransferImageUrl }: CreateSaleInput = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Sale must have at least one item' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate company if provided
    if (companyId) {
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
    }

    // Validate products and check stock
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      if (product.stockQty < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stockQty} ${product.unit || 'units'}, Requested: ${item.quantity}`
        });
      }
      // Allow any price - no validation on price override
    }

    // Get settings
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['vat_enabled', 'tot_enabled', 'commission_enabled', 'commission_percentage'],
        },
      },
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    const vatEnabled = settingsMap['vat_enabled'] === 'true';
    const totEnabled = settingsMap['tot_enabled'] === 'true';
    const commissionEnabled = settingsMap['commission_enabled'] === 'true';
    const commissionPercentage = parseFloat(settingsMap['commission_percentage'] || '0');

    // Use subtotal from frontend if provided (based on salesperson's entered prices)
    // Otherwise calculate from finalPrice
    let subtotal: Decimal;
    if (req.body.subtotal !== undefined) {
      subtotal = new Decimal(req.body.subtotal);
    } else {
      subtotal = new Decimal(0);
      items.forEach(item => {
        const itemTotal = new Decimal(item.finalPrice).times(item.quantity);
        subtotal = subtotal.plus(itemTotal);
      });
    }

    // Use VAT/TOT/Total from frontend if provided, otherwise calculate
    let vatAmount: Decimal;
    let totAmount: Decimal;
    let totalAmount: Decimal;

    if (req.body.vatAmount !== undefined) {
      vatAmount = new Decimal(req.body.vatAmount);
    } else {
      vatAmount = new Decimal(0);
      if (vatEnabled) {
        vatAmount = subtotal.times(0.075);
      }
    }

    if (req.body.totAmount !== undefined) {
      totAmount = new Decimal(req.body.totAmount);
    } else {
      totAmount = new Decimal(0);
      if (totEnabled && !vatEnabled) {
        totAmount = subtotal.times(0.03);
      }
    }

    if (req.body.totalAmount !== undefined) {
      totalAmount = new Decimal(req.body.totalAmount);
    } else {
      totalAmount = subtotal.plus(vatAmount).plus(totAmount);
    }

    // Calculate commission
    let commissionAmount = new Decimal(0);
    if (commissionEnabled && commissionPercentage > 0) {
      commissionAmount = subtotal.times(commissionPercentage / 100);
    }

    // Calculate payment totals and extract bank type
    let totalPaid = new Decimal(0);
    let totalCredit = new Decimal(0);
    let bankType: string | null = null;

    paymentMethods.forEach(pm => {
      if (pm.method === 'CREDIT') {
        totalCredit = totalCredit.plus(pm.amount);
      } else {
        totalPaid = totalPaid.plus(pm.amount);
        if (pm.method === 'BANK_TRANSFER' && pm.bankType) {
          bankType = pm.bankType;
        }
      }
    });

    // Validate credit if used
    if (totalCredit.gt(0)) {
      if (!companyId) {
        return res.status(400).json({ error: 'Credit can only be used for companies' });
      }
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
      const newBalance = company.currentBalance.plus(totalCredit);
      if (newBalance.gt(company.creditLimit)) {
        return res.status(400).json({ 
          error: `Credit limit exceeded. Current balance: ${company.currentBalance}, Credit limit: ${company.creditLimit}` 
        });
      }
    }

    // Create sale with items in transaction
    const sale = await prisma.$transaction(async (tx) => {
      // Generate invoice number inside transaction to avoid race conditions
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
      
      // Count sales created today (within transaction)
      const count = await tx.sale.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      });
      
      // Generate invoice number and ensure uniqueness
      let invoiceNumber = `INV-${dateStr}-${String(count + 1).padStart(4, '0')}`;
      let attempts = 0;
      const maxAttempts = 100;
      
      // Check if invoice number already exists and increment if needed
      while (attempts < maxAttempts) {
        const existing = await tx.sale.findUnique({
          where: { invoiceNumber },
        });
        
        if (!existing) {
          break; // Invoice number is unique
        }
        
        // If exists, try next number
        attempts++;
        invoiceNumber = `INV-${dateStr}-${String(count + 1 + attempts).padStart(4, '0')}`;
      }
      
      if (attempts >= maxAttempts) {
        throw new Error('Failed to generate unique invoice number');
      }
      
      // Create sale
      const newSale = await tx.sale.create({
        data: {
          invoiceNumber,
          companyId: companyId || null,
          walkinName: walkinName || null,
          walkinPhone: walkinPhone || null,
          subtotal,
          vatAmount,
          totAmount,
          totalAmount,
          totalPaid,
          totalCredit,
          commissionAmount,
          bankType: bankType || null,
          bankTransferImageUrl: bankTransferImageUrl || null,
          salespersonId: req.user!.id,
          items: {
                        create: items.map(item => ({
                          productId: item.productId,
                          quantity: item.quantity,
                          saleUnit: item.saleUnit || 'pieces',
                          adminPrice: item.adminPrice,
                          overriddenPrice: item.overriddenPrice || null,
                          finalPrice: item.finalPrice,
                          subtotal: new Decimal(item.finalPrice).times(item.quantity),
              // Surplus management fields
              surplusAmount: item.surplusAmount ? new Decimal(item.surplusAmount) : new Decimal(0),
              adminCutAmount: item.adminCutAmount ? new Decimal(item.adminCutAmount) : new Decimal(0),
              adminCutPercentage: item.adminCutType === 'percentage' && item.adminCutValue ? new Decimal(item.adminCutValue) : null,
              remainingSurplus: item.remainingSurplus ? new Decimal(item.remainingSurplus) : new Decimal(0),
              salespersonGetsCommission: item.salespersonGetsCommission || false,
              salespersonCommissionAmount: item.salespersonCommissionAmount ? new Decimal(item.salespersonCommissionAmount) : new Decimal(0),
              salespersonCommissionPercentage: item.salespersonCommissionType === 'percentage' && item.salespersonCommissionValue ? new Decimal(item.salespersonCommissionValue) : null,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          company: true,
          salesperson: true,
        },
      });

      // Update stock for each item (deduct exact quantity sold)
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) continue;

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQty: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Update company balance if credit used
      if (companyId && totalCredit.gt(0)) {
        await tx.company.update({
          where: { id: companyId },
          data: {
            currentBalance: {
              increment: totalCredit,
            },
          },
        });
      }

      // Create commission expense if enabled
      if (commissionEnabled && commissionAmount.gt(0)) {
        await tx.expense.create({
          data: {
            expenseType: 'COMMISSION',
            expenseDate: new Date(),
            description: `Commission for sale ${invoiceNumber} - ${req.user!.name}`,
            amount: commissionAmount,
            paymentMethod: 'CASH', // Commission typically paid in cash
            createdBy: req.user!.id,
          },
        });
      }

      // Update salesperson's total commission from surplus commissions
      const totalSurplusCommission = items.reduce((sum, item) => {
        return sum + (item.salespersonCommissionAmount || 0);
      }, 0);
      
      if (totalSurplusCommission > 0) {
        await tx.user.update({
          where: { id: req.user!.id },
          data: {
            totalCommission: {
              increment: new Decimal(totalSurplusCommission),
            },
          },
        });
      }

      return newSale;
    });

    res.status(201).json(sale);
  } catch (error: any) {
    console.error('Create sale error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export async function getSales(req: AuthRequest, res: Response) {
  try {
    const { startDate, endDate, salespersonId, companyId } = req.query;

    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    if (salespersonId) {
      where.salespersonId = salespersonId as string;
    }

    if (companyId) {
      where.companyId = companyId as string;
    }

    // SALES role can only see their own sales
    if (req.user?.role === 'SALES') {
      where.salespersonId = req.user.id;
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        company: true,
        salesperson: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(sales);
  } catch (error: any) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getSaleById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        company: true,
        salesperson: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payments: true,
      },
    });

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // SALES can only see their own sales
    if (req.user?.role === 'SALES' && sale.salespersonId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(sale);
  } catch (error: any) {
    console.error('Get sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getBankDeposits(req: AuthRequest, res: Response) {
  try {
    const { startDate, endDate, bankType } = req.query;

    const where: any = {
      totalPaid: { gt: 0 }, // Only sales with bank payments (not credit-only)
      bankType: { not: null }, // Only bank transfers, exclude cash
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (bankType) {
      where.bankType = bankType as string; // Specific bank type
    }

    const sales = await prisma.sale.findMany({
      where,
      select: {
        id: true,
        invoiceNumber: true,
        bankType: true,
        bankTransferImageUrl: true,
        totalPaid: true,
        createdAt: true,
        salesperson: {
          select: {
            name: true,
          },
        },
        walkinName: true,
        company: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to deposit format
    const deposits = sales.map(sale => ({
      id: sale.id,
      invoiceNumber: sale.invoiceNumber,
      bankType: sale.bankType,
      bankTransferImageUrl: sale.bankTransferImageUrl,
      amount: sale.totalPaid.toString(),
      createdAt: sale.createdAt.toISOString(),
      salesperson: sale.salesperson,
      walkinName: sale.walkinName,
      company: sale.company,
    }));

    res.json(deposits);
  } catch (error: any) {
    console.error('Get bank deposits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


