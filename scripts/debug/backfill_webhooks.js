const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.webhookLog.findMany({
    where: { transactionId: null }
  });

  for (const log of logs) {
    try {
      const payload = typeof log.payload === 'string' ? JSON.parse(log.payload) : log.payload;
      if (payload && payload.data) {
        const eventData = payload.data;
        const transactionStr = eventData.productId || eventData.transaction?.id || eventData.id;
        
        if (transactionStr) {
          const tx = await prisma.transaction.findFirst({
            where: { mayarInvoiceId: transactionStr }
          });
          
          if (tx) {
            await prisma.webhookLog.update({
              where: { id: log.id },
              data: { transactionId: tx.id }
            });
            console.log("Fixed log", log.id, "to", tx.id);
            continue;
          }
          
          const sub = await prisma.subscriptionInvoice.findFirst({
            where: { mayarInvoiceId: transactionStr }
          });
          if (sub) {
            await prisma.webhookLog.update({
              where: { id: log.id },
              data: { transactionId: sub.id }
            });
             console.log("Fixed log", log.id, "to sub", sub.id);
          }
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
}

main().finally(() => prisma.$disconnect());
