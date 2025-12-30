"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const suppliers_controller_1 = require("../controllers/suppliers.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/owed', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN'), suppliers_controller_1.getSuppliersOwed);
router.post('/pay', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN'), suppliers_controller_1.recordSupplierPayment);
router.get('/payments', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN'), suppliers_controller_1.getSupplierPayments);
exports.default = router;
//# sourceMappingURL=suppliers.routes.js.map