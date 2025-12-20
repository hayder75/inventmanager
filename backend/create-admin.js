const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@realbright.com';
    const password = 'admin123';
    const name = 'Admin User';

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', email);
      console.log('Password:', password);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log('========================================');
    console.log('Admin User Created Successfully!');
    console.log('========================================');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role: ADMIN');
    console.log('========================================');
    console.log('Please change the password after first login!');
    console.log('========================================');
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

