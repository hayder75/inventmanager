import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get public products (no auth required) - show all products by default
// showOnWebsite flag can be used to hide specific products if needed (set to false to hide)
export async function getPublicProducts(req: any, res: Response) {
  try {
    const products = await prisma.product.findMany({
      // Show all products - remove showOnWebsite filter to display all products
      // Admins can use showOnWebsite: false to hide specific products if needed
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        sellingPrice: true,
        category: true,
        stockQty: true,
        unit: true,
      },
    });
    // Transform to match frontend expectations
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      price: product.sellingPrice,
      category: product.category,
      stockQty: product.stockQty,
      unit: product.unit,
    }));
    res.json(transformedProducts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// Get new products (no auth required) - show all new products
export async function getNewProducts(req: any, res: Response) {
  try {
    const products = await prisma.product.findMany({
      where: { 
        isNew: true,
        // Show all new products regardless of showOnWebsite flag
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        sellingPrice: true,
        category: true,
        stockQty: true,
        unit: true,
        createdAt: true,
      },
    });
    // Transform to match frontend expectations
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      price: product.sellingPrice,
      unit: product.unit,
      category: product.category,
      stockQty: product.stockQty,
      createdAt: product.createdAt,
    }));
    res.json(transformedProducts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// Admin: Get all products for website management
export async function getAllPublicProducts(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        imageUrl: true,
        sellingPrice: true,
        category: true,
        stockQty: true,
        unit: true,
        showOnWebsite: true,
        isNew: true,
        notes: true,
      },
    });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// Admin: Update product image and website visibility
export async function updateProductWebsiteSettings(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const { id } = req.params;
    const { description, showOnWebsite, isNew } = req.body;
    const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : undefined;

    const updateData: any = {};
    if (description !== undefined) updateData.description = description;
    if (showOnWebsite !== undefined) updateData.showOnWebsite = showOnWebsite === 'true' || showOnWebsite === true;
    if (isNew !== undefined) updateData.isNew = isNew === 'true' || isNew === true;
    if (imageUrl) updateData.imageUrl = imageUrl;

    // If updating image, delete old image
    if (imageUrl) {
      const product = await prisma.product.findUnique({ where: { id } });
      if (product?.imageUrl) {
        const oldImagePath = path.join(__dirname, '../../', product.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        imageUrl: true,
        sellingPrice: true,
        category: true,
        stockQty: true,
        showOnWebsite: true,
        isNew: true,
        notes: true,
      },
    });
    res.json(updatedProduct);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// Admin: Toggle product visibility on website
export async function toggleProductVisibility(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const { id } = req.params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { showOnWebsite: !product.showOnWebsite },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        imageUrl: true,
        sellingPrice: true,
        category: true,
        stockQty: true,
        showOnWebsite: true,
        isNew: true,
        notes: true,
      },
    });
    res.json(updatedProduct);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// Admin: Toggle product "new" status
export async function toggleProductNewStatus(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const { id } = req.params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { isNew: !product.isNew },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        imageUrl: true,
        sellingPrice: true,
        category: true,
        stockQty: true,
        showOnWebsite: true,
        isNew: true,
        notes: true,
      },
    });
    res.json(updatedProduct);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// Admin: Delete product image
export async function deleteProductImage(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (product.imageUrl) {
      const imagePath = path.join(__dirname, '../../', product.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { imageUrl: null },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        imageUrl: true,
        sellingPrice: true,
        category: true,
        stockQty: true,
        showOnWebsite: true,
        notes: true,
      },
    });
    res.json(updatedProduct);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}



