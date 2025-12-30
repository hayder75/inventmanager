"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
exports.getPublicProducts = getPublicProducts;
exports.getNewProducts = getNewProducts;
exports.getAllPublicProducts = getAllPublicProducts;
exports.updateProductWebsiteSettings = updateProductWebsiteSettings;
exports.toggleProductVisibility = toggleProductVisibility;
exports.toggleProductNewStatus = toggleProductNewStatus;
exports.deleteProductImage = deleteProductImage;
const prisma_1 = require("../utils/prisma");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configure multer for file uploads
const uploadDir = path_1.default.join(__dirname, '../../uploads/products');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
// Get public products (no auth required) - from inventory where showOnWebsite = true
async function getPublicProducts(req, res) {
    try {
        const products = await prisma_1.prisma.product.findMany({
            where: { showOnWebsite: true },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                description: true,
                imageUrl: true,
                sellingPrice: true,
                category: true,
                stockQty: true,
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
        }));
        res.json(transformedProducts);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// Get new products (no auth required) - from inventory where showOnWebsite = true AND isNew = true
async function getNewProducts(req, res) {
    try {
        const products = await prisma_1.prisma.product.findMany({
            where: {
                showOnWebsite: true,
                isNew: true,
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
            category: product.category,
            stockQty: product.stockQty,
            createdAt: product.createdAt,
        }));
        res.json(transformedProducts);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// Admin: Get all products for website management
async function getAllPublicProducts(req, res) {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const products = await prisma_1.prisma.product.findMany({
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
                showOnWebsite: true,
                isNew: true,
                notes: true,
            },
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// Admin: Update product image and website visibility
async function updateProductWebsiteSettings(req, res) {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { id } = req.params;
        const { description, showOnWebsite, isNew } = req.body;
        const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : undefined;
        const updateData = {};
        if (description !== undefined)
            updateData.description = description;
        if (showOnWebsite !== undefined)
            updateData.showOnWebsite = showOnWebsite === 'true' || showOnWebsite === true;
        if (isNew !== undefined)
            updateData.isNew = isNew === 'true' || isNew === true;
        if (imageUrl)
            updateData.imageUrl = imageUrl;
        // If updating image, delete old image
        if (imageUrl) {
            const product = await prisma_1.prisma.product.findUnique({ where: { id } });
            if (product?.imageUrl) {
                const oldImagePath = path_1.default.join(__dirname, '../../', product.imageUrl);
                if (fs_1.default.existsSync(oldImagePath)) {
                    fs_1.default.unlinkSync(oldImagePath);
                }
            }
        }
        const updatedProduct = await prisma_1.prisma.product.update({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// Admin: Toggle product visibility on website
async function toggleProductVisibility(req, res) {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { id } = req.params;
        const product = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const updatedProduct = await prisma_1.prisma.product.update({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// Admin: Toggle product "new" status
async function toggleProductNewStatus(req, res) {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { id } = req.params;
        const product = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const updatedProduct = await prisma_1.prisma.product.update({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// Admin: Delete product image
async function deleteProductImage(req, res) {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { id } = req.params;
        const product = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        if (product.imageUrl) {
            const imagePath = path_1.default.join(__dirname, '../../', product.imageUrl);
            if (fs_1.default.existsSync(imagePath)) {
                fs_1.default.unlinkSync(imagePath);
            }
        }
        const updatedProduct = await prisma_1.prisma.product.update({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
//# sourceMappingURL=website.controller.js.map