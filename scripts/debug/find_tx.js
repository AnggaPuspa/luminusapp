const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const txs = await prisma.transaction.findMany({
    where: { 
      OR: [
        { mayarInvoiceId: { contains: '533828e0' } },
        { id: { contains: '533828e0' } }
      ]
    }
  });
  console.log("TXS:", txs);
}

main().finally(() => prisma.$disconnect());
