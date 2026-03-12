import { NextResponse } from 'next/server';
import { exportFinanceTransactions } from '@/services/finance.service';
import { verifySession } from '@/lib/auth';
import { format } from 'date-fns';

export async function GET(request: Request) {
    try {
        const session = await verifySession();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const monthParam = searchParams.get('month');
        const yearParam = searchParams.get('year');

        const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
        const month = monthParam === 'all' ? 'all' : (monthParam ? parseInt(monthParam) : new Date().getMonth());

        const transactions = await exportFinanceTransactions(month, year);

        // Build CSV string
        const headers = ['Date', 'Customer Name', 'Customer Email', 'Item', 'Type', 'Gross Amount', 'Tax (PPN 11%)', 'Net Amount', 'Status'];
        
        let csvContent = headers.join(',') + '\n';

        transactions.forEach(t => {
            const formattedDate = format(new Date(t.date), 'yyyy-MM-dd HH:mm:ss');
            // Escape quotes inside CSV fields
            const name = `"${t.customerName.replace(/"/g, '""')}"`;
            const email = `"${t.customerEmail.replace(/"/g, '""')}"`;
            const item = `"${t.item.replace(/"/g, '""')}"`;

            const row = [
                formattedDate,
                name,
                email,
                item,
                t.type,
                t.amount,
                t.tax,
                t.net,
                t.status
            ];

            csvContent += row.join(',') + '\n';
        });

        // Current date for filename
        const timeStr = format(new Date(), 'yyyyMMdd_HHmm');
        const filename = `financial_report_${year}_${month === 'all' ? 'all' : month}_${timeStr}.csv`;

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error('Error exporting finance data:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
