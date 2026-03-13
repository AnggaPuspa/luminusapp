import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("Fetching latest 5 webhook logs...");
    const logs = await prisma.webhookLog.findMany({
        orderBy: { receivedAt: 'desc' },
        take: 5
    });
    console.log(JSON.stringify(logs, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
