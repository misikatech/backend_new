const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

beforeAll(async () => {
  // Setup test database
  console.log('Setting up test database...');
});

afterAll(async () => {
  // Cleanup test database
  await prisma.$disconnect();
  console.log('Test database cleaned up');
});

beforeEach(async () => {
  // Reset database state before each test if needed
});