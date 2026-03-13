const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  const logs = await prisma.webhookLog.findMany({
    orderBy: { receivedAt: 'desc' },
    take: 1
  });
  fs.writeFileSync('webhook_dump.json', JSON.stringify(logs, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
