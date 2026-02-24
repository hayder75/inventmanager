"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const sales_routes_1 = __importDefault(require("./routes/sales.routes"));
const companies_routes_1 = __importDefault(require("./routes/companies.routes"));
const contacts_routes_1 = __importDefault(require("./routes/contacts.routes"));
const stock_routes_1 = __importDefault(require("./routes/stock.routes"));
const products_routes_1 = __importDefault(require("./routes/products.routes"));
const suppliers_routes_1 = __importDefault(require("./routes/suppliers.routes"));
const payments_routes_1 = __importDefault(require("./routes/payments.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const expenses_routes_1 = __importDefault(require("./routes/expenses.routes"));
const cashflow_routes_1 = __importDefault(require("./routes/cashflow.routes"));
const profitloss_routes_1 = __importDefault(require("./routes/profitloss.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const website_routes_1 = __importDefault(require("./routes/website.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files (uploaded images)
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/sales', sales_routes_1.default);
app.use('/api/companies', companies_routes_1.default);
app.use('/api/contacts', contacts_routes_1.default);
app.use('/api/stock', stock_routes_1.default);
app.use('/api/products', products_routes_1.default);
app.use('/api/suppliers', suppliers_routes_1.default);
app.use('/api/payments', payments_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/users', users_routes_1.default);
app.use('/api/expenses', expenses_routes_1.default);
app.use('/api/cash-flow', cashflow_routes_1.default);
app.use('/api/profit-loss', profitloss_routes_1.default);
app.use('/api/settings', settings_routes_1.default);
app.use('/api/website', website_routes_1.default);
app.use('/api/upload', upload_routes_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
//# sourceMappingURL=server.js.map