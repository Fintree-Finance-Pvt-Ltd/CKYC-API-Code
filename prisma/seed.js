const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Define all clients you want to register here:
  const clients = [
    {
      code: 'TEST_CLIENT',
      name: 'Fintree Test Client',
      apiKey: 'secret_api_key_123',
    },
    {
      code: 'LMS_SYSTEM',
      name: 'Loan Management System',
      apiKey: 'lms_live_secret_key_888',
    },
    {
      code: 'MOBILE_APP',
      name: 'Fintree Mobile App Backend',
      apiKey: 'mobile_app_secret_key_777',
    },
  ];

  console.log('🌱 Starting client seeding...\n');

  for (const item of clients) {
    const apiKeyHash = await bcrypt.hash(item.apiKey, 10);

    const client = await prisma.ckycClient.upsert({
      where: { clientCode: item.code },
      update: {
        clientName: item.name,
        apiKeyHash,
        isActive: true,
      },
      create: {
        clientCode: item.code,
        clientName: item.name,
        apiKeyHash,
        isActive: true,
      },
    });

    console.log(`✅ [${client.clientCode}] - "${item.name}"`);
    console.log(`   X-CLIENT-ID : ${item.code}`);
    console.log(`   X-API-KEY   : ${item.apiKey}`);
    console.log('--------------------------------------------------');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
