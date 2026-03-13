import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPrices() {
    try {
        const courses = await prisma.course.findMany();
        for (const course of courses) {
            let updated = false;
            let newOriginal = course.originalPrice;
            let newDiscounted = course.discountedPrice;

            if (course.originalPrice > 0 && course.originalPrice < 500) {
                newOriginal = course.originalPrice * 1000;
                if (newOriginal < 500) newOriginal = 100000;
                updated = true;
            }
            if (course.discountedPrice !== null && course.discountedPrice > 0 && course.discountedPrice < 500) {
                newDiscounted = course.discountedPrice * 1000;
                if (newDiscounted < 500) newDiscounted = 50000;
                updated = true;
            }

            if (updated) {
                await prisma.course.update({
                    where: { id: course.id },
                    data: {
                        originalPrice: newOriginal,
                        discountedPrice: newDiscounted
                    }
                });
                console.log(`Updated course ${course.title} price to ${newOriginal} (discounted: ${newDiscounted})`);
            }
        }
        console.log("Course prices fixed successfully.");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

fixPrices();
