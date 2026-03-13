import { PrismaClient, TransactionStatus, TransactionType, EnrollmentSource, SubscriptionStatus, BillingCycle, SubscriptionInvoiceStatus } from './generated/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ============================================================
// Helpers
// ============================================================
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomPick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

function addHours(date: Date, hours: number): Date {
    return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

// ============================================================
// 1. Data Pool — Nama Indonesia Realistis
// ============================================================
const INDONESIAN_NAMES = [
    'Adi Pratama', 'Siti Nurhaliza', 'Budi Santoso', 'Dewi Lestari',
    'Rizky Firmansyah', 'Putri Ayu Wulandari', 'Fajar Nugroho', 'Anisa Rahma',
    'Dimas Arya Putra', 'Nadia Safitri', 'Bayu Setiawan', 'Laras Puspita',
    'Arief Hidayat', 'Tania Maharani', 'Galih Permana', 'Citra Dewanti',
    'Raka Aditya', 'Indah Permatasari', 'Yoga Prasetyo', 'Aulia Fitri',
    'Hendra Gunawan', 'Mira Susanti', 'Doni Saputra', 'Rina Anggraeni',
    'Eka Wahyudi',
]

function generateEmail(name: string, index: number): string {
    const slug = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')
    const domains = ['gmail.com', 'yahoo.co.id', 'outlook.com', 'student.ac.id']
    return `${slug}${index}@${randomPick(domains)}`
}

// ============================================================
// 2. Pool Review Bahasa Indonesia
// ============================================================
const REVIEW_COMMENTS = [
    'Materinya daging banget, langsung bisa dipraktekkin di kerjaan. Worth it!',
    'Penjelasannya jelas dan mudah dipahami. Cocok buat pemula kayak saya.',
    'Kelas ini bagus banget! Instrukturnya sabar dan materinya update.',
    'Investasi ilmu terbaik bulan ini. Udah balik modal dari project freelance.',
    'Suka banget sama cara ngajarnya, step-by-step dan gak bikin bingung.',
    'Awalnya skeptis, tapi setelah ikut kelas ini langsung paham konsepnya.',
    'Recommended banget! Kualitas materinya setara sama kursus luar yang mahal.',
    'Modul-modulnya tersusun rapi, dari basic sampe advanced. Top markotop!',
    'Udah coba banyak kelas online, ini yang paling oke sejauh ini. Mantap!',
    'Dapet insight baru yang gak dapet dari tutorial YouTube. Worth every rupiah!',
    'Kelasnya interaktif dan materinya relevan sama industri sekarang.',
    'Belajar di sini serasa punya mentor pribadi. Terima kasih!',
    'Kualitas videonya HD, materinya padat. Gak nyesel beli kelas ini.',
    'Sangat membantu buat upgrade skill. Sekarang lebih pede apply kerjaan baru.',
    'Portofolio gue jadi makin keren setelah ikut kelas ini. Recommended!',
    'Akhirnya nemu kelas yang beneran praktikal, bukan cuma teori doang.',
    'Instrukturnya jelas banget ngejelasinnya, gak bertele-tele. Suka!',
    'Materi up-to-date dan relevan. Langsung bisa diterapin di proyek kantor.',
    'Worth it banget buat harganya. Kualitas premium dengan harga terjangkau.',
    'Kelas favorit saya di platform ini. Sudah rekomendasiin ke teman-teman.',
]

const PAYMENT_METHODS = ['QRIS', 'BANK_TRANSFER', 'E_WALLET']
const PAYMENT_CHANNELS = ['BCA', 'Mandiri', 'BRI', 'GoPay', 'OVO', 'Dana', 'ShopeePay']

// ============================================================
// STEP 2: Fetch Products
// ============================================================
async function fetchProducts() {
    const courses = await prisma.course.findMany({
        where: { status: 'PUBLISHED', deletedAt: null },
    })
    const plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
    })

    if (courses.length === 0) {
        console.error('❌ Tidak ada course PUBLISHED. Jalankan seed.ts dulu!')
        process.exit(1)
    }
    if (plans.length === 0) {
        console.error('❌ Tidak ada Subscription Plan aktif. Jalankan seed-plans.ts dulu!')
        process.exit(1)
    }

    return { courses, plans }
}

// ============================================================
// Main Seeding Logic - Chronological & Realistic
// ============================================================
async function main() {
    console.log('═══════════════════════════════════════════════════')
    console.log('  🌱 LUMINUS — Realistic Sales Seeder (March 2026)')
    console.log('  Timeline: March 1 - March 13 (Today)')
    console.log('═══════════════════════════════════════════════════\n')

    // 0. Cleanup old data to start fresh
    console.log('🧹 Cleaning up old sales data...')
    await prisma.courseReview.deleteMany()
    await prisma.enrollment.deleteMany()
    await prisma.subscriptionInvoice.deleteMany()
    await prisma.userSubscription.deleteMany()
    await prisma.transaction.deleteMany()
    await prisma.user.deleteMany({ where: { role: 'STUDENT' } })

    const { courses, plans } = await fetchProducts()
    const hashedPassword = await bcrypt.hash('Student123!', 10)
    
    const startDate = new Date('2026-03-01T09:00:00+07:00')
    const today = new Date('2026-03-13T13:00:00+07:00') 
    
    let userIndex = 0
    let totalTransactions = 0
    let totalEnrollments = 0

    // Iterate day by day from March 1st to Today
    let currentDate = new Date(startDate)
    while (currentDate <= today) {
        const dateString = currentDate.toISOString().split('T')[0]
        console.log(`📅 Processing Date: ${dateString}`)

        // 1. Create 1-2 new users per day (Organic growth)
        const usersToCreateToday = randomInt(1, 2)
        for (let i = 0; i < usersToCreateToday; i++) {
            if (userIndex >= INDONESIAN_NAMES.length) break

            const name = INDONESIAN_NAMES[userIndex]
            const email = generateEmail(name, userIndex + 1)
            const userCreatedAt = new Date(currentDate)
            userCreatedAt.setHours(randomInt(8, 11))

            const user = await prisma.user.create({
                data: {
                    email,
                    name,
                    password: hashedPassword,
                    role: 'STUDENT',
                    phoneNumber: `0812${randomInt(10000000, 99999999)}`,
                    avatarUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
                    createdAt: userCreatedAt
                }
            })
            userIndex++

            // 2. Chance to purchase
            if (Math.random() < 0.8) {
                const txDate = new Date(userCreatedAt)
                txDate.setHours(userCreatedAt.getHours() + randomInt(1, 4))

                const isSubscription = Math.random() > 0.7
                const statusRoll = Math.random() * 100
                const status = statusRoll < 75 ? TransactionStatus.PAID : (statusRoll < 90 ? TransactionStatus.PENDING : TransactionStatus.FAILED)
                
                let amount = 0
                let type: TransactionType = TransactionType.ONE_TIME
                let targetCourse = randomPick(courses)
                let targetPlanId: string | undefined = undefined

                if (isSubscription) {
                    const plan = randomPick(plans)
                    const isYearly = Math.random() > 0.8
                    amount = isYearly ? (plan.yearlyPrice ?? plan.monthlyPrice * 12) : plan.monthlyPrice
                    type = TransactionType.SUBSCRIPTION
                    targetPlanId = plan.id
                } else {
                    amount = targetCourse.discountedPrice ?? targetCourse.originalPrice
                }

                const tx = await prisma.transaction.create({
                    data: {
                        userId: user.id,
                        courseId: targetCourse.id,
                        amount,
                        status,
                        type,
                        paymentMethod: randomPick(PAYMENT_METHODS),
                        paymentChannel: randomPick(PAYMENT_CHANNELS),
                        createdAt: txDate,
                        paidAt: status === TransactionStatus.PAID ? addHours(txDate, 1) : null,
                        mayarInvoiceId: `INV-${type === TransactionType.ONE_TIME ? 'OT' : 'SUB'}-${Date.now()}-${randomInt(1000, 9999)}`,
                    }
                })
                totalTransactions++

                if (status === TransactionStatus.PAID) {
                    await prisma.enrollment.create({
                        data: {
                            userId: user.id,
                            courseId: targetCourse.id,
                            enrolledAt: tx.paidAt!,
                            status: 'ACTIVE',
                            source: isSubscription ? EnrollmentSource.SUBSCRIPTION : EnrollmentSource.PURCHASE,
                        }
                    })
                    totalEnrollments++

                    if (isSubscription && targetPlanId) {
                        const sub = await prisma.userSubscription.create({
                            data: {
                                userId: user.id,
                                planId: targetPlanId,
                                status: SubscriptionStatus.ACTIVE,
                                billingCycle: amount > 500000 ? BillingCycle.YEARLY : BillingCycle.MONTHLY,
                                currentPeriodStart: tx.paidAt!,
                                currentPeriodEnd: addHours(tx.paidAt!, 720),
                                createdAt: tx.createdAt
                            }
                        })
                        await prisma.subscriptionInvoice.create({
                            data: {
                                subscriptionId: sub.id,
                                amount,
                                status: SubscriptionInvoiceStatus.PAID,
                                billingPeriodStart: tx.paidAt!,
                                billingPeriodEnd: addHours(tx.paidAt!, 720),
                                paidAt: tx.paidAt,
                                mayarInvoiceId: `SINV-${Date.now()}-${randomInt(1000, 9999)}`
                            }
                        })
                    }

                    if (Math.random() < 0.4) {
                        const reviewDate = new Date(tx.paidAt!)
                        reviewDate.setDate(reviewDate.getDate() + randomInt(1, 2))
                        
                        if (reviewDate <= today) {
                            await prisma.courseReview.create({
                                data: {
                                    userId: user.id,
                                    courseId: targetCourse.id,
                                    rating: randomInt(4, 5),
                                    comment: randomPick(REVIEW_COMMENTS),
                                    createdAt: reviewDate
                                }
                            })
                        }
                    }
                }
            }
        }
        currentDate.setDate(currentDate.getDate() + 1)
    }

    console.log('\n═══════════════════════════════════════════════════')
    console.log(`Summary:`)
    console.log(`👤 New Students: ${userIndex}`)
    console.log(`💳 Transactions: ${totalTransactions}`)
    console.log(`🎓 Enrollments: ${totalEnrollments}`)
    console.log('🎉 Realistic seeding complete!')
    console.log('═══════════════════════════════════════════════════\n')
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
