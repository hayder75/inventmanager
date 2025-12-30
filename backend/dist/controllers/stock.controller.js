"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addStock = addStock;
exports.adjustStock = adjustStock;
exports.getStockEntries = getStockEntries;
exports.getStockAdjustments = getStockAdjustments;
const prisma_1 = require("../utils/prisma");
const library_1 = require("@prisma/client/runtime/library");
async function addStock(req, res) {
    try {
        const entries = req.body;
        // Handle both single and batch entry
        const entriesArray = Array.isArray(entries) ? entries : [entries];
        if (entriesArray.length === 0) {
            return res.status(400).json({ error: 'At least one stock entry is required' });
        }
        const results = await prisma_1.prisma.$transaction(async (tx) => {
            const createdEntries = [];
            for (const entry of entriesArray) {
                let productId = entry.productId;
                // If product doesn't exist, create it
                if (!productId) {
                    if (!entry.productName) {
                        throw new Error('Product name is required when creating new product');
                    }
                    // Calculate selling price - use provided or default to 50% markup
                    const calculatedSellingPrice = (entry.sellingPrice && entry.sellingPrice > 0)
                        ? entry.sellingPrice
                        : (entry.costPrice > 0 ? entry.costPrice * 1.5 : 0);
                    const newProduct = await tx.product.create({
                        data: {
                            name: entry.productName,
                            code: entry.productCode || null,
                            category: entry.category || null,
                            costPrice: new library_1.Decimal(entry.costPrice),
                            sellingPrice: new library_1.Decimal(calculatedSellingPrice),
                            stockQty: entry.quantity,
                        },
                    });
                    productId = newProduct.id;
                }
                else {
                    // Update existing product stock
                    const updateData = {
                        stockQty: {
                            increment: entry.quantity,
                        },
                    };
                    // Always update prices when adding stock
                    if (entry.costPrice && entry.costPrice > 0) {
                        updateData.costPrice = new library_1.Decimal(entry.costPrice);
                    }
                    if (entry.sellingPrice && entry.sellingPrice > 0) {
                        updateData.sellingPrice = new library_1.Decimal(entry.sellingPrice);
                    }
                    await tx.product.update({
                        where: { id: productId },
                        data: updateData,
                    });
                }
                // Create stock entry
                const stockEntry = await tx.stockEntry.create({
                    data: {
                        productId,
                        quantity: entry.quantity,
                        costPrice: new library_1.Decimal(entry.costPrice),
                        batchNumber: entry.batchNumber || null,
                        expiryDate: entry.expiryDate ? new Date(entry.expiryDate) : null,
                        supplierName: entry.supplierName || 'N/A',
                        status: entry.status,
                        owedAmount: entry.status === 'ON_CREDIT' || entry.status === 'PARTIALLY_PAID'
                            ? new library_1.Decimal(entry.owedAmount || entry.costPrice * entry.quantity)
                            : new library_1.Decimal(0),
                        notes: entry.notes || null,
                    },
                    include: {
                        product: true,
                    },
                });
                createdEntries.push(stockEntry);
            }
            return createdEntries;
        });
        res.status(201).json({
            message: `${results.length} stock entry(ies) created successfully`,
            entries: results,
        });
    }
    catch (error) {
        console.error('Add stock error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
async function adjustStock(req, res) {
    try {
        const { productId, qtyChange, reason, notes } = req.body;
        if (!productId || qtyChange === undefined || !reason) {
            return res.status(400).json({
                error: 'Product ID, quantity change, and reason are required'
            });
        }
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const product = await prisma_1.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        // Check if adjustment would make stock negative
        const newStock = product.stockQty + qtyChange;
        if (newStock < 0) {
            return res.status(400).json({
                error: `Cannot adjust stock. Current: ${product.stockQty}, Change: ${qtyChange}, Result: ${newStock}`
            });
        }
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            // Create adjustment record
            const adjustment = await tx.stockAdjustment.create({
                data: {
                    productId,
                    qtyChange,
                    reason,
                    notes: notes || null,
                    createdBy: req.user.id,
                },
            });
            // Update product stock
            await tx.product.update({
                where: { id: productId },
                data: {
                    stockQty: {
                        increment: qtyChange,
                    },
                },
            });
            return adjustment;
        });
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Adjust stock error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getStockEntries(req, res) {
    try {
        const { productId, supplierName, status, startDate, endDate } = req.query;
        const where = {};
        if (productId)
            where.productId = productId;
        if (supplierName)
            where.supplierName = { contains: supplierName, mode: 'insensitive' };
        if (status)
            where.status = status;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate)
                where.createdAt.lte = new Date(endDate);
        }
        const entries = await prisma_1.prisma.stockEntry.findMany({
            where,
            include: {
                product: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json(entries);
    }
    catch (error) {
        console.error('Get stock entries error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getStockAdjustments(req, res) {
    try {
        const { productId, startDate, endDate } = req.query;
        const where = {};
        if (productId)
            where.productId = productId;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate)
                where.createdAt.lte = new Date(endDate);
        }
        const adjustments = await prisma_1.prisma.stockAdjustment.findMany({
            where,
            include: {
                product: true,
                creator: {
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
        res.json(adjustments);
    }
    catch (error) {
        console.error('Get stock adjustments error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=stock.controller.js.map