import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from "date-fns";

// ─── Tax Config ──────────────────────────────────────────────
export const TAX_RATE = 0.11;

export function extractTax(amount: number): number {
    return Math.round(amount - (amount / (1 + TAX_RATE)));
}

// ─── Date Helpers ────────────────────────────────────────────
function getDateRange(month: number | "all", year: number) {
    if (month === "all") {
        return {
            start: startOfYear(new Date(year, 0, 1)),
            end: endOfYear(new Date(year, 0, 1)),
        };
    }
    return {
        start: startOfMonth(new Date(year, month as number, 1)),
        end: endOfMonth(new Date(year, month as number, 1)),
    };
}

function getPrevDateRange(month: number | "all", year: number) {
    if (month === "all") {
        return {
            start: startOfYear(subYears(new Date(year, 0, 1), 1)),
            end: endOfYear(subYears(new Date(year, 0, 1), 1)),
        };
    }
    const prevDate = subMonths(new Date(year, month as number, 1), 1);
    return {
        start: startOfMonth(prevDate),
        end: endOfMonth(prevDate),
    };
}

// ─── 1. Stats (7 lightweight aggregate queries in parallel) ──
export async function getFinanceStats(month: number | "all", year: number) {
    const { start, end } = getDateRange(month, year);
    const prevRange = getPrevDateRange(month, year);

    const dateFilter = { gte: start, lte: end };
    const prevDateFilter = { gte: prevRange.start, lte: prevRange.end };

    const [
        courseCurrent, subCurrent, couponCurrent,
        coursePrev, subPrev, couponPrev,
        activeSubscriptions
    ] = await Promise.all([
        prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { status: 'PAID', type: 'ONE_TIME', paidAt: dateFilter }
        }),
        prisma.subscriptionInvoice.aggregate({
            _sum: { amount: true },
            where: { status: 'PAID', paidAt: dateFilter }
        }),
        prisma.transaction.aggregate({
            _sum: { discountAmount: true },
            _count: { _all: true },
            where: { status: 'PAID', couponId: { not: null }, paidAt: dateFilter }
        }),
        prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { status: 'PAID', type: 'ONE_TIME', paidAt: prevDateFilter }
        }),
        prisma.subscriptionInvoice.aggregate({
            _sum: { amount: true },
            where: { status: 'PAID', paidAt: prevDateFilter }
        }),
        prisma.transaction.aggregate({
            _sum: { discountAmount: true },
            where: { status: 'PAID', couponId: { not: null }, paidAt: prevDateFilter }
        }),
        // MRR: only select what we need — no deep includes
        prisma.userSubscription.findMany({
            where: { status: 'ACTIVE' },
            select: { plan: { select: { monthlyPrice: true } } }
        })
    ]);

    const currentCourseRev = courseCurrent._sum.amount || 0;
    const currentSubRev = subCurrent._sum.amount || 0;
    const currentGrossRev = currentCourseRev + currentSubRev;
    const currentTaxCollected = extractTax(currentGrossRev);
    const currentNetRev = currentGrossRev - currentTaxCollected;

    const prevCourseRev = coursePrev._sum.amount || 0;
    const prevSubRev = subPrev._sum.amount || 0;
    const prevGrossRev = prevCourseRev + prevSubRev;
    const prevTaxCollected = extractTax(prevGrossRev);
    const prevNetRev = prevGrossRev - prevTaxCollected;

    const mrr = activeSubscriptions.reduce((acc, sub) => acc + sub.plan.monthlyPrice, 0);

    return {
        grossRevenue: { current: currentGrossRev, prev: prevGrossRev },
        taxCollected: { current: currentTaxCollected, prev: prevTaxCollected },
        netRevenue: { current: currentNetRev, prev: prevNetRev },
        courseRevenue: { current: currentCourseRev, prev: prevCourseRev },
        subscriptionRevenue: { current: currentSubRev, prev: prevSubRev },
        couponImpact: { current: couponCurrent._sum.discountAmount || 0, prev: couponPrev._sum.discountAmount || 0, count: couponCurrent._count._all || 0 },
        mrr: { current: mrr, subscribers: activeSubscriptions.length }
    };
}

// ─── 2. Chart Data (DB-level groupBy, zero in-memory loops) ──
export async function getFinanceChartData(month: number | "all", year: number) {
    const { start, end } = getDateRange(month, year);
    const dateFilter = { gte: start, lte: end };

    // Use Prisma groupBy to aggregate at DB level instead of fetching all rows
    const [courseGrouped, subGrouped] = await Promise.all([
        prisma.transaction.groupBy({
            by: ['paidAt'],
            _sum: { amount: true },
            where: { status: 'PAID', type: 'ONE_TIME', paidAt: dateFilter },
        }),
        prisma.subscriptionInvoice.groupBy({
            by: ['paidAt'],
            _sum: { amount: true },
            where: { status: 'PAID', paidAt: dateFilter },
        })
    ]);

    // Build a map keyed by label (month 1-12 or day 1-31)
    const map = new Map<number, { course: number; subscription: number }>();

    const getKey = (d: Date) => month === "all" ? d.getMonth() + 1 : d.getDate();

    for (const row of courseGrouped) {
        if (!row.paidAt) continue;
        const key = getKey(row.paidAt);
        const entry = map.get(key) || { course: 0, subscription: 0 };
        entry.course += row._sum.amount || 0;
        map.set(key, entry);
    }

    for (const row of subGrouped) {
        if (!row.paidAt) continue;
        const key = getKey(row.paidAt);
        const entry = map.get(key) || { course: 0, subscription: 0 };
        entry.subscription += row._sum.amount || 0;
        map.set(key, entry);
    }

    // Fill empty slots
    const totalSlots = month === "all" ? 12 : new Date(year, (month as number) + 1, 0).getDate();
    const chartData = [];
    for (let i = 1; i <= totalSlots; i++) {
        const entry = map.get(i) || { course: 0, subscription: 0 };
        chartData.push({ label: i, course: entry.course, subscription: entry.subscription });
    }

    return chartData;
}

// ─── 3. Transactions (DB-level pagination with skip/take) ────
export async function getFinanceTransactions(
    month: number | "all",
    year: number,
    page = 1,
    limit = 10,
    search = "",
    type: "all" | "COURSE" | "SUBSCRIPTION" = "all"
) {
    const { start, end } = getDateRange(month, year);
    const dateFilter = { gte: start, lte: end };
    const skip = (page - 1) * limit;

    // Determine which tables to query based on type filter
    const fetchCourses = type === "all" || type === "COURSE";
    const fetchSubs = type === "all" || type === "SUBSCRIPTION";

    // Build search filter for Prisma (push filtering to DB)
    const courseSearchFilter = search ? {
        OR: [
            { user: { name: { contains: search, mode: 'insensitive' as const } } },
            { user: { email: { contains: search, mode: 'insensitive' as const } } },
            { course: { title: { contains: search, mode: 'insensitive' as const } } },
        ]
    } : {};

    const subSearchFilter = search ? {
        OR: [
            { subscription: { user: { name: { contains: search, mode: 'insensitive' as const } } } },
            { subscription: { user: { email: { contains: search, mode: 'insensitive' as const } } } },
            { subscription: { plan: { name: { contains: search, mode: 'insensitive' as const } } } },
        ]
    } : {};

    // Get counts first (very fast), then only fetch the rows we need
    const [courseCount, subCount] = await Promise.all([
        fetchCourses
            ? prisma.transaction.count({
                where: { paidAt: dateFilter, status: 'PAID', ...courseSearchFilter }
            })
            : Promise.resolve(0),
        fetchSubs
            ? prisma.subscriptionInvoice.count({
                where: { paidAt: dateFilter, status: 'PAID', ...subSearchFilter }
            })
            : Promise.resolve(0),
    ]);

    const total = courseCount + subCount;
    const totalPages = Math.ceil(total / limit);

    // Smart pagination: determine which table(s) to pull rows from
    // For simplicity with cross-table merge + sort, we fetch limited rows from both
    // and do a small in-memory merge of only (skip + limit) rows max
    const fetchLimit = skip + limit; // Only fetch enough rows to cover the current page

    const [courseRows, subRows] = await Promise.all([
        fetchCourses
            ? prisma.transaction.findMany({
                where: { paidAt: dateFilter, status: 'PAID', ...courseSearchFilter },
                orderBy: { paidAt: 'desc' },
                take: fetchLimit,
                select: {
                    id: true, amount: true, status: true, paidAt: true, createdAt: true,
                    user: { select: { name: true, email: true } },
                    course: { select: { title: true } }
                }
            })
            : Promise.resolve([]),
        fetchSubs
            ? prisma.subscriptionInvoice.findMany({
                where: { paidAt: dateFilter, status: 'PAID', ...subSearchFilter },
                orderBy: { paidAt: 'desc' },
                take: fetchLimit,
                select: {
                    id: true, amount: true, status: true, paidAt: true, createdAt: true,
                    subscription: { select: { user: { select: { name: true, email: true } }, plan: { select: { name: true } } } }
                }
            })
            : Promise.resolve([]),
    ]);

    // Normalize — only the rows we fetched (capped at fetchLimit)
    const unified = [
        ...courseRows.map(t => {
            const tax = extractTax(t.amount);
            return {
                id: t.id,
                date: t.paidAt || t.createdAt,
                customerName: t.user.name,
                customerEmail: t.user.email,
                item: t.course.title,
                type: 'COURSE' as const,
                amount: t.amount,
                tax, net: t.amount - tax,
                status: t.status
            };
        }),
        ...subRows.map(i => {
            const tax = extractTax(i.amount);
            return {
                id: i.id,
                date: i.paidAt || i.createdAt,
                customerName: i.subscription.user.name,
                customerEmail: i.subscription.user.email,
                item: i.subscription.plan.name + ' Plan',
                type: 'SUBSCRIPTION' as const,
                amount: i.amount,
                tax, net: i.amount - tax,
                status: i.status
            };
        })
    ];

    // Sort only the small merged set, then slice for the page
    unified.sort((a, b) => b.date.getTime() - a.date.getTime());
    const paginated = unified.slice(skip, skip + limit);

    return { data: paginated, total, page, totalPages };
}

// ─── 4. Export (reuses getFinanceTransactions with high limit) ─
export async function exportFinanceTransactions(month: number | "all", year: number) {
    // For export, fetch all rows but still use DB-level ordering
    const data = await getFinanceTransactions(month, year, 1, 999999, "");
    return data.data;
}
