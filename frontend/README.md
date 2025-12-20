# Frontend - Inventory Management System

## Overview
Modern Next.js frontend for Real Bright Trading Business Management System, connected to the Express backend API.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **State Management:** React Context API

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Run Development Server
```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

## Features Implemented

### ✅ Authentication
- Login page with test credentials display
- JWT token management
- Protected routes
- Role-based access control

### ✅ Dashboard
- Today's sales statistics
- Cash/Bank/Credit breakdown
- Profit calculation
- Low stock alerts

### ✅ Sales Management
- **New Sale Page:**
  - Walk-in or Company buyer selection
  - Product search and selection
  - Price override (can only increase)
  - Multiple payment methods (Cash, Bank, Credit)
  - Credit validation for companies
  - Automatic stock decrease
  
- **Sales List:**
  - View all sales
  - Search functionality
  - Filter by date/salesperson
  
- **Sale Details:**
  - Full invoice details
  - Item breakdown
  - Payment summary

### ✅ Companies Management (ADMIN only)
- CRUD operations
- Credit limit management
- Balance tracking
- Search functionality

### ✅ Contacts (Phone Book)
- Shared between ADMIN and SALES
- Quick add contacts
- Visibility control (ADMIN can hide from SALES)
- Search functionality

### ✅ Products
- View all products
- Stock levels and status
- Low stock indicators
- Edit products (ADMIN only)
- Search by name/code

### ✅ Stock Management (ADMIN only)
- **Add Stock:**
  - Single or batch entry
  - Auto product creation
  - Supplier tracking
  - Payment status (Fully Paid, Partially Paid, On Credit)
  - Batch number and expiry date support
  
- **Stock Adjustments:**
  - Manual corrections
  - Reason tracking (Damage, Theft, etc.)
  - Full audit trail

### ✅ Suppliers Owed (ADMIN only)
- View all suppliers with outstanding balances
- Record supplier payments
- Payment history

### ✅ Payments Received
- List companies with outstanding balance
- Record payments from companies
- Payment history
- Multiple payment methods

### ✅ User Management (ADMIN only)
- Create/edit users
- Role assignment (ADMIN/SALES)
- Password reset
- User deactivation

### ✅ Sales Performance (ADMIN only)
- Detailed per-salesperson report
- Bills, Cash, Bank, Credit breakdown
- Extra from price overrides
- Profit contribution

## Pages Structure

```
frontend-new/
├── src/
│   ├── app/
│   │   ├── login/              # Login page
│   │   ├── dashboard/          # Dashboard & performance
│   │   ├── sales/              # Sales pages
│   │   │   ├── new/           # New sale form
│   │   │   └── [id]/          # Sale details
│   │   ├── companies/          # Companies management
│   │   ├── contacts/          # Contact list
│   │   ├── products/          # Products list & edit
│   │   ├── stock/              # Stock management
│   │   │   ├── add/           # Add stock
│   │   │   └── adjustments/  # Stock adjustments
│   │   ├── suppliers/         # Suppliers owed
│   │   ├── payments/          # Payments received
│   │   └── users/             # User management
│   ├── components/
│   │   └── layout/            # Dashboard layout & sidebar
│   ├── context/
│   │   └── AuthContext.tsx    # Authentication context
│   └── lib/
│       └── api.ts             # Axios API client
```

## Design Features

- **Modern UI:** Clean, professional design inspired by modern inventory systems
- **Responsive:** Mobile-friendly with collapsible sidebar
- **Dark Sidebar:** Professional dark navigation sidebar
- **Color Coding:** Status indicators (green/yellow/red) for stock levels
- **Search:** Global search functionality in header
- **Notifications:** Bell icon for alerts (UI ready)
- **User Profile:** Avatar and role display

## API Integration

All pages are fully connected to the backend API:
- Base URL: `http://localhost:5000`
- Authentication: JWT tokens in Authorization header
- Error handling: Automatic token refresh and logout on 401
- Loading states: Spinners during data fetching

## Role-Based Access

### ADMIN Role
- Full access to all features
- Can manage users, companies, products, stock
- Can view sales performance reports
- Can manage supplier payments

### SALES Role
- Can create sales
- Can view products and stock (read-only)
- Can manage contacts
- Can receive payments from companies
- Can only view their own sales

## Test Credentials

- **Admin:** admin@test.com / admin123
- **Sales:** sales@test.com / sales123

## Key Workflow Features

1. **Unified Stock Entry:** Single or batch entry with auto product creation
2. **Price Override:** Sales can increase prices (never decrease)
3. **Credit Management:** Only companies can use credit
4. **Walk-in Sales:** Temporary name/phone (not saved as company)
5. **Contact List:** Shared phone book with visibility control
6. **Sales Performance:** Detailed per-salesperson reporting
7. **Stock Tracking:** Real-time stock with full history

## Next Steps

1. **Backend Connection:** Ensure backend is running on port 5000
2. **Testing:** Test all workflows with both ADMIN and SALES roles
3. **Enhancements:** Add more charts, reports, export functionality
4. **Mobile:** Optimize mobile experience further
5. **Print:** Add invoice/bill printing functionality

## Development

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start
```

The frontend is fully functional and ready to use! 🎉

