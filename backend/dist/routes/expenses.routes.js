"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const expenses_controller_1 = require("../controllers/expenses.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN', 'SALES'), expenses_controller_1.createExpense);
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN', 'SALES'), expenses_controller_1.getExpenses);
router.get('/reports', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN'), expenses_controller_1.getExpenseReports);
router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN', 'SALES'), expenses_controller_1.getExpenseById);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN', 'SALES'), expenses_controller_1.updateExpense);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN'), expenses_controller_1.deleteExpense);
exports.default = router;
//# sourceMappingURL=expenses.routes.js.map