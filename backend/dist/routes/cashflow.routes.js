"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cashflow_controller_1 = require("../controllers/cashflow.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN', 'SALES'), cashflow_controller_1.getCashFlow);
router.get('/history', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN', 'SALES'), cashflow_controller_1.getCashFlowHistory);
router.post('/opening-balance', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN'), cashflow_controller_1.setDailyOpeningBalance);
router.get('/opening-balance', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN', 'SALES'), cashflow_controller_1.getDailyOpeningBalance);
router.get('/daily-sales', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN', 'SALES'), cashflow_controller_1.getDailySales);
exports.default = router;
//# sourceMappingURL=cashflow.routes.js.map