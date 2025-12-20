# Backend API - Inventory Management System

## Overview
Backend API for Real Bright Trading Business Management System built with Node.js, Express, PostgreSQL, and Prisma ORM.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
The database should already be created. If not:
```bash
# Create database (PostgreSQL password: postgres)
sudo -u postgres psql -c "CREATE DATABASE inventmanager;"
```

### 3. Environment Variables
Create a `.env` file in the backend directory:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/inventmanager?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="24h"
PORT=5000
NODE_ENV=development
```

### 4. Run Migrations
```bash
npx prisma migrate dev
```

### 5. Seed Database
```bash
npm run prisma:seed
```

This creates default users:
- **Admin:** admin@test.com / admin123
- **Sales:** sales@test.com / sales123

### 6. Start Server
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (admin only)
- `GET /api/auth/verify` - Verify token

### Sales
- `POST /api/sales` - Create new sale (SALES, ADMIN)
- `GET /api/sales` - List sales (SALES, ADMIN)
- `GET /api/sales/:id` - Get sale details (SALES, ADMIN)

### Companies (Credit Customers)
- `POST /api/companies` - Create company (ADMIN only)
- `GET /api/companies` - List companies (ADMIN only)
- `GET /api/companies/:id` - Get company details (ADMIN only)
- `PUT /api/companies/:id` - Update company (ADMIN only)
- `DELETE /api/companies/:id` - Delete company (ADMIN only)

### Contacts (Phone Book)
- `POST /api/contacts` - Create contact (SALES, ADMIN)
- `GET /api/contacts` - List contacts (SALES, ADMIN)
- `PUT /api/contacts/:id` - Update contact (SALES, ADMIN)
- `DELETE /api/contacts/:id` - Delete contact (SALES, ADMIN)

### Stock Management
- `POST /api/stock/add` - Add stock (single or batch) (ADMIN only)
- `POST /api/stock/adjust` - Manual stock adjustment (ADMIN only)
- `GET /api/stock/entries` - Get stock entries (ADMIN only)
- `GET /api/stock/adjustments` - Get stock adjustments (ADMIN only)

### Products
- `GET /api/products` - List products (SALES, ADMIN)
- `GET /api/products/:id` - Get product details (SALES, ADMIN)
- `PATCH /api/products/:id` - Update product (ADMIN only)

### Suppliers
- `GET /api/suppliers/owed` - Get suppliers owed (ADMIN only)
- `POST /api/suppliers/pay` - Record supplier payment (ADMIN only)
- `GET /api/suppliers/payments` - Get supplier payments (ADMIN only)

### Payments
- `POST /api/payments/receive` - Receive payment from company (SALES, ADMIN)
- `GET /api/payments` - List payments (SALES, ADMIN)
- `GET /api/payments/companies` - Get companies with balance (SALES, ADMIN)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (SALES, ADMIN)
- `GET /api/dashboard/sales-performance` - Get sales performance report (ADMIN only)

### Users
- `POST /api/users` - Create user (ADMIN only)
- `GET /api/users` - List users (ADMIN only)
- `GET /api/users/:id` - Get user details (ADMIN only)
- `PUT /api/users/:id` - Update user (ADMIN only)
- `POST /api/users/:id/reset-password` - Reset user password (ADMIN only)
- `DELETE /api/users/:id` - Deactivate user (ADMIN only)

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Role-Based Access Control

### ADMIN Role
- Full access to all endpoints
- Can manage users, companies, products, stock
- Can view all sales and reports

### SALES Role
- Can create sales
- Can view products and stock (read-only)
- Can manage contacts
- Can receive payments from companies
- Can only view their own sales

## Database Schema

### Key Tables
- **users** - User accounts (ADMIN/SALES)
- **companies** - Credit customers only
- **contacts** - Quick phone book
- **products** - Product catalog
- **stock_entries** - Stock additions (replaces purchases)
- **stock_adjustments** - Manual stock corrections
- **sales** - Sales transactions
- **sale_items** - Sale line items (tracks price overrides)
- **payments_received** - Payments from companies
- **supplier_payments** - Payments to suppliers

## Key Features

1. **Unified Stock Entry** - Single/batch stock entry with automatic product creation
2. **Price Override** - Sales can increase prices (never decrease)
3. **Credit Management** - Only companies can use credit
4. **Walk-in Sales** - Temporary name/phone (not saved as company)
5. **Contact List** - Shared phone book with visibility control
6. **Sales Performance** - Detailed per-salesperson reporting
7. **Stock Tracking** - Real-time stock with history

## Development

### Prisma Commands
```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npx prisma migrate dev --name <migration_name>

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Seed database
npm run prisma:seed
```

### Project Structure
```
backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── routes/         # API routes
│   ├── middleware/     # Auth & validation
│   ├── utils/          # Helper functions
│   └── server.ts       # Express app entry
├── prisma/
│   ├── schema.prisma   # Database schema
│   ├── migrations/     # Database migrations
│   └── seed.ts         # Seed data
└── package.json
```

## Notes

- All monetary values use Prisma Decimal type for precision
- Stock cannot go negative
- Credit can only be used for companies
- Sales can only increase prices (never decrease below admin price)
- All stock movements are tracked in history
- Soft delete for users (deactivation)


