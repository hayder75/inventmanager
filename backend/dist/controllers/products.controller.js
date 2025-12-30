"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProducts = getProducts;
exports.getProductById = getProductById;
exports.updateProduct = updateProduct;
const prisma_1 = require("../utils/prisma");
const library_1 = require("@prisma/client/runtime/library");
async function getProducts(req, res) {
    try {
        const { search, category, lowStock } = req.query;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (category) {
            where.category = category;
        }
        if (lowStock === 'true') {
            const products = await prisma_1.prisma.product.findMany({ where });
            const lowStockProducts = products.filter(p => p.stockQty <= p.lowStockAlert);
            return res.json(lowStockProducts);
        }
        const products = await prisma_1.prisma.product.findMany({
            where,
            orderBy: {
                name: 'asc',
            },
        });
        res.json(products);
    }
    catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getProductById(req, res) {
    try {
        const { id } = req.params;
        const product = await prisma_1.prisma.product.findUnique({
            where: { id },
            include: {
                stockEntries: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 50,
                },
                stockAdjustments: {
                    include: {
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
                    take: 50,
                },
            },
        });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function updateProduct(req, res) {
    try {
        const { id } = req.params;
        const { name, code, category, costPrice, sellingPrice, lowStockAlert, notes } = req.body;
        const updateData = {};
        if (name)
            updateData.name = name;
        if (code !== undefined)
            updateData.code = code;
        if (category !== undefined)
            updateData.category = category;
        if (costPrice !== undefined)
            updateData.costPrice = new library_1.Decimal(costPrice);
        if (sellingPrice !== undefined)
            updateData.sellingPrice = new library_1.Decimal(sellingPrice);
        if (lowStockAlert !== undefined)
            updateData.lowStockAlert = parseInt(lowStockAlert);
        if (notes !== undefined)
            updateData.notes = notes;
        const product = await prisma_1.prisma.product.update({
            where: { id },
            data: updateData,
        });
        res.json(product);
    }
    catch (error) {
        console.error('Update product error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=products.controller.js.map