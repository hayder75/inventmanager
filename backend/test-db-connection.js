const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✓ Database connection successful!');
    
    // Try to query users table
    const userCount = await prisma.user.count();
    console.log(`✓ Found ${userCount} users in database`);
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:');
    console.error(error.message);
    await prisma.$disconnect();
    return false;
  }
}

testConnection();
