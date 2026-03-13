const { PrismaClient } = require('./prisma/generated/client');
const prisma = new PrismaClient();
async function main() {
    console.log('Testing connection...');
    try {
        const count = await prisma.user.count();
        console.log('User count:', count);
    } catch(e) {
        console.error('Error:', e.message);
    }
}
main().finally(() => prisma.$disconnect());
