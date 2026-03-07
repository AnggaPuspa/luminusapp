const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const enrollments = await prisma.enrollment.findMany({
        include: {
            course: {
                select: { id: true, title: true, status: true, deletedAt: true }
            }
        }
    });
    console.log(JSON.stringify(enrollments, null, 2));
}
main().finally(() => prisma.$disconnect());
