"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const daily_summary_controller_1 = require("../controllers/daily-summary.controller");
const router = (0, express_1.Router)();
router.get('/summary', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN', 'SALES'), daily_summary_controller_1.getDailySummary);
exports.default = router;
//# sourceMappingURL=daily-summary.routes.js.map