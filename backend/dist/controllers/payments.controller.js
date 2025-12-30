"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receivePayment = receivePayment;
exports.getPayments = getPayments;
exports.getCompaniesWithBalance = getCompaniesWithBalance;
const prisma_1 = require("../utils/prisma");
const library_1 = require("@prisma/client/runtime/library");
async function receivePayment(req, res) {
    try {
        const { companyId, saleId, amount, method, notes } = req.body;
        if (!companyId || !amount || !method) {
            return res.status(400).json({
                error: 'Company ID, amount, and payment method are required'
            });
        }
        if (!['CASH', 'BANK_TRANSFER'].includes(method)) {
            return res.status(400).json({
                error: 'Payment method must be CASH or BANK_TRANSFER'
            });
        }
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const company = await prisma_1.prisma.company.findUnique({
            where: { id: companyId },
        });
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        if (new library_1.Decimal(amount).gt(company.currentBalance)) {
            return res.status(400).json({
                error: `Payment amount (${amount}) exceeds company balance (${company.currentBalance})`
            });
        }
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            // Create payment record
            const payment = await tx.paymentReceived.create({
                data: {
                    companyId,
                    saleId: saleId || null,
                    amount: new library_1.Decimal(amount),
                    method,
                    salespersonId: req.user.id,
                    notes: notes || null,
                },
            });
            // Update company balance
            await tx.company.update({
                where: { id: companyId },
                data: {
                    currentBalance: {
                        decrement: new library_1.Decimal(amount),
                    },
                },
            });
            return payment;
        });
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Receive payment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getPayments(req, res) {
    try {
        const { companyId, startDate, endDate, salespersonId } = req.query;
        const where = {};
        if (companyId)
            where.companyId = companyId;
        if (salespersonId)
            where.salespersonId = salespersonId;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate)
                where.createdAt.lte = new Date(endDate);
        }
        // SALES can only see their own payments
        if (req.user?.role === 'SALES') {
            where.salespersonId = req.user.id;
        }
        const payments = await prisma_1.prisma.paymentReceived.findMany({
            where,
            include: {
                company: true,
                salesperson: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json(payments);
    }
    catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getCompaniesWithBalance(req, res) {
    try {
        const companies = await prisma_1.prisma.company.findMany({
            where: {
                currentBalance: {
                    gt: 0,
                },
            },
            include: {
                sales: {
                    where: {
                        totalCredit: {
                            gt: 0,
                        },
                    },
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
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                payments: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 10,
                },
            },
            orderBy: {
                currentBalance: 'desc',
            },
        });
        res.json(companies);
    }
    catch (error) {
        console.error('Get companies with balance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=payments.controller.js.map