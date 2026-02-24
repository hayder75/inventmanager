"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_controller_1 = require("../controllers/upload.controller");
const router = (0, express_1.Router)();
router.post('/bank-transfer', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN', 'SALES'), upload_controller_1.uploadBankTransfer.single('image'), upload_controller_1.uploadBankTransferImage);
exports.default = router;
//# sourceMappingURL=upload.routes.js.map