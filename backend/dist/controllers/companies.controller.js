"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompany = createCompany;
exports.getCompanies = getCompanies;
exports.getCompanyById = getCompanyById;
exports.updateCompany = updateCompany;
exports.deleteCompany = deleteCompany;
const prisma_1 = require("../utils/prisma");
const library_1 = require("@prisma/client/runtime/library");
async function createCompany(req, res) {
    try {
        const { name, phone, address, creditLimit, notes } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Company name is required' });
        }
        const company = await prisma_1.prisma.company.create({
            data: {
                name,
                phone: phone || null,
                address: address || null,
                creditLimit: creditLimit ? new library_1.Decimal(creditLimit) : new library_1.Decimal(0),
                notes: notes || null,
            },
        });
        res.status(201).json(company);
    }
    catch (error) {
        console.error('Create company error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getCompanies(req, res) {
    try {
        const { search } = req.query;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }
        const companies = await prisma_1.prisma.company.findMany({
            where,
            orderBy: {
                name: 'asc',
            },
        });
        res.json(companies);
    }
    catch (error) {
        console.error('Get companies error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getCompanyById(req, res) {
    try {
        const { id } = req.params;
        const company = await prisma_1.prisma.company.findUnique({
            where: { id },
            include: {
                sales: {
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
                    include: {
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
            },
        });
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.json(company);
    }
    catch (error) {
        console.error('Get company error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function updateCompany(req, res) {
    try {
        const { id } = req.params;
        const { name, phone, address, creditLimit, notes } = req.body;
        const updateData = {};
        if (name)
            updateData.name = name;
        if (phone !== undefined)
            updateData.phone = phone;
        if (address !== undefined)
            updateData.address = address;
        if (creditLimit !== undefined)
            updateData.creditLimit = new library_1.Decimal(creditLimit);
        if (notes !== undefined)
            updateData.notes = notes;
        const company = await prisma_1.prisma.company.update({
            where: { id },
            data: updateData,
        });
        res.json(company);
    }
    catch (error) {
        console.error('Update company error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function deleteCompany(req, res) {
    try {
        const { id } = req.params;
        // Check if company has sales
        const salesCount = await prisma_1.prisma.sale.count({
            where: { companyId: id },
        });
        if (salesCount > 0) {
            return res.status(400).json({
                error: 'Cannot delete company with existing sales. Consider deactivating instead.'
            });
        }
        await prisma_1.prisma.company.delete({
            where: { id },
        });
        res.json({ message: 'Company deleted successfully' });
    }
    catch (error) {
        console.error('Delete company error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=companies.controller.js.map