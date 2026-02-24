"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.updateUser = updateUser;
exports.resetUserPassword = resetUserPassword;
exports.deleteUser = deleteUser;
exports.resetUserCommission = resetUserCommission;
const prisma_1 = require("../utils/prisma");
const password_1 = require("../utils/password");
async function createUser(req, res) {
    try {
        const { email, password, name, role } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }
        if (role && !['ADMIN', 'SALES'].includes(role)) {
            return res.status(400).json({ error: 'Role must be ADMIN or SALES' });
        }
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const passwordHash = await (0, password_1.hashPassword)(password);
        const user = await prisma_1.prisma.user.create({
            data: {
                email: email.toLowerCase(),
                passwordHash,
                name,
                role: role || 'SALES',
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
        res.status(201).json(user);
    }
    catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getUsers(req, res) {
    try {
        const { role, isActive } = req.query;
        const where = {};
        if (role)
            where.role = role;
        if (isActive !== undefined)
            where.isActive = isActive === 'true';
        const users = await prisma_1.prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
        res.json(users);
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getUserById(req, res) {
    try {
        const { id } = req.params;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const { name, email, role, isActive } = req.body;
        const updateData = {};
        if (name)
            updateData.name = name;
        if (email)
            updateData.email = email.toLowerCase();
        if (role && ['ADMIN', 'SALES'].includes(role))
            updateData.role = role;
        if (isActive !== undefined)
            updateData.isActive = isActive;
        const user = await prisma_1.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        res.json(user);
    }
    catch (error) {
        console.error('Update user error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function resetUserPassword(req, res) {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        const passwordHash = await (0, password_1.hashPassword)(newPassword);
        await prisma_1.prisma.user.update({
            where: { id },
            data: { passwordHash },
        });
        res.json({ message: 'Password reset successfully' });
    }
    catch (error) {
        console.error('Reset password error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        // Prevent deleting own account
        if (req.user?.id === id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }
        // Check if user has any sales, expenses, etc.
        const salesCount = await prisma_1.prisma.sale.count({ where: { salespersonId: id } });
        const expensesCount = await prisma_1.prisma.expense.count({ where: { createdBy: id } });
        if (salesCount > 0 || expensesCount > 0) {
            // If the user has related records, deactivate instead of deleting
            await prisma_1.prisma.user.update({
                where: { id },
                data: { isActive: false },
            });
            return res.json({ message: 'User has existing records and was deactivated instead of deleted.' });
        }
        // If no related records, hard delete
        await prisma_1.prisma.user.delete({
            where: { id },
        });
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Delete user error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function resetUserCommission(req, res) {
    try {
        const { id } = req.params;
        const user = await prisma_1.prisma.user.update({
            where: { id },
            data: { totalCommission: 0 },
            select: {
                id: true,
                name: true,
                totalCommission: true,
            },
        });
        res.json({ message: 'Commission reset successfully', user });
    }
    catch (error) {
        console.error('Reset commission error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=users.controller.js.map