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

function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
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
// STEP 1: Seed 25 Student Users
// ============================================================
async function seedStudents(): Promise<string[]> {
    console.log('👤 Seeding 25 Student users...\n')
    const hashedPassword = await bcrypt.hash('Student123!', 10)
    const userIds: string[] = []

    for (let i = 0; i < INDONESIAN_NAMES.length; i++) {
        const name = INDONESIAN_NAMES[i]
        const email = generateEmail(name, i + 1)

        const user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                name,
                password: hashedPassword,
                role: 'STUDENT',
                avatarUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
            },
        })
        userIds.push(user.id)
        console.log(`   ✅ ${name} (${email})`)
    }

    console.log(`\n   Total: ${userIds.length} students\n`)
    return userIds
}

// ============================================================
// STEP 2: Fetch Existing Courses & Plans
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

    console.log(`📚 Found ${courses.length} published courses`)
    console.log(`📋 Found ${plans.length} active subscription plans\n`)

    return { courses, plans }
}

// ============================================================
// STEP 3: Seed Transactions (Maret 2026)
// ============================================================
interface CreatedTransaction {
    id: string
    userId: string
    courseId: string
    type: TransactionType
    status: TransactionStatus
    planId?: string
    amount: number
    createdAt: Date
    paidAt: Date | null
}

async function seedTransactions(
    userIds: string[],
    courses: { id: string; originalPrice: number; discountedPrice: number | null }[],
    plans: { id: string; monthlyPrice: number; yearlyPrice: number | null; slug: string }[]
): Promise<CreatedTransaction[]> {
    console.log('💳 Seeding transactions for March 2026...\n')

    const MARCH_START = new Date('2026-03-01T00:00:00+07:00')
    const MARCH_END = new Date('2026-03-31T23:59:59+07:00')

    const TOTAL_TRANSACTIONS = 120
    const ONE_TIME_COUNT = Math.round(TOTAL_TRANSACTIONS * 0.6)  // 72
    const SUBSCRIPTION_COUNT = TOTAL_TRANSACTIONS - ONE_TIME_COUNT // 48

    // Status distribution helper
    function pickStatus(): TransactionStatus {
        const roll = Math.random() * 100
        if (roll < 80) return TransactionStatus.PAID
        if (roll < 95) return TransactionStatus.PENDING
        return TransactionStatus.FAILED
    }

    const createdTransactions: CreatedTransaction[] = []

    // --- ONE_TIME transactions ---
    console.log(`   📦 Creating ${ONE_TIME_COUNT} ONE_TIME transactions...`)
    for (let i = 0; i < ONE_TIME_COUNT; i++) {
        const userId = randomPick(userIds)
        const course = randomPick(courses)
        const status = pickStatus()
        const createdAt = randomDate(MARCH_START, MARCH_END)
        const amount = course.discountedPrice ?? course.originalPrice
        const paidAt = status === TransactionStatus.PAID
            ? addHours(createdAt, randomInt(0, 2))
            : null

        const tx = await prisma.transaction.create({
            data: {
                userId,
                courseId: course.id,
                amount,
                status,
                type: TransactionType.ONE_TIME,
                paymentMethod: randomPick(PAYMENT_METHODS),
                paymentChannel: randomPick(PAYMENT_CHANNELS),
                createdAt,
                paidAt,
                expiredAt: status === TransactionStatus.PENDING
                    ? addHours(createdAt, 24)
                    : null,
                mayarInvoiceId: `INV-OT-${Date.now()}-${randomInt(1000, 9999)}-${i}`,
            },
        })

        createdTransactions.push({
            id: tx.id,
            userId,
            courseId: course.id,
            type: TransactionType.ONE_TIME,
            status,
            amount,
            createdAt,
            paidAt,
        })
    }

    // --- SUBSCRIPTION transactions ---
    console.log(`   📋 Creating ${SUBSCRIPTION_COUNT} SUBSCRIPTION transactions...`)
    for (let i = 0; i < SUBSCRIPTION_COUNT; i++) {
        const userId = randomPick(userIds)
        const course = randomPick(courses) // FK required
        const plan = randomPick(plans)
        const status = pickStatus()
        const createdAt = randomDate(MARCH_START, MARCH_END)
        const isYearly = Math.random() > 0.6
        const amount = isYearly ? (plan.yearlyPrice ?? plan.monthlyPrice * 12) : plan.monthlyPrice
        const paidAt = status === TransactionStatus.PAID
            ? addHours(createdAt, randomInt(0, 2))
            : null

        const tx = await prisma.transaction.create({
            data: {
                userId,
                courseId: course.id,
                amount,
                status,
                type: TransactionType.SUBSCRIPTION,
                paymentMethod: randomPick(PAYMENT_METHODS),
                paymentChannel: randomPick(PAYMENT_CHANNELS),
                createdAt,
                paidAt,
                expiredAt: status === TransactionStatus.PENDING
                    ? addHours(createdAt, 24)
                    : null,
                mayarInvoiceId: `INV-SUB-${Date.now()}-${randomInt(1000, 9999)}-${i}`,
            },
        })

        createdTransactions.push({
            id: tx.id,
            userId,
            courseId: course.id,
            type: TransactionType.SUBSCRIPTION,
            status,
            planId: plan.id,
            amount,
            createdAt,
            paidAt,
        })
    }

    const paidCount = createdTransactions.filter(t => t.status === TransactionStatus.PAID).length
    const pendingCount = createdTransactions.filter(t => t.status === TransactionStatus.PENDING).length
    const failedCount = createdTransactions.filter(t => t.status === TransactionStatus.FAILED).length

    console.log(`\n   📊 Total: ${createdTransactions.length} transactions`)
    console.log(`      ✅ PAID: ${paidCount}  ⏳ PENDING: ${pendingCount}  ❌ FAILED: ${failedCount}\n`)

    return createdTransactions
}

// ============================================================
// STEP 4: Seed Enrollments (dari PAID ONE_TIME)
// ============================================================
async function seedEnrollments(transactions: CreatedTransaction[]): Promise<void> {
    console.log('🎓 Seeding enrollments from PAID ONE_TIME transactions...\n')

    const paidOneTime = transactions.filter(
        t => t.status === TransactionStatus.PAID && t.type === TransactionType.ONE_TIME
    )

    // Deduplicate by [userId, courseId]
    const seen = new Set<string>()
    let created = 0

    for (const tx of paidOneTime) {
        const key = `${tx.userId}:${tx.courseId}`
        if (seen.has(key)) continue
        seen.add(key)

        // Check if enrollment already exists
        const existing = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: tx.userId, courseId: tx.courseId } },
        })
        if (existing) continue

        await prisma.enrollment.create({
            data: {
                userId: tx.userId,
                courseId: tx.courseId,
                enrolledAt: tx.paidAt ?? tx.createdAt,
                status: 'ACTIVE',
                source: EnrollmentSource.PURCHASE,
            },
        })
        created++
    }

    console.log(`   ✅ Created ${created} enrollments\n`)
}

// ============================================================
// STEP 5: Seed UserSubscriptions + Invoices (dari PAID SUBSCRIPTION)
// ============================================================
async function seedSubscriptions(transactions: CreatedTransaction[]): Promise<void> {
    console.log('📋 Seeding user subscriptions & invoices from PAID SUBSCRIPTION transactions...\n')

    const paidSub = transactions.filter(
        t => t.status === TransactionStatus.PAID && t.type === TransactionType.SUBSCRIPTION && t.planId
    )

    // Deduplicate — 1 user gets 1 subscription max per plan
    const seen = new Set<string>()
    let created = 0

    for (const tx of paidSub) {
        const key = `${tx.userId}:${tx.planId}`
        if (seen.has(key)) continue
        seen.add(key)

        const isYearly = tx.amount > 500000
        const billingCycle = isYearly ? BillingCycle.YEARLY : BillingCycle.MONTHLY
        const periodStart = tx.paidAt ?? tx.createdAt
        const periodEnd = new Date(periodStart)
        if (isYearly) {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1)
        } else {
            periodEnd.setMonth(periodEnd.getMonth() + 1)
        }

        const sub = await prisma.userSubscription.create({
            data: {
                userId: tx.userId,
                planId: tx.planId!,
                status: SubscriptionStatus.ACTIVE,
                billingCycle,
                currentPeriodStart: periodStart,
                currentPeriodEnd: periodEnd,
                createdAt: tx.createdAt,
            },
        })

        // Create matching invoice
        await prisma.subscriptionInvoice.create({
            data: {
                subscriptionId: sub.id,
                amount: tx.amount,
                status: SubscriptionInvoiceStatus.PAID,
                billingPeriodStart: periodStart,
                billingPeriodEnd: periodEnd,
                paidAt: tx.paidAt,
                mayarInvoiceId: `SINV-${Date.now()}-${randomInt(10000, 99999)}`,
                createdAt: tx.createdAt,
            },
        })

        // Also create enrollment for subscription courses
        const planCourses = await prisma.planCourse.findMany({
            where: { planId: tx.planId! },
            select: { courseId: true },
        })
        for (const pc of planCourses) {
            const existing = await prisma.enrollment.findUnique({
                where: { userId_courseId: { userId: tx.userId, courseId: pc.courseId } },
            })
            if (!existing) {
                await prisma.enrollment.create({
                    data: {
                        userId: tx.userId,
                        courseId: pc.courseId,
                        enrolledAt: tx.paidAt ?? tx.createdAt,
                        status: 'ACTIVE',
                        source: EnrollmentSource.SUBSCRIPTION,
                    },
                })
            }
        }

        created++
    }

    console.log(`   ✅ Created ${created} subscriptions with invoices\n`)
}

// ============================================================
// STEP 6: Seed Course Reviews (dari user yang enrolled)
// ============================================================
async function seedReviews(): Promise<void> {
    console.log('⭐ Seeding course reviews from enrolled students...\n')

    const enrollments = await prisma.enrollment.findMany({
        select: { userId: true, courseId: true },
    })

    // Shuffle and pick ~60% for reviews
    const shuffled = enrollments.sort(() => Math.random() - 0.5)
    const toReview = shuffled.slice(0, Math.ceil(shuffled.length * 0.6))

    let created = 0

    for (const enrollment of toReview) {
        // Check unique constraint
        const existing = await prisma.courseReview.findUnique({
            where: {
                userId_courseId: {
                    userId: enrollment.userId,
                    courseId: enrollment.courseId,
                },
            },
        })
        if (existing) continue

        const rating = randomInt(4, 5)
        const comment = randomPick(REVIEW_COMMENTS)
        const reviewDate = randomDate(
            new Date('2026-03-05T00:00:00+07:00'),
            new Date('2026-03-31T23:59:59+07:00')
        )

        await prisma.courseReview.create({
            data: {
                userId: enrollment.userId,
                courseId: enrollment.courseId,
                rating,
                comment,
                createdAt: reviewDate,
            },
        })
        created++
    }

    console.log(`   ✅ Created ${created} course reviews\n`)
}

// ============================================================
// Main
// ============================================================
async function main() {
    console.log('═══════════════════════════════════════════════════')
    console.log('  🌱 LUMINUS — Sales Data Seeder (Maret 2026)')
    console.log('═══════════════════════════════════════════════════\n')

    // Level 1: Students
    const userIds = await seedStudents()

    // Level 2: Fetch products
    const { courses, plans } = await fetchProducts()

    // Level 3: Transactions
    const transactions = await seedTransactions(userIds, courses, plans)

    // Level 4: Enrollments
    await seedEnrollments(transactions)

    // Level 5: Subscriptions + Invoices
    await seedSubscriptions(transactions)

    // Level 6: Reviews
    await seedReviews()

    console.log('═══════════════════════════════════════════════════')
    console.log('  🎉 Sales seeding complete! Dashboard ready.')
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
