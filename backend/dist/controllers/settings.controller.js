"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettings = getSettings;
exports.updateSetting = updateSetting;
exports.getSetting = getSetting;
const prisma_1 = require("../utils/prisma");
async function getSettings(req, res) {
    try {
        const settings = await prisma_1.prisma.setting.findMany({
            orderBy: {
                key: 'asc',
            },
        });
        const settingsMap = {};
        for (const setting of settings) {
            settingsMap[setting.key] = setting.value;
        }
        res.json(settingsMap);
    }
    catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function updateSetting(req, res) {
    try {
        const { key, value, description } = req.body;
        if (!key || value === undefined) {
            return res.status(400).json({
                error: 'Key and value are required',
            });
        }
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Only ADMIN can update system settings
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Insufficient permissions. Only ADMIN can update settings.' });
        }
        const setting = await prisma_1.prisma.setting.upsert({
            where: { key },
            update: {
                value,
                description: description || null,
                updatedBy: req.user.id,
            },
            create: {
                key,
                value,
                description: description || null,
                updatedBy: req.user.id,
            },
        });
        res.json(setting);
    }
    catch (error) {
        console.error('Update setting error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getSetting(req, res) {
    try {
        const { key } = req.params;
        const setting = await prisma_1.prisma.setting.findUnique({
            where: { key },
        });
        if (!setting) {
            return res.json({ key, value: null });
        }
        res.json(setting);
    }
    catch (error) {
        console.error('Get setting error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=settings.controller.js.map