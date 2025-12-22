import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import salesRoutes from './routes/sales.routes';
import companiesRoutes from './routes/companies.routes';
import contactsRoutes from './routes/contacts.routes';
import stockRoutes from './routes/stock.routes';
import productsRoutes from './routes/products.routes';
import suppliersRoutes from './routes/suppliers.routes';
import paymentsRoutes from './routes/payments.routes';
import dashboardRoutes from './routes/dashboard.routes';
import usersRoutes from './routes/users.routes';
import expensesRoutes from './routes/expenses.routes';
import cashflowRoutes from './routes/cashflow.routes';
import profitlossRoutes from './routes/profitloss.routes';
import settingsRoutes from './routes/settings.routes';
import websiteRoutes from './routes/website.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/cash-flow', cashflowRoutes);
app.use('/api/profit-loss', profitlossRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/website', websiteRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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


