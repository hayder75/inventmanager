import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await hashPassword('admin@test.com');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {
      passwordHash: adminPassword,
    },
    create: {
      email: 'admin@test.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  // Create sales user
  const salesPassword = await hashPassword('sales123');
  const sales = await prisma.user.upsert({
    where: { email: 'sales@test.com' },
    update: {
      passwordHash: salesPassword,
    },
    create: {
      email: 'sales@test.com',
      passwordHash: salesPassword,
      name: 'Sales User',
      role: 'SALES',
    },
  });

  console.log('✅ Created users:', { admin: admin.email, sales: sales.email });
  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

