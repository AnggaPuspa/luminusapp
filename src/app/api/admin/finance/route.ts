import { NextResponse } from 'next/server';
import { getFinanceStats, getFinanceChartData, getFinanceTransactions } from '@/services/finance.service';
import { verifySession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const monthParam = searchParams.get('month');
        const yearParam = searchParams.get('year');
        const pageParam = searchParams.get('page');
        const searchParam = searchParams.get('search') || '';
        const typeParam = (searchParams.get('type') || 'all') as 'all' | 'COURSE' | 'SUBSCRIPTION';

        const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
        const month = monthParam === 'all' ? 'all' : (monthParam ? parseInt(monthParam) : new Date().getMonth());
        const page = pageParam ? parseInt(pageParam) : 1;

        const [stats, chartData, transactions] = await Promise.all([
            getFinanceStats(month, year),
            getFinanceChartData(month, year),
            getFinanceTransactions(month, year, page, 10, searchParam, typeParam)
        ]);

        return NextResponse.json({
            stats,
            chartData,
            transactions
        });

    } catch (error) {
        console.error('Error fetching finance data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
