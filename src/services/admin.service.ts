import prisma from "@/lib/prisma";

export async function getAdminProfile(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
        }
    });
}

// ─── Types ───────────────────────────────────────────────────────

interface MonthlyRawRow {
    month: number;
    paid: number;
    pending: number;
}

interface YearRawRow {
    year: number;
}

export interface MonthlyActivity {
    monthName: string;
    paidCount: number;
    pendingCount: number;
}

export interface PopularCourse {
    id: string;
    title: string;
    enrollmentCount: number;
    percentage: number;
}

export interface PercentageChange {
    value: number;      // e.g. 15.5 or -4.2
    isPositive: boolean;
}

export interface DashboardStats {
    totalRevenue: number;
    revenueChange: PercentageChange;
    totalEnrollments: number;
    enrollmentChange: PercentageChange;
    activeStudents: number;
    studentChange: PercentageChange;
    recentFeedback: {
        id: string;
        rating: number;
        comment: string | null;
        createdAt: Date;
        user: { name: string; avatarUrl: string | null } | null;
    }[];
    latestTransactions: {
        id: string;
        amount: number;
        status: string;
        createdAt: Date;
        course: { title: string; slug: string; thumbnailUrl: string | null } | null;
        user: { name: string } | null;
    }[];
    totalTransactions: number;
    popularCourses: PopularCourse[];
    monthlyActivity: MonthlyActivity[];
    availableYears: number[];
}

// ─── Constants ───────────────────────────────────────────────────

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// ─── Monthly Activity (by Year) ─────────────────────────────────

export async function getMonthlyActivityByYear(year: number): Promise<MonthlyActivity[]> {
    const monthlyActivityRaw = await prisma.$queryRaw<MonthlyRawRow[]>`
        SELECT 
            CAST(EXTRACT(MONTH FROM "createdAt") AS INTEGER) AS month,
            CAST(COUNT(*) FILTER (WHERE status = 'PAID') AS INTEGER) AS paid,
            CAST(COUNT(*) FILTER (WHERE status = 'PENDING') AS INTEGER) AS pending
        FROM transactions
        WHERE EXTRACT(YEAR FROM "createdAt") = ${year}
        GROUP BY month
        ORDER BY month ASC
    `;

    // Initialize all 12 months with 0
    const months = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        paid: 0,
        pending: 0
    }));

    for (const row of monthlyActivityRaw) {
        const idx = row.month - 1;
        if (idx >= 0 && idx < 12) {
            months[idx].paid = row.paid;
            months[idx].pending = row.pending;
        }
    }

    return months.map(m => ({
        monthName: MONTH_NAMES[m.month - 1],
        paidCount: m.paid,
        pendingCount: m.pending
    }));
}

// ─── Shared Helpers ──────────────────────────────────────────────

function getMonthRange(date: Date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return { start, end };
}

function calcChange(current: number, previous: number): PercentageChange {
    if (previous === 0) {
        return { value: current > 0 ? 100 : 0, isPositive: current >= 0 };
    }
    const change = ((current - previous) / previous) * 100;
    return {
        value: Math.round(change * 10) / 10, // 1 decimal
        isPositive: change >= 0
    };
}

// ─── Dashboard Stats ─────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const thisMonth = getMonthRange(now);
    const lastMonth = getMonthRange(new Date(now.getFullYear(), now.getMonth() - 1, 1));

    const [
        revenueResult,
        totalEnrollments,
        activeStudents,
        recentFeedback,
        latestTransactions,
        totalTransactions,
        popularCoursesData,
        monthlyActivity,
        availableYearsRaw,
        revenueThisMonth,
        revenueLastMonth,
        enrollmentsThisMonth,
        enrollmentsLastMonth,
        studentsThisMonth,
        studentsLastMonth
    ] = await Promise.all([
        // 1. Total Revenue (sum transaksi PAID)
        prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { status: "PAID" }
        }),

        // 2. Total Enrollments
        prisma.enrollment.count(),

        // 3. Active Students (User dengan role STUDENT)
        prisma.user.count({
            where: { role: "STUDENT" }
        }),

        // 4. Recent Feedback (5 review terbaru beserta user)
        prisma.courseReview.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { name: true, avatarUrl: true }
                }
            }
        }),

        // 5. Latest Transactions (5 transaksi terakhir beserta course & user)
        prisma.transaction.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                course: {
                    select: { title: true, slug: true, thumbnailUrl: true }
                },
                user: {
                    select: { name: true }
                }
            }
        }),

        // 6. Total Transactions count (pagination)
        prisma.transaction.count(),

        // 7. Most Popular Courses (top 5 by enrollment count)
        prisma.course.findMany({
            where: { status: "PUBLISHED", deletedAt: null },
            select: {
                id: true,
                title: true,
                _count: { select: { enrollments: true } }
            },
            orderBy: { enrollments: { _count: 'desc' } },
            take: 5
        }),

        // 8. Monthly Enrollment Activity (current year)
        getMonthlyActivityByYear(currentYear),

        // 9. Available years yang punya transaksi
        prisma.$queryRaw<YearRawRow[]>`
            SELECT DISTINCT CAST(EXTRACT(YEAR FROM "createdAt") AS INTEGER) AS year 
            FROM transactions 
            ORDER BY year DESC
        `,

        // 10. Revenue bulan ini
        prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { status: "PAID", createdAt: { gte: thisMonth.start, lt: thisMonth.end } }
        }),

        // 11. Revenue bulan lalu
        prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { status: "PAID", createdAt: { gte: lastMonth.start, lt: lastMonth.end } }
        }),

        // 12. Enrollments bulan ini
        prisma.enrollment.count({
            where: { enrolledAt: { gte: thisMonth.start, lt: thisMonth.end } }
        }),

        // 13. Enrollments bulan lalu
        prisma.enrollment.count({
            where: { enrolledAt: { gte: lastMonth.start, lt: lastMonth.end } }
        }),

        // 14. Students joined bulan ini
        prisma.user.count({
            where: { role: "STUDENT", createdAt: { gte: thisMonth.start, lt: thisMonth.end } }
        }),

        // 15. Students joined bulan lalu
        prisma.user.count({
            where: { role: "STUDENT", createdAt: { gte: lastMonth.start, lt: lastMonth.end } }
        })
    ]);

    // Format Most Popular Courses
    const maxCount = popularCoursesData.length > 0 ? popularCoursesData[0]._count.enrollments : 1;
    const popularCourses: PopularCourse[] = popularCoursesData.map(course => ({
        id: course.id,
        title: course.title,
        enrollmentCount: course._count.enrollments,
        percentage: maxCount > 0 ? (course._count.enrollments / maxCount) * 100 : 0
    }));

    // Extract available years, pastikan current year selalu ada
    const availableYears = availableYearsRaw.map(row => row.year);
    if (!availableYears.includes(currentYear)) {
        availableYears.unshift(currentYear);
    }

    // Calculate month-over-month changes
    const revenueChange = calcChange(
        revenueThisMonth._sum.amount || 0,
        revenueLastMonth._sum.amount || 0
    );
    const enrollmentChange = calcChange(enrollmentsThisMonth, enrollmentsLastMonth);
    const studentChange = calcChange(studentsThisMonth, studentsLastMonth);

    return {
        totalRevenue: revenueResult._sum.amount || 0,
        revenueChange,
        totalEnrollments,
        enrollmentChange,
        activeStudents,
        studentChange,
        recentFeedback,
        latestTransactions,
        totalTransactions,
        popularCourses,
        monthlyActivity,
        availableYears
    };
}
