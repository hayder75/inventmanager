import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';

export async function createContact(req: AuthRequest, res: Response) {
  try {
    const { name, phone, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        phone,
        notes: notes || null,
        visibleToSales: true,
        createdBy: req.user.id,
      },
    });

    res.status(201).json(contact);
  } catch (error: any) {
    console.error('Create contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getContacts(req: AuthRequest, res: Response) {
  try {
    const { search } = req.query;

    const where: any = {};

    // SALES can only see contacts visible to sales
    if (req.user?.role === 'SALES') {
      where.visibleToSales = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const contacts = await prisma.contact.findMany({
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
  } catch (error: any) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateContact(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, phone, notes, visibleToSales } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (notes !== undefined) updateData.notes = notes;
    
    // Only ADMIN can change visibility
    if (req.user?.role === 'ADMIN' && visibleToSales !== undefined) {
      updateData.visibleToSales = visibleToSales;
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: updateData,
    });

    res.json(contact);
  } catch (error: any) {
    console.error('Update contact error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteContact(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    await prisma.contact.delete({
      where: { id },
    });

    res.json({ message: 'Contact deleted successfully' });
  } catch (error: any) {
    console.error('Delete contact error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}


