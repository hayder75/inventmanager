"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContact = createContact;
exports.getContacts = getContacts;
exports.updateContact = updateContact;
exports.deleteContact = deleteContact;
const prisma_1 = require("../utils/prisma");
async function createContact(req, res) {
    try {
        const { name, phone, notes } = req.body;
        if (!name || !phone) {
            return res.status(400).json({ error: 'Name and phone are required' });
        }
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const contact = await prisma_1.prisma.contact.create({
            data: {
                name,
                phone,
                notes: notes || null,
                visibleToSales: true,
                createdBy: req.user.id,
            },
        });
        res.status(201).json(contact);
    }
    catch (error) {
        console.error('Create contact error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getContacts(req, res) {
    try {
        const { search } = req.query;
        const where = {};
        // SALES can only see contacts visible to sales
        if (req.user?.role === 'SALES') {
            where.visibleToSales = true;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }
        const contacts = await prisma_1.prisma.contact.findMany({
            where,
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
        res.json(contacts);
    }
    catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function updateContact(req, res) {
    try {
        const { id } = req.params;
        const { name, phone, notes, visibleToSales } = req.body;
        const updateData = {};
        if (name)
            updateData.name = name;
        if (phone)
            updateData.phone = phone;
        if (notes !== undefined)
            updateData.notes = notes;
        // Only ADMIN can change visibility
        if (req.user?.role === 'ADMIN' && visibleToSales !== undefined) {
            updateData.visibleToSales = visibleToSales;
        }
        const contact = await prisma_1.prisma.contact.update({
            where: { id },
            data: updateData,
        });
        res.json(contact);
    }
    catch (error) {
        console.error('Update contact error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Contact not found' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function deleteContact(req, res) {
    try {
        const { id } = req.params;
        await prisma_1.prisma.contact.delete({
            where: { id },
        });
        res.json({ message: 'Contact deleted successfully' });
    }
    catch (error) {
        console.error('Delete contact error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Contact not found' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=contacts.controller.js.map