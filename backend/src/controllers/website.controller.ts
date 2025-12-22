import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../../uploads');
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

// Get public products (no auth required)
export async function getPublicProducts(req: any, res: Response) {
  try {
    const products = await prisma.publicProduct.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// Admin: Get all products (including inactive)
export async function getAllPublicProducts(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const products = await prisma.publicProduct.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// Admin: Create product
export async function createPublicProduct(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const { name, description, price, category, displayOrder } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const product = await prisma.publicProduct.create({
      data: {
        name,
        description,
        price: price ? parseFloat(price) : null,
        category,
        imageUrl,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
        isActive: true,
      },
    });
    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// Admin: Update product
export async function updatePublicProduct(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const { id } = req.params;
    const { name, description, price, category, displayOrder, isActive } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updateData: any = {
      name,
      description,
      price: price ? parseFloat(price) : null,
      category,
      displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      isActive: isActive !== undefined ? isActive === 'true' || isActive === true : true,
    };
    if (imageUrl) updateData.imageUrl = imageUrl;

    const product = await prisma.publicProduct.update({
      where: { id },
      data: updateData,
    });
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// Admin: Delete product
export async function deletePublicProduct(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const { id } = req.params;
    
    const product = await prisma.publicProduct.findUnique({ where: { id } });
    if (product?.imageUrl) {
      const imagePath = path.join(__dirname, '../../', product.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await prisma.publicProduct.delete({ where: { id } });
    res.json({ message: 'Product deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

