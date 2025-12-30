"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuppliersOwed = getSuppliersOwed;
exports.recordSupplierPayment = recordSupplierPayment;
exports.getSupplierPayments = getSupplierPayments;
const prisma_1 = require("../utils/prisma");
const library_1 = require("@prisma/client/runtime/library");
async function getSuppliersOwed(req, res) {
    try {
        const { supplierName } = req.query;
        const where = {
            OR: [
                { status: 'ON_CREDIT' },
                { status: 'PARTIALLY_PAID' },
            ],
        };
        if (supplierName) {
            where.supplierName = { contains: supplierName, mode: 'insensitive' };
        }
        const entries = await prisma_1.prisma.stockEntry.findMany({
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
            const totalPaid = entry.supplierPayments.reduce((sum, payment) => sum.plus(payment.amount), new library_1.Decimal(0));
            const remainingOwed = entry.owedAmount.minus(totalPaid);
            return {
                ...entry,
                totalPaid: totalPaid.toString(),
                remainingOwed: remainingOwed.toString(),
            };
        }).filter(entry => parseFloat(entry.remainingOwed) > 0);
        res.json(suppliersOwed);
    }
    catch (error) {
        console.error('Get suppliers owed error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function recordSupplierPayment(req, res) {
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
        const entries = await prisma_1.prisma.stockEntry.findMany({
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
        let totalOwed = new library_1.Decimal(0);
        entries.forEach(entry => {
            const totalPaid = entry.supplierPayments.reduce((sum, payment) => sum.plus(payment.amount), new library_1.Decimal(0));
            const remaining = entry.owedAmount.minus(totalPaid);
            totalOwed = totalOwed.plus(remaining);
        });
        if (new library_1.Decimal(amount).gt(totalOwed)) {
            return res.status(400).json({
                error: `Payment amount (${amount}) exceeds total owed (${totalOwed})`
            });
        }
        // Create payment record
        const payment = await prisma_1.prisma.supplierPayment.create({
            data: {
                stockEntryIds,
                amount: new library_1.Decimal(amount),
                method,
                supplierName: supplierName || entries[0].supplierName,
                notes: notes || null,
            },
        });
        res.status(201).json(payment);
    }
    catch (error) {
        console.error('Record supplier payment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getSupplierPayments(req, res) {
    try {
        const { supplierName, startDate, endDate } = req.query;
        const where = {};
        if (supplierName) {
            where.supplierName = { contains: supplierName, mode: 'insensitive' };
        }
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate)
                where.createdAt.lte = new Date(endDate);
        }
        const payments = await prisma_1.prisma.supplierPayment.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json(payments);
    }
    catch (error) {
        console.error('Get supplier payments error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=suppliers.controller.js.map