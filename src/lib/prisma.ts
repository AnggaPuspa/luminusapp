import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => {
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['warn', 'error']
            : ['error'],
    })
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// Force reload schema once
delete globalThis.prisma;
const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma
