"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/stats', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN', 'SALES'), dashboard_controller_1.getDashboardStats);
router.get('/sales-performance', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN'), dashboard_controller_1.getSalesPerformance);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map