
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting to database...');
    const userCount = await prisma.user.count();
    console.log(`Successfully connected! Found ${userCount} users.`);
  } catch (e) {
    console.error('Error connecting to database:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
