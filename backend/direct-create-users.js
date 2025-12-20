const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function createUsers() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('✓ Connected!\n');

    // Admin user
    const adminEmail = 'admin@test.com';
    const adminPassword = 'admin@test.com';
    const hashedAdminPassword = await hashPassword(adminPassword);
    
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { passwordHash: hashedAdminPassword },
      create: {
        email: adminEmail,
        passwordHash: hashedAdminPassword,
        name: 'Admin User',
        role: 'ADMIN',
        isActive: true
      }
    });
    console.log('✓ Admin user:', adminEmail);

    // Sales user
    const salesEmail = 'sales@test.com';
    const salesPassword = 'sales123';
    const hashedSalesPassword = await hashPassword(salesPassword);
    
    const sales = await prisma.user.upsert({
      where: { email: salesEmail },
      update: { passwordHash: hashedSalesPassword },
      create: {
        email: salesEmail,
        passwordHash: hashedSalesPassword,
        name: 'Sales User',
        role: 'SALES',
        isActive: true
      }
    });
    console.log('✓ Sales user:', salesEmail);

    console.log('\n✅ Users created/updated successfully!');
    console.log('\nCredentials:');
    console.log('Admin: admin@test.com / admin@test.com');
    console.log('Sales: sales@test.com / sales123');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('Authentication failed')) {
      console.error('\n⚠️  Database authentication failed.');
      console.error('Please ensure PostgreSQL password is set to "postgres"');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createUsers();
