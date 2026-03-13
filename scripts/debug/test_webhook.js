const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const transactionId = 'cmmoca0uc0001tin1qht383tz';
  const log = await prisma.webhookLog.create({
    data: {
      event: 'test.event',
      payload: { test: true },
      httpStatus: 200,
      transactionId: transactionId
    }
  });
  console.log("CREATED:", log);
}

main().finally(() => prisma.$disconnect());
