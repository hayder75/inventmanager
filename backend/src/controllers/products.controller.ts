import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function getProducts(req: AuthRequest, res: Response) {
  try {
    const { search, category, lowStock } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { code: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (category) {
      if (category === 'Uncategorized') {
        where.category = null;
      } else {
        where.category = category as string;
      }
    }


    if (lowStock === 'true') {
      const products = await prisma.product.findMany({ where });
      const lowStockProducts = products.filter(p => p.stockQty <= p.lowStockAlert);
      return res.json(lowStockProducts);
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    res.json(products);
  } catch (error: any) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createProduct(req: AuthRequest, res: Response) {
  try {
    const { name, code, category, unit, costPrice, sellingPrice, stockQty, piecesPerUnit, lowStockAlert } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ error: 'Category is required.' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        code: code || null,
        category: category.trim(),
        unit: unit || 'pcs',
        piecesPerUnit: piecesPerUnit || 1,
        costPrice: new Decimal(costPrice || 0),
        sellingPrice: new Decimal(sellingPrice || 0),
        stockQty: stockQty || 0,
        lowStockAlert: lowStockAlert ?? 10,
      },
    });

    res.status(201).json(product);
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export async function getProductById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
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
  } catch (error: any) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateProduct(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, code, category, costPrice, sellingPrice, lowStockAlert, notes } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (category !== undefined) updateData.category = category;
    if (costPrice !== undefined) updateData.costPrice = new Decimal(costPrice);
    if (sellingPrice !== undefined) updateData.sellingPrice = new Decimal(sellingPrice);
    if (lowStockAlert !== undefined) updateData.lowStockAlert = parseInt(lowStockAlert);
    if (notes !== undefined) updateData.notes = notes;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    res.json(product);
  } catch (error: any) {
    console.error('Update product error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteProduct(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        saleItems: {
          take: 1,
        },
        stockEntries: {
          take: 1,
        },
        stockAdjustments: {
          take: 1,
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product has been used in sales
    if (product.saleItems.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete product that has been used in sales. Consider marking it as inactive instead.'
      });
    }

    // Delete related records first (in a transaction)
    await prisma.$transaction(async (tx) => {
      // Delete stock adjustments
      await tx.stockAdjustment.deleteMany({
        where: { productId: id },
      });

      // Delete stock entries
      await tx.stockEntry.deleteMany({
        where: { productId: id },
      });

      // Now delete the product
      await tx.product.delete({
        where: { id },
      });
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({
        error: 'Cannot delete product due to existing relationships. Please contact support.'
      });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export async function getCategories(req: AuthRequest, res: Response) {
  try {
    // Get all unique categories from products
    const products = await prisma.product.findMany({
      where: {
        category: {
          not: null,
        },
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    const categories = products
      .map(p => p.category)
      .filter((cat): cat is string => cat !== null)
      .sort();

    res.json(categories);
  } catch (error: any) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getProductMetrics(req: AuthRequest, res: Response) {
  try {
    const products = await prisma.product.findMany();

    const metricsByCategory: Record<string, {
      count: number;
      stockLevel: number;
      totalCost: number;
      totalSelling: number;
    }> = {};

    let grandTotalCost = 0;
    let grandTotalSelling = 0;

    products.forEach(p => {
      const category = p.category || 'Uncategorized';
      if (!metricsByCategory[category]) {
        metricsByCategory[category] = { count: 0, stockLevel: 0, totalCost: 0, totalSelling: 0 };
      }

      const costValue = Number(p.costPrice) * p.stockQty;
      const sellingValue = Number(p.sellingPrice) * p.stockQty;

      metricsByCategory[category].count++;
      metricsByCategory[category].stockLevel += p.stockQty;
      metricsByCategory[category].totalCost += costValue;
      metricsByCategory[category].totalSelling += sellingValue;

      grandTotalCost += costValue;
      grandTotalSelling += sellingValue;
    });

    const categories = Object.keys(metricsByCategory).map(name => ({
      name,
      ...metricsByCategory[name]
    })).sort((a, b) => a.name.localeCompare(b.name));

    res.json({
      categories,
      grandTotalCost,
      grandTotalSelling,
      totalProducts: products.length,
      totalStockItems: products.reduce((acc, p) => acc + p.stockQty, 0)
    });
  } catch (error: any) {
    console.error('Get product metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}



