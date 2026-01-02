import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying users...\n');

  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
    orderBy: { email: 'asc' },
  });

  console.log('Users in database:');
  users.forEach(user => {
    console.log(`  - ${user.email} (${user.role}) - ${user.name} - Active: ${user.isActive}`);
  });

  // Check access code
  const accessCode = await prisma.setting.findUnique({
    where: { key: 'login_access_code' },
  });

  if (accessCode) {
    console.log(`\n✅ Access code set: ${accessCode.value}`);
  } else {
    console.log('\nℹ️  Access code using default: REALBRIGHT2025');
  }

  console.log(`\n✅ Total users: ${users.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



