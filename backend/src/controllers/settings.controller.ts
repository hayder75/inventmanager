import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';

export async function getSettings(req: AuthRequest, res: Response) {
  try {
    const settings = await prisma.setting.findMany({
      orderBy: {
        key: 'asc',
      },
    });

    const settingsMap: Record<string, string> = {};
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value;
    }

    res.json(settingsMap);
  } catch (error: any) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateSetting(req: AuthRequest, res: Response) {
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

    const setting = await prisma.setting.upsert({
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
  } catch (error: any) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getSetting(req: AuthRequest, res: Response) {
  try {
    const { key } = req.params;

    const setting = await prisma.setting.findUnique({
      where: { key },
    });

    if (!setting) {
      return res.json({ key, value: null });
    }

    res.json(setting);
  } catch (error: any) {
    console.error('Get setting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

