"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const website_controller_1 = require("../controllers/website.controller");
const router = (0, express_1.Router)();
// Public routes (no auth required)
router.get('/products', website_controller_1.getPublicProducts);
router.get('/products/new', website_controller_1.getNewProducts);
// Admin routes (auth required)
router.get('/admin/products', auth_middleware_1.authenticate, website_controller_1.getAllPublicProducts);
router.put('/admin/products/:id/website', auth_middleware_1.authenticate, website_controller_1.upload.single('image'), website_controller_1.updateProductWebsiteSettings);
router.patch('/admin/products/:id/toggle-visibility', auth_middleware_1.authenticate, website_controller_1.toggleProductVisibility);
router.patch('/admin/products/:id/toggle-new', auth_middleware_1.authenticate, website_controller_1.toggleProductNewStatus);
router.delete('/admin/products/:id/image', auth_middleware_1.authenticate, website_controller_1.deleteProductImage);
exports.default = router;
//# sourceMappingURL=website.routes.js.map