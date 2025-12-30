"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = getDashboardStats;
exports.getSalesPerformance = getSalesPerformance;
const prisma_1 = require("../utils/prisma");
const library_1 = require("@prisma/client/runtime/library");
async function getDashboardStats(req, res) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        // Today's sales
        const todaySales = await prisma_1.prisma.sale.findMany({
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });
        const totalSales = todaySales.reduce((sum, sale) => sum.plus(sale.totalAmount), new library_1.Decimal(0));
        const cashCollected = todaySales.reduce((sum, sale) => sum.plus(sale.totalPaid), new library_1.Decimal(0));
        const creditSales = todaySales.reduce((sum, sale) => sum.plus(sale.totalCredit), new library_1.Decimal(0));
        // Calculate profit (using admin prices)
        let profit = new library_1.Decimal(0);
        for (const sale of todaySales) {
            const items = await prisma_1.prisma.saleItem.findMany({
                where: { saleId: sale.id },
                include: { product: true },
            });
            for (const item of items) {
                const cost = item.product.costPrice.times(item.quantity);
                const revenue = item.adminPrice.times(item.quantity);
                profit = profit.plus(revenue.minus(cost));
            }
        }
        // Low stock alerts
        const products = await prisma_1.prisma.product.findMany();
        const lowStockProducts = products.filter(p => p.stockQty <= p.lowStockAlert);
        // Bank collected (from payments)
        const todayPayments = await prisma_1.prisma.paymentReceived.findMany({
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
                method: 'BANK_TRANSFER',
            },
        });
        const bankCollected = todayPayments.reduce((sum, payment) => sum.plus(payment.amount), new library_1.Decimal(0));
        // Today's expenses
        const todayExpenses = await prisma_1.prisma.expense.findMany({
            where: {
                expenseDate: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });
        const totalExpenses = todayExpenses.reduce((sum, expense) => sum.plus(expense.amount), new library_1.Decimal(0));
        // Total products count
        const totalProducts = await prisma_1.prisma.product.count();
        // Total sales count today
        const totalBills = todaySales.length;
        // Recent sales (last 5)
        const recentSales = await prisma_1.prisma.sale.findMany({
            take: 5,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                salesperson: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        // Total customers/contacts
        const totalContacts = await prisma_1.prisma.contact.count();
        // Pending credit (total credit not yet paid)
        // Get all sales with credit and calculate remaining credit
        const allSalesWithCredit = await prisma_1.prisma.sale.findMany({
            where: {
                totalCredit: {
                    gt: 0,
                },
            },
        });
        const totalPendingCredit = allSalesWithCredit.reduce((sum, sale) => {
            // Remaining credit = total credit - total paid
            const remainingCredit = sale.totalCredit.minus(sale.totalPaid);
            return remainingCredit.gt(0) ? sum.plus(remainingCredit) : sum;
        }, new library_1.Decimal(0));
        res.json({
            today: {
                totalSales: totalSales.toString(),
                cashCollected: cashCollected.toString(),
                bankCollected: bankCollected.toString(),
                creditSales: creditSales.toString(),
                profit: profit.toString(),
                expenses: totalExpenses.toString(),
                bills: totalBills,
            },
            overview: {
                totalProducts: totalProducts,
                totalContacts: totalContacts,
                pendingCredit: totalPendingCredit.toString(),
            },
            lowStockAlerts: lowStockProducts.length,
            lowStockProducts: lowStockProducts.map(p => ({
                id: p.id,
                name: p.name,
                stockQty: p.stockQty,
                lowStockAlert: p.lowStockAlert,
            })),
            recentSales: recentSales.map(sale => ({
                id: sale.id,
                totalAmount: sale.totalAmount.toString(),
                createdAt: sale.createdAt.toISOString(),
                salespersonName: sale.salesperson.name,
            })),
        });
    }
    catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getSalesPerformance(req, res) {
    try {
        const { startDate, endDate } = req.query;
        const where = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate)
                where.createdAt.lte = new Date(endDate);
        }
        const sales = await prisma_1.prisma.sale.findMany({
            where,
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                salesperson: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                payments: true,
            },
        });
        // Group by salesperson
        const performanceMap = new Map();
        for (const sale of sales) {
            const salespersonId = sale.salespersonId;
            const salespersonName = sale.salesperson.name;
            if (!performanceMap.has(salespersonId)) {
                performanceMap.set(salespersonId, {
                    salespersonId,
                    salespersonName,
                    bills: 0,
                    cash: new library_1.Decimal(0),
                    bank: new library_1.Decimal(0),
                    creditGiven: new library_1.Decimal(0),
                    totalSold: new library_1.Decimal(0),
                    extraFromOverride: new library_1.Decimal(0),
                    profitContributed: new library_1.Decimal(0),
                });
            }
            const perf = performanceMap.get(salespersonId);
            perf.bills += 1;
            // Calculate payment breakdown
            const cashPayments = sale.payments.filter(p => p.method === 'CASH');
            const bankPayments = sale.payments.filter(p => p.method === 'BANK_TRANSFER');
            perf.cash = perf.cash.plus(cashPayments.reduce((sum, p) => sum.plus(p.amount), new library_1.Decimal(0)));
            perf.bank = perf.bank.plus(bankPayments.reduce((sum, p) => sum.plus(p.amount), new library_1.Decimal(0)));
            perf.creditGiven = perf.creditGiven.plus(sale.totalCredit);
            perf.totalSold = perf.totalSold.plus(sale.totalPaid);
            // Calculate extra from price overrides
            for (const item of sale.items) {
                if (item.overriddenPrice && item.overriddenPrice.gt(item.adminPrice)) {
                    const extra = item.overriddenPrice
                        .minus(item.adminPrice)
                        .times(item.quantity);
                    perf.extraFromOverride = perf.extraFromOverride.plus(extra);
                }
                // Calculate profit (revenue - cost)
                const revenue = item.adminPrice.times(item.quantity);
                const cost = item.product.costPrice.times(item.quantity);
                perf.profitContributed = perf.profitContributed.plus(revenue.minus(cost));
            }
        }
        // Get commission data from users
        const salespersonIds = Array.from(performanceMap.keys());
        const users = await prisma_1.prisma.user.findMany({
            where: {
                id: { in: salespersonIds },
                role: 'SALES',
            },
            select: {
                id: true,
                totalCommission: true,
            },
        });
        const commissionMap = new Map();
        users.forEach(user => {
            commissionMap.set(user.id, user.totalCommission);
        });
        const performance = Array.from(performanceMap.values()).map(perf => ({
            salespersonId: perf.salespersonId,
            salespersonName: perf.salespersonName,
            bills: perf.bills,
            cash: perf.cash.toString(),
            bank: perf.bank.toString(),
            creditGiven: perf.creditGiven.toString(),
            totalSold: perf.totalSold.toString(),
            extraFromOverride: perf.extraFromOverride.toString(),
            profitContributed: perf.profitContributed.toString(),
            commission: commissionMap.get(perf.salespersonId)?.toString() || '0',
        }));
        res.json(performance);
    }
    catch (error) {
        console.error('Get sales performance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=dashboard.controller.js.map