import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import { Decimal } from '@prisma/client/runtime/library';

interface AdjustmentInput {
  saleId?: string;
  invoiceNumber?: string;
  voucherNumber?: string;
  referenceNumber?: string;
  productId?: string;
  productName: string;
  originalQuantity: number;
  correctQuantity: number;
  reason: string;
  supportingNotes?: string;
}

async function generateRequestNumber(tx: any): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  const count = await tx.salesAdjustmentRequest.count({
    where: {
      createdAt: { gte: new Date(`${today.toISOString().split('T')[0]}T00:00:00.000Z`) },
    },
  });
  let requestNumber = `ADJ-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  let attempts = 0;
  while (attempts < 100) {
    const existing = await tx.salesAdjustmentRequest.findUnique({ where: { requestNumber } });
    if (!existing) break;
    attempts++;
    requestNumber = `ADJ-${dateStr}-${String(count + 1 + attempts).padStart(4, '0')}`;
  }
  return requestNumber;
}

async function recomputeSaleTotals(tx: any, saleId: string) {
  const items = await tx.saleItem.findMany({ where: { saleId } });
  let subtotal = new Decimal(0);
  items.forEach((it: any) => {
    subtotal = subtotal.plus(new Decimal(it.finalPrice).times(it.quantity));
  });

  const settings = await tx.setting.findMany({
    where: { key: { in: ['vat_enabled', 'tot_enabled'] } },
  });
  const settingsMap: Record<string, string> = {};
  settings.forEach((s: any) => { settingsMap[s.key] = s.value; });
  const vatEnabled = settingsMap['vat_enabled'] === 'true';
  const totEnabled = settingsMap['tot_enabled'] === 'true';

  const vatAmount = vatEnabled ? subtotal.times(0.075) : new Decimal(0);
  const totAmount = totEnabled && !vatEnabled ? subtotal.times(0.03) : new Decimal(0);
  const totalAmount = subtotal.plus(vatAmount).plus(totAmount);

  await tx.sale.update({
    where: { id: saleId },
    data: { subtotal, vatAmount, totAmount, totalAmount },
  });
}

export async function createAdjustmentRequest(req: AuthRequest, res: Response) {
  try {
    const input: AdjustmentInput = req.body;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    if (!input.productName || !input.productName.trim()) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    if (input.originalQuantity === undefined || input.correctQuantity === undefined) {
      return res.status(400).json({ error: 'Original and correct quantity are required' });
    }
    if (input.originalQuantity <= 0 || input.correctQuantity < 0) {
      return res.status(400).json({ error: 'Invalid quantities provided' });
    }
    if (!input.reason || !input.reason.trim()) {
      return res.status(400).json({ error: 'Reason for adjustment is required' });
    }

    // Locate the sale if invoice number provided
    let saleId = input.saleId || null;
    if (!saleId && input.invoiceNumber) {
      const sale = await prisma.sale.findUnique({
        where: { invoiceNumber: input.invoiceNumber.trim() },
        select: { id: true },
      });
      if (sale) saleId = sale.id;
    }

    // Resolve product id from name if not provided
    let productId = input.productId || null;
    const productByName = productId
      ? await prisma.product.findUnique({ where: { id: productId } })
      : await prisma.product.findFirst({
          where: { name: { equals: input.productName.trim(), mode: 'insensitive' } },
        });
    if (productByName) productId = productByName.id;

    const request = await prisma.$transaction(async (tx) => {
      const requestNumber = await generateRequestNumber(tx);

      // Resolve actual original quantity from the archived sale item when possible
      let originalQuantity = input.originalQuantity;
      if (saleId && productId) {
        const archivedItem = await tx.saleItem.findFirst({
          where: { saleId, productId },
        });
        if (archivedItem) originalQuantity = archivedItem.quantity;
      }

      const adjustmentDifference = input.correctQuantity - originalQuantity;

      const created = await tx.salesAdjustmentRequest.create({
        data: {
          requestNumber,
          requestedById: req.user!.id,
          saleId,
          invoiceNumber: input.invoiceNumber?.trim() || null,
          voucherNumber: input.voucherNumber?.trim() || null,
          referenceNumber: input.referenceNumber?.trim() || null,
          productId,
          productName: input.productName.trim(),
          originalQuantity,
          correctQuantity: input.correctQuantity,
          adjustmentDifference,
          reason: input.reason.trim(),
          supportingNotes: input.supportingNotes?.trim() || null,
          status: 'PENDING',
          audits: {
            create: {
              action: 'SUBMITTED',
              actorId: req.user!.id,
              actorName: req.user!.name,
              originalValues: {
                originalQuantity,
                invoiceNumber: input.invoiceNumber?.trim() || null,
                saleId,
              },
              ipAddress: req.ip || null,
            },
          },
        },
        include: {
          requestedBy: { select: { id: true, name: true } },
          approvedBy: { select: { id: true, name: true } },
          audits: { orderBy: { createdAt: 'desc' } },
        },
      });
      return created;
    });

    res.status(201).json(request);
  } catch (error: any) {
    console.error('Create adjustment request error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export async function getAdjustmentRequests(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { status, productId, startDate, endDate } = req.query;
    const where: any = {};

    if (status) where.status = status as string;
    if (productId) where.productId = productId as string;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    // SALES role can only see their own requests
    if (req.user.role === 'SALES') {
      where.requestedById = req.user.id;
    }

    const requests = await prisma.salesAdjustmentRequest.findMany({
      where,
      include: {
        requestedBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
        sale: { select: { id: true, invoiceNumber: true } },
        product: { select: { id: true, name: true, stockQty: true, unit: true } },
        audits: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error: any) {
    console.error('Get adjustment requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAdjustmentRequestById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const request = await prisma.salesAdjustmentRequest.findUnique({
      where: { id },
      include: {
        requestedBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
        sale: { select: { id: true, invoiceNumber: true } },
        product: { select: { id: true, name: true, stockQty: true, unit: true } },
        audits: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!request) return res.status(404).json({ error: 'Request not found' });

    if (req.user.role === 'SALES' && request.requestedById !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(request);
  } catch (error: any) {
    console.error('Get adjustment request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function reviewAdjustmentRequest(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { action, remarks } = req.body;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    if (!['APPROVE', 'REJECT', 'MORE_INFO'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const request = await prisma.salesAdjustmentRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ error: 'Request not found' });

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: `Request already ${request.status}` });
    }

    const result = await prisma.$transaction(async (tx) => {
      if (action === 'REJECT') {
        const updated = await tx.salesAdjustmentRequest.update({
          where: { id },
          data: {
            status: 'REJECTED',
            approvedById: req.user!.id,
            approvalDate: new Date(),
            remarks: remarks || null,
            audits: {
              create: {
                action: 'REJECTED',
                actorId: req.user!.id,
                actorName: req.user!.name,
                decision: remarks || 'Rejected',
                ipAddress: req.ip || null,
              },
            },
          },
          include: {
            requestedBy: { select: { id: true, name: true } },
            approvedBy: { select: { id: true, name: true } },
            audits: { orderBy: { createdAt: 'desc' } },
          },
        });
        return updated;
      }

      if (action === 'MORE_INFO') {
        const updated = await tx.salesAdjustmentRequest.update({
          where: { id },
          data: {
            status: 'MORE_INFO',
            approvedById: req.user!.id,
            approvalDate: new Date(),
            remarks: remarks || null,
            audits: {
              create: {
                action: 'MORE_INFO_REQUESTED',
                actorId: req.user!.id,
                actorName: req.user!.name,
                decision: remarks || 'Additional information requested',
                ipAddress: req.ip || null,
              },
            },
          },
          include: {
            requestedBy: { select: { id: true, name: true } },
            approvedBy: { select: { id: true, name: true } },
            audits: { orderBy: { createdAt: 'desc' } },
          },
        });
        return updated;
      }

      // APPROVE - apply changes atomically
      let previousStock = 0;
      if (request.productId) {
        const product = await tx.product.findUnique({ where: { id: request.productId } });
        previousStock = product ? product.stockQty : 0;
      }

      // Only apply inventory + archived-sale changes when a real sale item is linked
      let applied = false;
      let archivedQuantity = request.originalQuantity;
      if (request.saleId && request.productId) {
        const archivedItem = await tx.saleItem.findFirst({
          where: { saleId: request.saleId, productId: request.productId },
        });
        if (archivedItem) {
          applied = true;
          archivedQuantity = archivedItem.quantity;
          await tx.saleItem.update({
            where: { id: archivedItem.id },
            data: {
              quantity: request.correctQuantity,
              subtotal: new Decimal(archivedItem.finalPrice).times(request.correctQuantity),
            },
          });
          await recomputeSaleTotals(tx, request.saleId);
        }
      }

      if (applied) {
        // Recalculate inventory by the difference from the actual archived quantity
        const realDifference = request.correctQuantity - archivedQuantity;
        if (request.productId && realDifference !== 0) {
          const stockUpdate: any = {};
          if (realDifference > 0) {
            stockUpdate.decrement = realDifference; // more units were actually sold
          } else {
            stockUpdate.increment = Math.abs(realDifference); // return over-deducted units
          }
          await tx.product.update({
            where: { id: request.productId },
            data: { stockQty: stockUpdate },
          });
        }
      }

      const updated = await tx.salesAdjustmentRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedById: req.user!.id,
          approvalDate: new Date(),
          remarks: remarks || null,
          audits: {
            create: {
              action: 'APPROVED',
              actorId: req.user!.id,
              actorName: req.user!.name,
              originalValues: {
                originalQuantity: request.originalQuantity,
                previousStock,
                archivedQuantity: applied ? archivedQuantity : null,
              },
              updatedValues: {
                correctQuantity: request.correctQuantity,
                difference: request.adjustmentDifference,
                applied,
                updatedStock: applied && request.productId ? previousStock - (request.correctQuantity - archivedQuantity) : previousStock,
              },
              decision: remarks || 'Approved',
              ipAddress: req.ip || null,
            },
          },
        },
        include: {
          requestedBy: { select: { id: true, name: true } },
          approvedBy: { select: { id: true, name: true } },
          product: { select: { id: true, name: true, stockQty: true, unit: true } },
          audits: { orderBy: { createdAt: 'desc' } },
        },
      });
      return updated;
    });

    res.json(result);
  } catch (error: any) {
    console.error('Review adjustment error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}