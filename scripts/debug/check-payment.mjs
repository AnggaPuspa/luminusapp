import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkWebhooksAndTransactions() {
    try {
        const webhooks = await prisma.webhookLog.findMany({
            orderBy: { receivedAt: 'desc' },
            take: 18
        });
        console.log("Recent Webhooks:", JSON.stringify(webhooks, null, 2));

        const transactions = await prisma.transaction.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { user: true, course: true }
        });

        console.log("\nRecent Transactions:");
        transactions.forEach(t => {
            console.log(`- ${t.id} | ${t.status} | ${t.course.title} | User: ${t.user.name} | Mayar ID: ${t.mayarInvoiceId}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkWebhooksAndTransactions();
