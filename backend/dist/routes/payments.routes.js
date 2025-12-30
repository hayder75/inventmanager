"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payments_controller_1 = require("../controllers/payments.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post('/receive', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN', 'SALES'), payments_controller_1.receivePayment);
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN', 'SALES'), payments_controller_1.getPayments);
router.get('/companies', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN', 'SALES'), payments_controller_1.getCompaniesWithBalance);
exports.default = router;
//# sourceMappingURL=payments.routes.js.map