import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🌱 Seeding users...');

  // Create sales user
  const salesPassword = await hashPassword('sales123');
  const sales = await prisma.user.upsert({
    where: { email: 'sales@test.com' },
    update: {
      passwordHash: salesPassword,
      name: 'Sales User',
      role: 'SALES',
      isActive: true,
    },
    create: {
      email: 'sales@test.com',
      passwordHash: salesPassword,
      name: 'Sales User',
      role: 'SALES',
      isActive: true,
    },
  });

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@realbright.com' },
    update: {
      passwordHash: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      email: 'admin@realbright.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      isActive: true,
    },
  });

  // Set access code (if Setting model exists)
  try {
    await prisma.setting.upsert({
      where: { key: 'login_access_code' },
      update: {
        value: 'REALBRIGHT2025',
      },
      create: {
        key: 'login_access_code',
        value: 'REALBRIGHT2025',
      },
    });
    console.log('✅ Access code set to: REALBRIGHT2025');
  } catch (error) {
    // Setting model might not exist, that's okay - it will use the default
    console.log('ℹ️  Access code will use default: REALBRIGHT2025');
  }

  console.log('✅ Created users:', { 
    sales: sales.email, 
    admin: admin.email 
  });
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


