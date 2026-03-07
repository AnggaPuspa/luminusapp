import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const adminEmail = 'admin@luminus.com'
    const adminPasswordRaw = 'Password123!'
    const hashedPassword = await bcrypt.hash(adminPasswordRaw, 10)

    // Upsert ensures we don't crash if the admin already exists
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
        },
        create: {
            email: adminEmail,
            name: 'Luminus Admin',
            password: hashedPassword,
            role: 'ADMIN',
        },
    })

    console.log('✅ Admin user seeded database successfully.')
    console.log(`Email: ${adminEmail}`)
    console.log(`Password: ${adminPasswordRaw}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
