"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sales_controller_1 = require("../controllers/sales.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN', 'SALES'), sales_controller_1.createSale);
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN', 'SALES'), sales_controller_1.getSales);
router.get('/bank-deposits', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN'), sales_controller_1.getBankDeposits);
router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN', 'SALES'), sales_controller_1.getSaleById);
exports.default = router;
//# sourceMappingURL=sales.routes.js.map