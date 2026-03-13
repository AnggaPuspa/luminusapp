import { PrismaClient } from './prisma/generated/client/index.js';
const prisma = new PrismaClient();

async function debug() {
    // Get the specific PENDING transaction for "Panduan Dasar Git"
    const pendingTx = await prisma.transaction.findMany({
        where: { status: 'PENDING' },
        select: {
            id: true,
            status: true,
            amount: true,
            mayarInvoiceId: true,
            mayarInvoiceUrl: true,
            createdAt: true,
            course: { select: { title: true } },
            user: { select: { name: true, email: true } }
        }
    });

    console.log("=== PENDING TRANSACTIONS ===");
    for (const tx of pendingTx) {
        console.log(`ID: ${tx.id}`);
        console.log(`Amount: ${tx.amount}`);
        console.log(`Mayar Invoice ID: ${tx.mayarInvoiceId}`);
        console.log(`Mayar Invoice URL: ${tx.mayarInvoiceUrl}`);
        console.log(`Course: ${tx.course?.title}`);
        console.log(`User: ${tx.user?.name} (${tx.user?.email})`);
        console.log(`Created: ${tx.createdAt}`);
        console.log("---");
    }

    // Get ALL webhook logs to see what Mayar sent
    const webhooks = await prisma.webhookLog.findMany({
        where: { event: 'payment.received' },
        orderBy: { receivedAt: 'desc' },
        take: 5
    });

    console.log("\n=== PAYMENT WEBHOOK LOGS ===");
    for (const wh of webhooks) {
        const payload = wh.payload;
        const data = payload?.data;
        console.log(`Webhook ID: ${wh.id}`);
        console.log(`Event: ${wh.event}`);
        console.log(`Data.id: ${data?.id}`);
        console.log(`Data.amount: ${data?.amount}`);
        console.log(`Data.status: ${data?.status}`);
        console.log(`Data.customerEmail: ${data?.customerEmail}`);
        console.log(`Data.customerName: ${data?.customerName}`);
        console.log(`Data.productName: ${data?.productName}`);
        console.log(`Data.productId: ${data?.productId}`);
        console.log(`Data.referenceId: ${data?.referenceId}`);
        console.log(`Data.transaction: ${JSON.stringify(data?.transaction)}`);
        console.log(`Data.paymentMethod: ${data?.paymentMethod}`);
        console.log(`Data.paymentChannel: ${data?.paymentChannel}`);
        console.log(`Data.description: ${data?.description}`);
        console.log(`Received: ${wh.receivedAt}`);
        console.log("---");
    }

    await prisma.$disconnect();
}

debug().catch(console.error);
