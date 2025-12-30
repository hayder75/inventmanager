"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const companies_controller_1 = require("../controllers/companies.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN'), companies_controller_1.createCompany);
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN', 'SALES'), companies_controller_1.getCompanies); // Allow SALES to read companies
router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN'), companies_controller_1.getCompanyById);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN'), companies_controller_1.updateCompany);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN'), companies_controller_1.deleteCompany);
exports.default = router;
//# sourceMappingURL=companies.routes.js.map