import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function createCompany(req: AuthRequest, res: Response) {
  try {
    const { name, phone, address, creditLimit, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const company = await prisma.company.create({
      data: {
        name,
        phone: phone || null,
        address: address || null,
        creditLimit: creditLimit ? new Decimal(creditLimit) : new Decimal(0),
        notes: notes || null,
      },
    });

    res.status(201).json(company);
  } catch (error: any) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getCompanies(req: AuthRequest, res: Response) {
  try {
    const { search } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const companies = await prisma.company.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    res.json(companies);
  } catch (error: any) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getCompanyById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
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
  } catch (error: any) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateCompany(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, phone, address, creditLimit, notes } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (creditLimit !== undefined) updateData.creditLimit = new Decimal(creditLimit);
    if (notes !== undefined) updateData.notes = notes;

    const company = await prisma.company.update({
      where: { id },
      data: updateData,
    });

    res.json(company);
  } catch (error: any) {
    console.error('Update company error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteCompany(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    // Check if company has sales
    const salesCount = await prisma.sale.count({
      where: { companyId: id },
    });

    if (salesCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete company with existing sales. Consider deactivating instead.' 
      });
    }

    await prisma.company.delete({
      where: { id },
    });

    res.json({ message: 'Company deleted successfully' });
  } catch (error: any) {
    console.error('Delete company error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}


