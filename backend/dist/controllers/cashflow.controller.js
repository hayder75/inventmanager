"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCashFlow = getCashFlow;
exports.getCashFlowHistory = getCashFlowHistory;
exports.setDailyOpeningBalance = setDailyOpeningBalance;
exports.getDailyOpeningBalance = getDailyOpeningBalance;
exports.getDailySales = getDailySales;
const prisma_1 = require("../utils/prisma");
const library_1 = require("@prisma/client/runtime/library");
async function getCashFlow(req, res) {
    try {
        const { date } = req.query;
        // Use provided date or today
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        // Get opening balance - check in this order:
        // 1. Manual opening balance for this specific date
        // 2. Consistent daily opening balance setting (if enabled)
        // 3. Previous day's closing balance (default)
        let openingBalance = new library_1.Decimal(0);
        // Check for manual opening balance for this date
        const manualOpening = await prisma_1.prisma.dailyOpeningBalance.findUnique({
            where: {
                date: targetDate,
            },
        });
        if (manualOpening) {
            openingBalance = manualOpening.amount;
        }
        else {
            // Check for consistent daily opening balance setting
            const consistentBalanceSetting = await prisma_1.prisma.setting.findUnique({
                where: { key: 'consistent_daily_opening_balance_enabled' },
            });
            const consistentBalanceAmount = await prisma_1.prisma.setting.findUnique({
                where: { key: 'consistent_daily_opening_balance_amount' },
            });
            if (consistentBalanceSetting?.value === 'true' && consistentBalanceAmount) {
                // Check if this setting was enabled before or on this date
                const settingEnabledDate = new Date(consistentBalanceSetting.updatedAt);
                settingEnabledDate.setHours(0, 0, 0, 0);
                if (targetDate >= settingEnabledDate) {
                    openingBalance = new library_1.Decimal(consistentBalanceAmount.value);
                }
                else {
                    // Setting enabled after this date, use previous day's closing
                    const previousDay = new Date(targetDate);
                    previousDay.setDate(previousDay.getDate() - 1);
                    previousDay.setHours(0, 0, 0, 0);
                    const previousDayEnd = new Date(previousDay);
                    previousDayEnd.setDate(previousDayEnd.getDate() + 1);
                    const previousDayCashFlow = await calculateDayCashFlow(previousDay, previousDayEnd, new library_1.Decimal(0));
                    openingBalance = previousDayCashFlow.closingBalance;
                }
            }
            else {
                // No consistent balance, use previous day's closing
                const previousDay = new Date(targetDate);
                previousDay.setDate(previousDay.getDate() - 1);
                previousDay.setHours(0, 0, 0, 0);
                const previousDayEnd = new Date(previousDay);
                previousDayEnd.setDate(previousDayEnd.getDate() + 1);
                const previousDayCashFlow = await calculateDayCashFlow(previousDay, previousDayEnd, new library_1.Decimal(0));
                openingBalance = previousDayCashFlow.closingBalance;
            }
        }
        // Calculate today's cash flow
        const cashFlow = await calculateDayCashFlow(targetDate, nextDay, openingBalance);
        // Calculate total: Opening Balance + Cash Sales + Bank Deposits + Surplus - Expenses (what sales have left)
        const totalAmount = openingBalance.plus(cashFlow.cashSales).plus(cashFlow.bankDeposits).plus(cashFlow.surplus).minus(cashFlow.cashExpenses);
        res.json({
            date: targetDate.toISOString().split('T')[0],
            openingBalance: openingBalance.toString(),
            cashSales: cashFlow.cashSales.toString(),
            bankDeposits: cashFlow.bankDeposits.toString(),
            surplus: cashFlow.surplus.toString(),
            expenses: cashFlow.expenses.toString(),
            closingBalance: cashFlow.closingBalance.toString(),
            totalAmount: totalAmount.toString(), // Opening + Daily Sales + Surplus
            breakdown: {
                cashIn: {
                    cashSales: cashFlow.cashSales.toString(),
                    bankDeposits: cashFlow.bankDeposits.toString(),
                    surplus: cashFlow.surplus.toString(),
                    total: cashFlow.cashSales.plus(cashFlow.bankDeposits).plus(cashFlow.surplus).toString(),
                },
                cashOut: {
                    expenses: cashFlow.expenses.toString(),
                },
            },
        });
    }
    catch (error) {
        console.error('Get cash flow error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function calculateDayCashFlow(startDate, endDate, openingBalance = new library_1.Decimal(0)) {
    // Cash sales (from sales with CASH payment method)
    const cashSales = await prisma_1.prisma.sale.findMany({
        where: {
            createdAt: {
                gte: startDate,
                lt: endDate,
            },
            payments: {
                some: {
                    method: 'CASH',
                },
            },
        },
        include: {
            payments: true,
        },
    });
    let cashSalesTotal = new library_1.Decimal(0);
    for (const sale of cashSales) {
        const cashPayments = sale.payments.filter(p => p.method === 'CASH');
        cashSalesTotal = cashSalesTotal.plus(cashPayments.reduce((sum, p) => sum.plus(p.amount), new library_1.Decimal(0)));
    }
    // Also include walk-in sales paid in cash (totalPaid when no company AND no bankType)
    const walkInCashSales = await prisma_1.prisma.sale.findMany({
        where: {
            createdAt: {
                gte: startDate,
                lt: endDate,
            },
            companyId: null,
            bankType: null, // No bank type = cash payment
            totalPaid: {
                gt: 0,
            },
        },
    });
    for (const sale of walkInCashSales) {
        cashSalesTotal = cashSalesTotal.plus(sale.totalPaid);
    }
    // Bank deposits - from two sources:
    // 1. PaymentReceived table (payments from companies)
    const bankPayments = await prisma_1.prisma.paymentReceived.findMany({
        where: {
            createdAt: {
                gte: startDate,
                lt: endDate,
            },
            method: 'BANK_TRANSFER',
        },
    });
    let bankDeposits = bankPayments.reduce((sum, payment) => sum.plus(payment.amount), new library_1.Decimal(0));
    // 2. Sales with bankType (walk-in sales paid via bank transfer)
    const bankSales = await prisma_1.prisma.sale.findMany({
        where: {
            createdAt: {
                gte: startDate,
                lt: endDate,
            },
            bankType: { not: null }, // Has bank type (bank transfer)
            totalPaid: { gt: 0 },
        },
    });
    for (const sale of bankSales) {
        bankDeposits = bankDeposits.plus(sale.totalPaid);
    }
    // Calculate surplus (remaining surplus from sale items - what goes to surplus money system)
    const salesWithItems = await prisma_1.prisma.sale.findMany({
        where: {
            createdAt: {
                gte: startDate,
                lt: endDate,
            },
        },
        include: {
            items: true,
        },
    });
    let totalSurplus = new library_1.Decimal(0);
    for (const sale of salesWithItems) {
        for (const item of sale.items) {
            if (item.remainingSurplus && item.remainingSurplus.gt(0)) {
                totalSurplus = totalSurplus.plus(item.remainingSurplus);
            }
        }
    }
    // Expenses
    const expenses = await prisma_1.prisma.expense.findMany({
        where: {
            expenseDate: {
                gte: startDate,
                lt: endDate,
            },
        },
    });
    const cashExpenses = expenses
        .filter(e => e.paymentMethod === 'CASH')
        .reduce((sum, e) => sum.plus(e.amount), new library_1.Decimal(0));
    const bankExpenses = expenses
        .filter(e => e.paymentMethod === 'BANK_TRANSFER')
        .reduce((sum, e) => sum.plus(e.amount), new library_1.Decimal(0));
    // Calculate closing balance (for cash only - opening + cash sales + surplus - cash expenses)
    const closingBalance = openingBalance.plus(cashSalesTotal).plus(totalSurplus).minus(cashExpenses);
    return {
        cashSales: cashSalesTotal,
        bankDeposits,
        expenses: cashExpenses.plus(bankExpenses),
        cashExpenses,
        bankExpenses,
        closingBalance,
        surplus: totalSurplus,
    };
}
async function getCashFlowHistory(req, res) {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({
                error: 'Start date and end date are required',
            });
        }
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        const history = [];
        let currentDate = new Date(start);
        let previousClosingBalance = new library_1.Decimal(0);
        while (currentDate <= end) {
            const dayStart = new Date(currentDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);
            const dayCashFlow = await calculateDayCashFlow(dayStart, dayEnd, previousClosingBalance);
            const openingBalance = previousClosingBalance;
            const closingBalance = dayCashFlow.closingBalance;
            history.push({
                date: dayStart.toISOString().split('T')[0],
                openingBalance: openingBalance.toString(),
                cashSales: dayCashFlow.cashSales.toString(),
                bankDeposits: dayCashFlow.bankDeposits.toString(),
                expenses: dayCashFlow.expenses.toString(),
                closingBalance: closingBalance.toString(),
            });
            previousClosingBalance = closingBalance;
            currentDate.setDate(currentDate.getDate() + 1);
        }
        res.json(history);
    }
    catch (error) {
        console.error('Get cash flow history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// Create or update daily opening balance
async function setDailyOpeningBalance(req, res) {
    try {
        const { date, amount, notes } = req.body;
        if (!date || amount === undefined) {
            return res.status(400).json({
                error: 'Date and amount are required',
            });
        }
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Only ADMIN can set opening balance
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only ADMIN can set opening balance' });
        }
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const openingBalance = await prisma_1.prisma.dailyOpeningBalance.upsert({
            where: {
                date: targetDate,
            },
            update: {
                amount: new library_1.Decimal(amount),
                notes: notes || null,
                updatedAt: new Date(),
            },
            create: {
                date: targetDate,
                amount: new library_1.Decimal(amount),
                notes: notes || null,
                createdBy: req.user.id,
            },
        });
        res.json(openingBalance);
    }
    catch (error) {
        console.error('Set daily opening balance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// Get daily opening balance
async function getDailyOpeningBalance(req, res) {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const openingBalance = await prisma_1.prisma.dailyOpeningBalance.findUnique({
            where: {
                date: targetDate,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        res.json(openingBalance || null);
    }
    catch (error) {
        console.error('Get daily opening balance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// Get daily sales amount for calendar
async function getDailySales(req, res) {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        const sales = await prisma_1.prisma.sale.findMany({
            where: {
                createdAt: {
                    gte: start,
                    lte: end,
                },
            },
            select: {
                createdAt: true,
                totalAmount: true,
            },
        });
        // Group by date
        const dailySales = {};
        for (const sale of sales) {
            const dateKey = sale.createdAt.toISOString().split('T')[0];
            if (!dailySales[dateKey]) {
                dailySales[dateKey] = new library_1.Decimal(0);
            }
            dailySales[dateKey] = dailySales[dateKey].plus(sale.totalAmount);
        }
        // Convert to array format
        const result = Object.entries(dailySales).map(([date, amount]) => ({
            date,
            amount: amount.toString(),
        }));
        res.json(result);
    }
    catch (error) {
        console.error('Get daily sales error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=cashflow.controller.js.map